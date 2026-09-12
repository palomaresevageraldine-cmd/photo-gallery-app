import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const db = require("../../../../lib/db");
const { UPLOADS_DIR, ensureUploadsDir, getSessionFromCookieStore } = require("../../../../lib/uploads");

const ALLOWED_TYPES = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

export async function POST(request) {
  const session = getSessionFromCookieStore(cookies());
  if (!session) {
    return NextResponse.json({ error: "You need to be logged in to upload." }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = formData.get("video");
  const caption = formData.get("caption")?.toString().slice(0, 300) || "";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No video file was provided." }, { status: 400 });
  }

  const mimeType = file.type;
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload an MP4, WebM, MOV, or OGG video." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "That file is too large. Max size is 200 MB." },
      { status: 400 }
    );
  }

  ensureUploadsDir();

  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const destPath = path.join(UPLOADS_DIR, uniqueName);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(arrayBuffer));

  db.prepare(
    `INSERT INTO videos (filename, original_name, caption, mime_type, uploader_id, uploader_username)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uniqueName, file.name || uniqueName, caption, mimeType, session.userId, session.username);

  return NextResponse.json({ ok: true });
}
