"use client";

interface Props {
  data: any;
  errors: Record<string, string>;
  onChange: (path: string, value: string) => void;
  bannerPreview: string | null;
  setBannerFile: (file: File | null) => void;
  setBannerPreview: (url: string | null) => void;
}
import { PhotoIcon, LinkIcon } from "@heroicons/react/24/outline";

export default function MediaSection({
  data,
  errors,
  onChange,
  bannerPreview,
  setBannerFile,
  setBannerPreview,
}: Props) {
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* ✅ FILE TYPE VALIDATION */
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WebP images are allowed.");
      return;
    }

    /* ✅ FILE SIZE VALIDATION (2MB) */
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("Banner must be under 2MB.");
      return;
    }

    /* ✅ IMAGE DIMENSION VALIDATION */
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;

      const requiredRatio = 16 / 9;
      const ratioTolerance = 0.02; // small tolerance

      /* ❌ Aspect Ratio Check */
      if (Math.abs(aspectRatio - requiredRatio) > ratioTolerance) {
        alert("Banner must be landscape 16:9 ratio (example: 1920x1080).");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      /* ❌ Minimum Resolution Check */
      if (width < 1280 || height < 720) {
        alert("Minimum resolution required is 1280x720.");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      /* ✅ VALID */
      setBannerFile(file);
      setBannerPreview(objectUrl);
    };

    img.onerror = () => {
      alert("Invalid image file.");
    };

    img.src = objectUrl;
  };

  return (
    <section className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Media & Social Configuration
        </h2>
        <p className="text-sm text-slate-400">
          Upload banner and configure public social links.
        </p>
      </div>

      {/* ================= BANNER ================= */}
      {/* ================= BANNER ================= */}
      <div>
        <label className="block text-sm text-slate-300 mb-3">
          Event Banner
        </label>

        <div className="relative border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-indigo-500 transition bg-slate-800/60">
          <PhotoIcon className="w-10 h-10 mx-auto text-indigo-400 mb-3" />

          <p className="text-sm text-slate-300">Click to upload banner image</p>
          <p className="text-xs text-slate-400 mt-2">
            Required: Landscape 16:9 ratio (1920x1080 recommended), Max 2MB
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {bannerPreview && (
          <div className="mt-6 relative">
            <img
              src={bannerPreview}
              alt="Preview"
              className="rounded-2xl border border-slate-700 w-full aspect-video object-cover shadow-xl"
            />

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
        )}
      </div>

      {/* ================= SOCIAL LINKS ================= */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Social Links
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: "facebook", label: "Facebook URL", color: "blue" },
            { key: "instagram", label: "Instagram URL", color: "pink" },
            { key: "youtube", label: "YouTube URL", color: "red" },
            { key: "whatsapp", label: "WhatsApp Link", color: "green" },
          ].map((item) => {
            const colorMap: any = {
              blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
              pink: "from-pink-500 to-purple-600 shadow-pink-500/30",
              red: "from-rose-500 to-red-600 shadow-red-500/30",
              green: "from-emerald-500 to-green-600 shadow-emerald-500/30",
            };

            return (
              <div key={item.key}>
                <label className="block text-xs text-slate-400 mb-2">
                  {item.label}
                </label>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br ${colorMap[item.color]} text-white shadow-md`}
                    >
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
                    className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
