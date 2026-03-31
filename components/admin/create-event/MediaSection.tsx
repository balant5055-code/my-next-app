"use client";

import { useState } from "react";
import { PhotoIcon, LinkIcon } from "@heroicons/react/24/outline";
import imageCompression from "browser-image-compression";
interface Props {
  data: any;
  errors: Record<string, string>;
  onChange: (path: string, value: any) => void;
  bannerPreview: string | null;
  setBannerFile: (file: File | null) => void;
  setBannerPreview: (url: string | null) => void;
  uploadProgress: number;
  setUploadProgress: (value: number) => void;
}

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
export default function MediaSection({
  data,
  errors,
  onChange,
  bannerPreview,
  setBannerFile,
  setBannerPreview,
  uploadProgress,
  setUploadProgress,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [overlay, setOverlay] = useState(0.3);

  const getSafeFolderName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };
  /* ==============================
        POSTER UPLOAD
  ============================== */

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadProgress > 0) {
      alert("Upload in progress...");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    /* ================= VALIDATE TYPE ================= */
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG or WebP images allowed.");
      return;
    }

    try {
      /* ================= COMPRESS ================= */
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85, // 🔥 better quality
      };

      const compressedFile = await imageCompression(file, options);

      if (compressedFile.size > 800 * 1024) {
        alert("Compressed image still too large.");
        return;
      }

      /* ================= UPLOAD WITH PROGRESS ================= */
      const folder = data.slug || getSafeFolderName(data.name || "event");

      try {
        const oldRef = ref(storage, `event-banners/${folder}/banner.webp`);
        await deleteObject(oldRef);
      } catch (err) {
        console.warn("Old image delete failed", err);
      }

      const fileName = `event-banners/${folder}/banner.webp`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error(error);
          alert("Upload failed");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          /* ================= SAVE ================= */
          setBannerPreview(downloadURL);
          setBannerFile(null);
          onChange("bannerURL", downloadURL);

          setUploadProgress(0);
        },
      );
    } catch (err) {
      console.error("Compression error:", err);
      alert("Image processing failed");
    }
  };
  /* ==============================
        RESET CONTROLS
  ============================== */

  const resetControls = () => {
    setZoom(1);
    setPosX(0);
    setPosY(0);
    setOverlay(0.3);
  };

  /* ==============================
        SAVE VIEWER SETTINGS
  ============================== */

  const saveViewerSettings = () => {
    onChange("bannerViewer", {
      zoom,
      posX,
      posY,
      overlayOpacity: overlay,
    });
  };

  return (
    <section className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-10">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Media & Poster Configuration
        </h2>

        <p className="text-sm text-slate-400">
          Upload event poster and adjust how it appears on the event page.
        </p>
      </div>

      {/* ==============================
            POSTER UPLOAD
      ============================== */}

      <div>
        <label className="block text-sm text-slate-300 mb-3">
          Event Poster
        </label>

        {!bannerPreview && (
          <div className="relative border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center hover:border-indigo-500 transition bg-slate-800/60">
            <PhotoIcon className="w-10 h-10 mx-auto text-indigo-400 mb-3" />

            <p className="text-sm text-slate-300">
              Click to upload event poster
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Any orientation supported (portrait / landscape). Recommended
              resolution: 1200px+ width.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}
        {uploadProgress > 0 && (
          <div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
        {/* ==============================
              POSTER PREVIEW EDITOR
        ============================== */}

        {bannerPreview && (
          <div className="space-y-6">
            {/* HERO PREVIEW */}

            <div className="relative h-[420px] rounded-2xl overflow-hidden bg-black border border-slate-700">
              {/* BLUR BACKGROUND */}

              <img
                src={bannerPreview}
                className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-60"
              />

              {/* OVERLAY */}

              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlay }}
              />

              {/* MAIN POSTER */}

              <img
                src={bannerPreview}
                className="absolute left-1/2 top-1/2 max-h-[380px] object-contain"
                style={{
                  transform: `translate(-50%, -50%) scale(${zoom}) translate(${posX}px, ${posY}px)`,
                }}
              />

              {/* REMOVE BUTTON */}

              <button
                onClick={() => {
                  setBannerFile(null);
                  setBannerPreview(null);
                }}
                className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1 rounded-lg"
              >
                Remove
              </button>
            </div>

            {/* ==============================
                  CONTROL PANEL
            ============================== */}

            <div className="grid md:grid-cols-2 gap-6">
              {/* ZOOM */}

              <div>
                <label className="text-xs text-slate-400">Zoom</label>

                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* OVERLAY */}

              <div>
                <label className="text-xs text-slate-400">
                  Background Overlay
                </label>

                <input
                  type="range"
                  min="0"
                  max="0.7"
                  step="0.01"
                  value={overlay}
                  onChange={(e) => setOverlay(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* POSITION X */}

              <div>
                <label className="text-xs text-slate-400">
                  Horizontal Position
                </label>

                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* POSITION Y */}

              <div>
                <label className="text-xs text-slate-400">
                  Vertical Position
                </label>

                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="flex gap-3">
              <button
                onClick={resetControls}
                className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Reset
              </button>

              <button
                onClick={saveViewerSettings}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Apply Viewer Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==============================
            SOCIAL LINKS
      ============================== */}

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Social Links
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: "facebook", label: "Facebook URL" },
            { key: "instagram", label: "Instagram URL" },
            { key: "youtube", label: "YouTube URL" },
            { key: "whatsapp", label: "WhatsApp Link" },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-xs text-slate-400 mb-2">
                {item.label}
              </label>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-600 text-white">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                </div>

                <input
                  type="text"
                  value={data.socialLinks?.[item.key] || ""}
                  onChange={(e) =>
                    onChange(`socialLinks.${item.key}`, e.target.value)
                  }
                  placeholder={item.label}
                  className="w-full pl-14 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
