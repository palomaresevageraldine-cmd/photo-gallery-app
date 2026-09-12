const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const videosFile = path.join(dataDir, "videos.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJSON(file) {
  ensureDataDir();
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getUsers() {
  return readJSON(usersFile);
}

function getUserByUsername(username) {
  return getUsers().find((u) => u.username === username) || null;
}

function addUser({ username, passwordHash }) {
  const users = getUsers();
  const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const user = {
    id: nextId,
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  writeJSON(usersFile, users);
  return user;
}

function getVideos() {
  return readJSON(videosFile).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

function addVideo({ filename, originalName, caption, mimeType, uploaderId, uploaderUsername }) {
  const videos = readJSON(videosFile);
  const nextId = videos.length ? Math.max(...videos.map((v) => v.id)) + 1 : 1;
  const record = {
    id: nextId,
    filename,
    original_name: originalName,
    caption,
    mime_type: mimeType,
    uploader_id: uploaderId,
    uploader_username: uploaderUsername,
    created_at: new Date().toISOString(),
  };
  videos.push(record);
  writeJSON(videosFile, videos);
  return record;
}

module.exports = {
  getUserByUsername,
  addUser,
  getVideos,
  addVideo,
};
