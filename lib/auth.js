const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function createSessionToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: SESSION_DURATION_SECONDS }
  );
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  SESSION_DURATION_SECONDS,
};
