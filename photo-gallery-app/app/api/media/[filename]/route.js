import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";

const { UPLOADS_DIR, getSessionFromCookieStore } = require("../../../../lib/uploads");

const MIME_BY_EXT = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  ogv: "video/ogg",
};

export async function GET(request, { params }) {
  const session = getSessionFromCookieStore(cookies());
  if (!session) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const filename = params.filename;
  // Guard against path traversal - only allow simple filenames we generated ourselves.
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ext = filename.split(".").pop().toLowerCase();
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const stat = fs.statSync(filePath);
  const nodeStream = fs.createReadStream(filePath);
  const webStream = require("stream").Readable.toWeb(nodeStream);

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
