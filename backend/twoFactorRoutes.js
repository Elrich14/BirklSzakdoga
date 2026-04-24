const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const QRCode = require("qrcode");

const User = require("./models/user");
const authenticateToken = require("./authenticateToken");
const { encryptSecret, decryptSecret } = require("./utils/totpCrypto");
const { rateLimit2FA, recordAttempt } = require("./rateLimit2FA");
const { TOKEN_SCOPES } = require("./constants/constants");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;
const ISSUER = "Kerian";

authenticator.options = {
  algorithm: "sha1",
  digits: 6,
  step: 30,
  window: 1,
};

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRecoveryCode = () => {
  const pickChar = () => {
    const index = crypto.randomInt(0, RECOVERY_CODE_CHARSET.length);
    return RECOVERY_CODE_CHARSET[index];
  };
  let code = "";
  for (let position = 0; position < 8; position++) {
    if (position === 4) code += "-";
    code += pickChar();
  }
  return code;
};

const generateRecoveryCodes = () => {
  const plaintextCodes = [];
  for (let index = 0; index < RECOVERY_CODE_COUNT; index++) {
    plaintextCodes.push(generateRecoveryCode());
  }
  const hashedCodes = plaintextCodes.map((code) => ({
    hash: bcrypt.hashSync(code, 10),
    usedAt: null,
  }));
  return { plaintextCodes, hashedCodes };
};

const isRecoveryCodeFormat = (input) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(input);

const consumeRecoveryCode = (user, inputCode) => {
  const codes = user.twoFactorRecoveryCodes || [];
  for (let index = 0; index < codes.length; index++) {
    const entry = codes[index];
    if (entry.usedAt !== null) continue;
    if (bcrypt.compareSync(inputCode, entry.hash)) {
      codes[index] = { ...entry, usedAt: new Date().toISOString() };
      user.twoFactorRecoveryCodes = codes;
      return true;
    }
  }
  return false;
};

router.post("/setup", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, ISSUER, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    user.twoFactorSecret = encryptSecret(secret);
    user.twoFactorEnabled = false;
    await user.save();

    res.json({ qrCodeDataUrl, manualEntryKey: secret });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate 2FA setup" });
  }
});

router.post("/enable", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    const user = await User.findByPk(req.user.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "No pending 2FA setup" });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = authenticator.verify({ token: code, secret });
    if (!isValid) {
      return res.status(401).json({ error: "Invalid code" });
    }

    const { plaintextCodes, hashedCodes } = generateRecoveryCodes();
    user.twoFactorEnabled = true;
    user.twoFactorRecoveryCodes = hashedCodes;
    await user.save();

    res.json({ recoveryCodes: plaintextCodes });
  } catch (err) {
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
});

router.post("/disable", authenticateToken, async (req, res) => {
  try {
    const { password, code } = req.body;
    if (!password || !code) {
      return res.status(400).json({ error: "Password and code required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const rateLimit = await rateLimit2FA(user.id);
    if (rateLimit.locked) {
      return res.status(429).json({
        error: "Too many attempts",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) {
      await recordAttempt(user.id, false);
      return res.status(401).json({ error: "Invalid password" });
    }

    let codeValid = false;
    if (isRecoveryCodeFormat(code)) {
      codeValid = consumeRecoveryCode(user, code);
    } else {
      const secret = decryptSecret(user.twoFactorSecret);
      codeValid = authenticator.verify({ token: code, secret });
    }

    if (!codeValid) {
      await recordAttempt(user.id, false);
      return res.status(401).json({ error: "Invalid code" });
    }

    user.twoFactorSecret = null;
    user.twoFactorEnabled = false;
    user.twoFactorRecoveryCodes = null;
    await user.save();

    await recordAttempt(user.id, true);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
});

router.post("/recovery-codes/regenerate", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    const user = await User.findByPk(req.user.id);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const rateLimit = await rateLimit2FA(user.id);
    if (rateLimit.locked) {
      return res.status(429).json({
        error: "Too many attempts",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = authenticator.verify({ token: code, secret });
    if (!isValid) {
      await recordAttempt(user.id, false);
      return res.status(401).json({ error: "Invalid code" });
    }

    const { plaintextCodes, hashedCodes } = generateRecoveryCodes();
    user.twoFactorRecoveryCodes = hashedCodes;
    await user.save();

    await recordAttempt(user.id, true);
    res.json({ recoveryCodes: plaintextCodes });
  } catch (err) {
    res.status(500).json({ error: "Failed to regenerate recovery codes" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (decoded.scope !== TOKEN_SCOPES.TWO_FA_PENDING) {
      return res.status(401).json({ error: "Invalid token scope" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled for this user" });
    }

    const rateLimit = await rateLimit2FA(user.id);
    if (rateLimit.locked) {
      return res.status(429).json({
        error: "Too many attempts",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
    }

    let codeValid = false;
    if (isRecoveryCodeFormat(code)) {
      codeValid = consumeRecoveryCode(user, code);
      if (codeValid) await user.save();
    } else {
      const secret = decryptSecret(user.twoFactorSecret);
      codeValid = authenticator.verify({ token: code, secret });
    }

    if (!codeValid) {
      await recordAttempt(user.id, false);
      return res.status(401).json({ error: "Invalid code" });
    }

    await recordAttempt(user.id, true);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

router.get("/status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const remainingRecoveryCodes = (user.twoFactorRecoveryCodes || []).filter(
      (entry) => entry.usedAt === null
    ).length;

    res.json({
      enabled: user.twoFactorEnabled,
      remainingRecoveryCodes,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

module.exports = router;
