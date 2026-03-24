"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { secureFetch } from "@/lib/secureFetch";

/* ================= TYPES ================= */
type Photo = {
  id: string;
  imageUrl: string;
  status?: "draft" | "published";
  bibNumbers?: string[];
};

const COLUMN_COUNT = 5;
const ITEM_HEIGHT = 230;
const PAGE_SIZE = 15;

export default function EventPhotosPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const parentRef = useRef<HTMLDivElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bibMap, setBibMap] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  /* ================= FETCH ================= */
  const fetchPhotos = async (page = 1) => {
    setLoading(true);
    try {
      const res = await secureFetch(
        `/api/admin/events/${eventId}/photos?page=${page}&limit=15`,
      );
      const data = await res.json();

      setPhotos(data.photos || []);
      setTotalPages(data.totalPages || 1);
      setPageIndex(page);

      setSelected({});
      setBibMap({});
      setSelectAll(false);
      setActiveIndex(0);

      parentRef.current?.scrollTo({ top: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(pageIndex);
  }, [pageIndex]);

  /* ================= SELECT ================= */
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      else updated[id] = true;
      return updated;
    });
  };

  const selectedCount = Object.keys(selected).length;

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);

    if (checked) {
      const map: Record<string, boolean> = {};
      photos.forEach((p) => (map[p.id] = true));
      setSelected(map);
    } else {
      setSelected({});
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (photoId: string) => {
    const confirmDelete = confirm("Delete this photo?");
    if (!confirmDelete) return;

    try {
      const res = await secureFetch(`/api/admin/events/${eventId}/photos`, {
        method: "DELETE",
        body: JSON.stringify({ photoIds: [photoId] }),
      });

      const data = await res.json();

      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= TAG ================= */
  const moveNext = (index: number) => {
    if (index < photos.length - 1) {
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    index: number,
    photo: Photo,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const bibs = (bibMap[photo.id] || "")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      if (!bibs.length) return;

      await secureFetch(`/api/admin/events/${eventId}/photos/tag`, {
        method: "POST",
        body: JSON.stringify({
          photoIds: [photo.id],
          bibNumbers: bibs,
        }),
      });

      setSelected((p) => ({ ...p, [photo.id]: true }));
      moveNext(index);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    const ids = Object.keys(selected);
    if (!ids.length) return;

    setSaving(true);

    try {
      await Promise.all(
        ids.map((id) => {
          const bibs = (bibMap[id] || "")
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);

          if (!bibs.length) return null;

          return secureFetch(`/api/admin/events/${eventId}/photos/tag`, {
            method: "POST",
            body: JSON.stringify({
              photoIds: [id],
              bibNumbers: bibs,
            }),
          });
        }),
      );

      fetchPhotos(pageIndex);
    } finally {
      setSaving(false);
    }
  };
  /* ================= PRO PAGINATION ================= */
  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];

    const delta = 2; // how many pages around current
    const left = Math.max(1, pageIndex - delta);
    const right = Math.min(totalPages, pageIndex + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };
  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    await secureFetch(`/api/admin/events/${eventId}/photos`, {
      method: "POST",
      body: formData,
    });

    setFiles([]);
    fetchPhotos();
  };

  /* ================= ZOOM ================= */
  function ZoomImage({ src }: { src: string }) {
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      if (imgRef.current) {
        imgRef.current.style.transform = `
          scale(2.5)
          translate(${(0.5 - x) * 100}%, ${(0.5 - y) * 100}%)
        `;
      }
    };

    return (
      <div
        onMouseMove={handleMove}
        onMouseLeave={() => {
          if (imgRef.current) imgRef.current.style.transform = "scale(1)";
        }}
        className="h-28 md:h-32 w-full overflow-hidden"
      >
        <img
          ref={imgRef}
          src={src}
          className="w-full h-full object-cover transition-transform"
        />
      </div>
    );
  }

  /* ================= VIRTUAL ================= */
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(photos.length / COLUMN_COUNT),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
  });

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#0f172a] border-b px-3 md:px-4 py-2 flex flex-wrap items-center gap-2 md:gap-4">
        <h1 className="font-semibold text-sm md:text-base">Event Photos</h1>

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="text-xs md:text-sm"
        />

        <button
          onClick={handleUpload}
          className="bg-indigo-600 px-3 md:px-4 py-1.5 md:py-2 rounded text-sm whitespace-nowrap"
        >
          Upload
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          Select All
        </div>
      </div>

      {/* GRID */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto pb-24 px-2 md:px-3 lg:px-4"
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((row) => {
            const startIndex = row.index * COLUMN_COUNT;
            const items = photos.slice(startIndex, startIndex + COLUMN_COUNT);

            return (
              <div
                key={row.key}
                style={{
                  transform: `translateY(${row.start}px)`,
                  position: "absolute",
                  width: "100%",
                  height: ITEM_HEIGHT,
                }}
                className="flex gap-3 md:gap-4 lg:gap-5 px-1 md:px-2"
              >
                {items.map((photo, idx) => {
                  const index = startIndex + idx;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => {
                        toggleSelect(photo.id);
                        setActiveIndex(index);
                      }}
                      className={`mb-4 group relative flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden 
                shadow-[0_2px_6px_rgba(0,0,0,0.25)] 
                transition-all duration-200 ease-out
                hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)]
                hover:border-slate-700
                active:scale-[0.985]
                ${selected[photo.id] ? "ring-2 ring-indigo-500 border-indigo-500 shadow-indigo-500/10" : ""}`}
                    >
                      {/* DELETE */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                        className="absolute top-2 left-2 z-10 bg-red-600/90 hover:bg-red-500 
                  text-white text-[10px] px-2 py-0.5 rounded-md 
                  backdrop-blur-sm transition shadow"
                      >
                        Delete
                      </button>

                      {/* IMAGE */}
                      <div className="relative">
                        <ZoomImage src={photo.imageUrl} />

                        {/* premium overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />
                      </div>

                      {/* CONTENT */}
                      <div className="p-2.5 space-y-2">
                        <input
                          ref={(el) => {
                            if (el) inputRefs.current[index] = el;
                          }}
                          value={
                            bibMap[photo.id] ??
                            (photo.bibNumbers?.join(", ") || "")
                          }
                          onChange={(e) => {
                            toggleSelect(photo.id);
                            setBibMap((p) => ({
                              ...p,
                              [photo.id]: e.target.value,
                            }));
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, photo)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter bibs (e.g. 5933, 5964)"
                          className="w-full px-2.5 py-1.5 bg-slate-800/80 rounded-md 
                    text-xs md:text-sm 
                    focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-slate-800
                    placeholder:text-slate-500 
                    transition-all"
                        />

                        {photo.bibNumbers?.length ? (
                          <div
                            className="text-[11px] md:text-xs text-green-400 leading-tight 
                    bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20"
                          >
                            {photo.bibNumbers.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-3 md:px-4 flex items-center justify-between text-sm">
        {/* LEFT */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-medium text-white">Page {pageIndex}</span>
          <span className="text-slate-500">/ {totalPages}</span>
        </div>

        {/* CENTER PAGINATION */}
        <div className="hidden md:flex items-center gap-1.5">
          {getVisiblePages().map((p, i) => {
            if (p === "...") {
              return (
                <span key={i} className="px-2 text-slate-500 text-xs">
                  ...
                </span>
              );
            }

            const page = p as number;

            return (
              <button
                key={page}
                onClick={() => setPageIndex(page)}
                className={`min-w-[34px] h-8 px-2 rounded-md text-xs font-medium transition-all
          ${
            pageIndex === page
              ? "bg-indigo-600 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.6)]"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* PREV */}
          <button
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            disabled={pageIndex === 1}
            className={`px-3 py-1.5 rounded-md text-xs md:text-sm transition
      ${
        pageIndex === 1
          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
      }`}
          >
            ← Prev
          </button>

          {/* NEXT */}
          <button
            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
            disabled={pageIndex === totalPages}
            className={`px-3 py-1.5 rounded-md text-xs md:text-sm transition
      ${
        pageIndex === totalPages
          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
      }`}
          >
            Next →
          </button>

          {/* SELECTED */}
          <span className="text-slate-400 text-xs md:text-sm">
            Selected:{" "}
            <span className="text-white font-medium">{selectedCount}</span>
          </span>

          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={!selectedCount || saving}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm whitespace-nowrap transition
      ${
        selectedCount && !saving
          ? "bg-green-600 hover:bg-green-500 text-white shadow"
          : "bg-slate-700 text-slate-400 cursor-not-allowed"
      }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
