"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon, FunnelIcon
} from "@heroicons/react/24/solid";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrophyIcon
} from "@heroicons/react/24/solid";
/* ================= TYPES ================= */
type Photo = {
  id: string;
  imageUrl: string;
  smallUrl?: string;
  mediumUrl?: string;
};

/* ================= PHOTO ITEM ================= */
const PhotoItem = React.memo(
  ({
    photo,
    index,
    onClick,
  }: {
    photo: Photo;
    index: number;
    onClick: (i: number) => void;
  }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="relative group cursor-pointer"
        onClick={() => onClick(index)}
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "200px",
        }}
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={photo.smallUrl || photo.imageUrl}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
            className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
          />

          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

          {/* DOWNLOAD BUTTON */}
          <a
            href={photo.mediumUrl || photo.imageUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </a>
        </div>

        {/* HOVER SHADOW */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 group-hover:ring-black/10 transition pointer-events-none" />
      </motion.div>
    );
  },
);
PhotoItem.displayName = "PhotoItem";

/* ================= MAIN ================= */
export default function PhotoPage() {
  const params = useParams();

  const [slug, setSlug] = useState("");
  const [bib, setBib] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  /* INIT */
  useEffect(() => {
    if (params?.slug) setSlug(params.slug as string);
  }, [params]);

  /* FETCH */
  const fetchPhotos = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      if (!reset && !hasMore) return;

      fetchingRef.current = true;
      setLoading(true);

      try {
        const query = new URLSearchParams({
          slug,
          ...(bib && { bib }),
          ...(!reset && cursor ? { cursor } : {}),
        });

        const res = await fetch(`/api/photos/search?${query}`);
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        setPhotos((prev) => {
          if (reset) return data.photos || [];

          const map = new Map(prev.map((p) => [p.id, p]));
          data.photos.forEach((p: Photo) => map.set(p.id, p));

          return Array.from(map.values());
        });

        setCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        console.error(err);
        setHasMore(false);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [slug, bib, cursor, hasMore],
  );

  const resetAndLoad = () => {
    setPhotos([]);
    setCursor(null);
    setHasMore(true);
    fetchPhotos(true);
  };

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (slug) resetAndLoad();
    }, 400);

    return () => clearTimeout(delay);
  }, [bib]);

  /* INITIAL LOAD */
  useEffect(() => {
    if (slug) resetAndLoad();
  }, [slug]);

  /* INFINITE SCROLL */
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchPhotos();
      },
      { rootMargin: "300px" },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchPhotos]);

  /* KEYBOARD NAV */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeIndex === null) return;

      if (e.key === "ArrowRight") {
        setActiveIndex((p) => (p! < photos.length - 1 ? p! + 1 : p));
      }

      if (e.key === "ArrowLeft") {
        setActiveIndex((p) => (p! > 0 ? p! - 1 : p));
      }

      if (e.key === "Escape") setActiveIndex(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, photos.length]);

return (
  <PageContainer>
    <Breadcrumb  />

    <PageHeader
      title="Photos"
      subtitle="Explore official race leaderboards and finishing times"
      icon={<TrophyIcon className="w-5 h-5" />}
    />

    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">

          {/* TOP ROW */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">

            {/* Title + Count */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                <span className="text-xl md:text-2xl font-bold  bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] bg-clip-text text-transparent">Photo Gallery</span>
              </h1>

              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {photos.length} photos
              </span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 w-full md:w-auto">

              {/* Input */}
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />

                <input
                  value={bib}
                  onChange={(e) => setBib(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter Bib Number"
                  className="w-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none pl-10 pr-4 py-2 rounded-lg transition"
                />

                <AnimatePresence>
                  {bib && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-11 w-full bg-white border rounded-lg shadow z-10"
                    >
                      {[bib, `${bib}1`, `${bib}2`].map((s) => (
                        <div
                          key={s}
                          onClick={() => setBib(s)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {s}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <button
                onClick={resetAndLoad}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:scale-95 transition"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Reset */}
              <button
                onClick={() => {
                  setBib("");
                  resetAndLoad();
                }}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 active:scale-95 transition"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FILTER SECTION */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 text-gray-400 min-w-fit">
              <FunnelIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Filters</span>
            </div>

            {["All", "5K", "10K", "Half Marathon", "Full Marathon"].map((f) => {
              const active = filter === f;

              return (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer relative px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap
                    ${
                      active
                        ? "text-white"
                        : "text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50"
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-red-600 rounded-full "
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  <span className="relative z-10">{f}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            index={index}
            onClick={setActiveIndex}
          />
        ))}
      </div>

      {/* EMPTY */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          No photos found
        </div>
      )}

      {/* LOADER */}
      {loading && (
        <div className="text-center py-6 text-gray-400">
          Loading...
        </div>
      )}

      <div ref={observerRef} />

      {/* MODAL */}
      <AnimatePresence>
        {activeIndex !== null && photos[activeIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          >
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 text-white"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <button
              onClick={() => setActiveIndex((p) => (p! > 0 ? p! - 1 : p))}
              className="absolute left-6 text-white"
            >
              <ChevronLeftIcon className="w-10 h-10" />
            </button>

            <motion.img
              key={photos[activeIndex].id}
              src={photos[activeIndex].mediumUrl || photos[activeIndex].imageUrl}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-h-[90%] max-w-[90%] rounded-lg"
            />

            <button
              onClick={() =>
                setActiveIndex((p) =>
                  p! < photos.length - 1 ? p! + 1 : p
                )
              }
              className="absolute right-6 text-white"
            >
              <ChevronRightIcon className="w-10 h-10" />
            </button>

            <a
              href={photos[activeIndex].mediumUrl || photos[activeIndex].imageUrl}
              download
              className="absolute bottom-6 bg-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </PageContainer>
);
}
