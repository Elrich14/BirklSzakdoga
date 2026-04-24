const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/user");
const handoff = require("./handoffStore");
const {
  PENDING_TOKEN_TTL,
  JWT_TTL,
  OAUTH_RATE_LIMIT_WINDOW_MS,
  OAUTH_RATE_LIMIT_MAX,
  TOKEN_SCOPES,
  AUTH_PROVIDERS,
  OAUTH_ERROR_CODES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} = require("../constants/constants");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;
const FRONTEND = process.env.FRONTEND_BASE_URL;

const oauthLimiter = rateLimit({
  windowMs: OAUTH_RATE_LIMIT_WINDOW_MS,
  max: OAUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
    SECRET,
    { expiresIn: JWT_TTL }
  );
}

function redirectError(res, code) {
  return res.redirect(`${FRONTEND}/login?error=${code}`);
}

router.get(
  "/google",
  oauthLimiter,
  passport.authenticate("google", { session: false })
);

router.get(
  "/google/callback",
  oauthLimiter,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_BASE_URL}/login?error=${OAUTH_ERROR_CODES.OAUTH_FAILED}`,
  }),
  async (req, res) => {
    try {
      const { googleId, email, emailVerified, displayName } = req.user;

      if (!emailVerified) {
        return redirectError(res, OAUTH_ERROR_CODES.EMAIL_NOT_VERIFIED);
      }

      let user = await User.findOne({ where: { googleId } });
      if (user) {
        if (user.role === "admin") {
          return redirectError(res, OAUTH_ERROR_CODES.ADMIN_NO_GOOGLE);
        }
        if (user.email !== email) {
          await user.update({ email });
        }
        const token = issueToken(user);
        const code = handoff.put({ kind: "token", token });
        return res.redirect(`${FRONTEND}/login/google?handoff=${code}`);
      }

      const emailClash = await User.findOne({ where: { email } });
      if (emailClash) {
        return redirectError(res, OAUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED);
      }

      const pendingToken = jwt.sign(
        {
          googleId,
          email,
          displayName,
          scope: TOKEN_SCOPES.GOOGLE_PENDING,
        },
        SECRET,
        { expiresIn: PENDING_TOKEN_TTL }
      );
      const code = handoff.put({ kind: "pending", pendingToken });
      return res.redirect(`${FRONTEND}/login/google?handoff=${code}`);
    } catch (err) {
      console.error("[oauth] callback error:", err);
      return redirectError(res, OAUTH_ERROR_CODES.OAUTH_FAILED);
    }
  }
);

router.post("/google/exchange", oauthLimiter, (req, res) => {
  const { handoff: code } = req.body;
  const payload = handoff.takeOnce(code);
  if (!payload) {
    return res
      .status(400)
      .json({ error: OAUTH_ERROR_CODES.HANDOFF_INVALID_OR_EXPIRED });
  }
  if (payload.kind === "token") {
    return res.json({ token: payload.token });
  }
  return res.json({
    pendingToken: payload.pendingToken,
    needsUsername: true,
  });
});

router.get("/username-available", oauthLimiter, async (req, res) => {
  const { username } = req.query;
  if (
    typeof username !== "string" ||
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return res.json({
      available: false,
      reason: OAUTH_ERROR_CODES.USERNAME_INVALID_LENGTH,
    });
  }
  if (!USERNAME_PATTERN.test(username)) {
    return res.json({
      available: false,
      reason: OAUTH_ERROR_CODES.USERNAME_INVALID_CHARS,
    });
  }
  const exists = await User.findOne({ where: { username } });
  res.json({ available: !exists });
});

router.post("/google/complete", oauthLimiter, async (req, res) => {
  const { pendingToken, username } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(pendingToken, SECRET);
  } catch {
    return res
      .status(401)
      .json({ error: OAUTH_ERROR_CODES.PENDING_TOKEN_INVALID });
  }
  if (decoded.scope !== TOKEN_SCOPES.GOOGLE_PENDING) {
    return res
      .status(401)
      .json({ error: OAUTH_ERROR_CODES.PENDING_TOKEN_WRONG_SCOPE });
  }

  if (
    typeof username !== "string" ||
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return res
      .status(400)
      .json({ error: OAUTH_ERROR_CODES.USERNAME_INVALID_LENGTH });
  }
  if (!USERNAME_PATTERN.test(username)) {
    return res
      .status(400)
      .json({ error: OAUTH_ERROR_CODES.USERNAME_INVALID_CHARS });
  }

  try {
    const user = await User.create({
      username,
      email: decoded.email,
      googleId: decoded.googleId,
      authProvider: AUTH_PROVIDERS.GOOGLE,
      password: null,
      role: "user",
    });
    const token = issueToken(user);
    return res.json({ token });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: OAUTH_ERROR_CODES.USERNAME_TAKEN });
    }
    console.error("[oauth] complete error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;
