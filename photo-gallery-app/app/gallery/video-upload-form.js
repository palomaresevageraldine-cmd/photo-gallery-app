"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VideoUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a video file first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption);

    setUploading(true);
    try {
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploading(false);
      router.refresh();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
      setUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input type="file" accept="video/mp4,video/webm,video/quicktime,video/ogg" ref={fileInputRef} />
      <input
        type="text"
        placeholder="Add a caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={300}
      />
      <button className="btn upload-btn" type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload video"}
      </button>
      {error && <div className="error-msg upload-error">{error}</div>}
    </form>
  );
}
