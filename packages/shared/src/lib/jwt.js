const jwt = require("jsonwebtoken");

const ADMIN_COOKIE_NAME = "pv_admin_token";
const TOKEN_TTL = "7d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the environment");
  return secret;
}

function signAdminToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

function verifyAdminToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

module.exports = { signAdminToken, verifyAdminToken, ADMIN_COOKIE_NAME };
