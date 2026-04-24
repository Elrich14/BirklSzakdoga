const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GOOGLE_SCOPES } = require("../constants/constants");

module.exports = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_BASE_URL}/auth/google/callback`,
    scope: GOOGLE_SCOPES,
    state: true,
    pkce: true,
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, {
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      emailVerified: profile.emails?.[0]?.verified ?? false,
      displayName: profile.displayName,
    });
  }
);
