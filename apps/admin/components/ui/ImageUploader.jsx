"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadFile } from "@/lib/apiClient";
import Icon from "./Icon";

// Uploads travel as a base64 data URI inside a JSON body, which inflates the
// payload by a third and holds the whole file in memory. These limits must stay
// under `middlewareClientMaxBodySize` in next.config.js once inflated — 20MB of
// video encodes to roughly 27MB against a 32MB ceiling. Refuse oversized files
// up front rather than letting the request fail with a generic error, and a
// background loop has no business being this big anyway.
const MAX_MB = { image: 10, video: 20, raw: 20 };

export default function ImageUploader({ value, onChange, folder = "primevista", resourceType = "image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const limitMb = MAX_MB[resourceType] || 10;
    if (file.size > limitMb * 1024 * 1024) {
      toast.error(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${limitMb}MB. Compress it and try again.`,
      );
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const media = await uploadFile(file, { folder, resourceType });
      onChange(media);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {value?.url ? (
        resourceType === "video" ? (
          <video src={value.url} className="h-20 w-20 rounded-lg object-cover" muted />
        ) : (
          <img src={value.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
        )
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
          <Icon name="briefcase" className="h-6 w-6" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : value?.url ? "Replace" : "Upload"}
        </button>
        {value?.url && (
          <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={resourceType === "video" ? "video/*" : resourceType === "raw" ? ".glb,.gltf" : "image/*"}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
