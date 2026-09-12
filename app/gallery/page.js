import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
const db = require("../../lib/db");
const { verifySessionToken, COOKIE_NAME } = require("../../lib/auth");
import LogoutButton from "./logout-button";
import VideoUploadForm from "./video-upload-form";

function getPhotos() {
  const manifestPath = path.join(process.cwd(), "public", "images", "images.json");
  if (!fs.existsSync(manifestPath)) return [];
  const raw = fs.readFileSync(manifestPath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getVideos() {
  return db.getVideos();
}

export default function GalleryPage() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  const photos = getPhotos();
  const videos = getVideos();

  return (
    <div>
      <div className="gallery-header">
        <h1>Gallery{session ? ` — welcome, ${session.username}` : ""}</h1>
        <LogoutButton />
      </div>

      <VideoUploadForm />

      <div className="gallery-grid">
        {photos.length === 0 && videos.length === 0 && (
          <p style={{ color: "#9aa0aa", padding: "0 8px" }}>
            No photos or videos yet. Add image files to <code>/public/images</code> (listed in{" "}
            <code>/public/images/images.json</code>), or upload a video above.
          </p>
        )}
        {photos.map((photo) => (
          <div className="photo-card" key={photo.file}>
            <img src={`/images/${photo.file}`} alt={photo.caption || photo.file} />
            {photo.caption && <div className="caption">{photo.caption}</div>}
          </div>
        ))}
        {videos.map((video) => (
          <div className="photo-card" key={video.filename}>
            <video controls preload="metadata" src={`/api/media/${video.filename}`} />
            <div className="caption">
              {video.caption || video.original_name}
              <span className="uploader"> — uploaded by {video.uploader_username}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
