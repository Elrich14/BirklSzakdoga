const { Op } = require("sequelize");
const TwoFactorAttempt = require("./models/twoFactorAttempt");

const MAX_FAILURES = 5;
const WINDOW_MINUTES = 15;

const rateLimit2FA = async (userId) => {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const failureCount = await TwoFactorAttempt.count({
    where: {
      userId,
      succeeded: false,
      createdAt: { [Op.gte]: windowStart },
    },
  });

  if (failureCount >= MAX_FAILURES) {
    const oldestFailure = await TwoFactorAttempt.findOne({
      where: {
        userId,
        succeeded: false,
        createdAt: { [Op.gte]: windowStart },
      },
      order: [["createdAt", "ASC"]],
    });

    const lockoutEnd = new Date(
      oldestFailure.createdAt.getTime() + WINDOW_MINUTES * 60 * 1000
    );
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((lockoutEnd.getTime() - Date.now()) / 1000)
    );

    return { locked: true, retryAfterSeconds };
  }

  return { locked: false };
};

const recordAttempt = async (userId, succeeded) => {
  await TwoFactorAttempt.create({ userId, succeeded });
};

module.exports = { rateLimit2FA, recordAttempt };
