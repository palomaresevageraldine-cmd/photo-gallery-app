const path = require("path");
const fs = require("fs");
const { verifySessionToken, COOKIE_NAME } = require("./auth");

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads", "videos");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function getSessionFromCookieStore(cookieStore) {
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

module.exports = {
  UPLOADS_DIR,
  ensureUploadsDir,
  getSessionFromCookieStore,
};
