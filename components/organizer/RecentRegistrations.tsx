"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowPathIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function RecentRegistrations({ eventId }: { eventId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const previousIds = useRef<Set<string>>(new Set());

  // 🔊 Sound Notification
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3"); // place file in public/
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/organizer/recent-registrations?eventId=${eventId}`,
      );

      const json = await res.json();
      const newData = Array.isArray(json) ? json : [];

      const newIds = newData.map((item) => item.id);
      const hasNew = newIds.some((id) => !previousIds.current.has(id));

      if (hasNew && previousIds.current.size > 0) {
        setShowToast(true);
        playNotificationSound(); // 🔊 play sound
        setTimeout(() => setShowToast(false), 2000);
      }

      previousIds.current = new Set(newIds);
      setData(newData);

      setLastUpdated(new Date());
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 600);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleScroll = () => {
    if (!listRef.current) return;
    setHasScrolled(listRef.current.scrollTop > 0);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 right-3 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg z-20"
          >
            New registration received
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div
        className={`sticky top-0 z-10 bg-white px-2 pt-2 pb-3 transition-shadow ${
          hasScrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Activity
            </h3>

            {/* Count Badge */}
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {data.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh"
              className={`relative p-1.5 rounded-md transition
                ${refreshSuccess ? "bg-green-50" : ""}
                hover:bg-gray-100`}
            >
              <ArrowPathIcon
                className={`h-4 w-4 text-gray-400 transition-transform duration-300
                  hover:rotate-180
                  ${loading ? "animate-spin text-gray-600" : ""}`}
              />

              {refreshSuccess && (
                <span className="absolute inset-0 rounded-md border border-green-300 animate-ping opacity-50" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="overflow-y-auto px-2 public-scroll"
        style={{ maxHeight: "420px" }}
      >
        {loading ? (
          <div className="space-y-4 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="space-y-2 w-2/3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !data.length ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            No recent registrations
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence initial={false}>
              {data.map((item, index) => {
                const isConfirmed = item.status === "CONFIRMED";
                const isNewest =
                  item.createdAt &&
                  Date.now() - new Date(item.createdAt).getTime() <
                    60 * 60 * 1000;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`py-4 transition-all duration-300 ${
                      isNewest ? "bg-green-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-5">
                          {index + 1}.
                        </span>

                        <UserCircleIcon className="h-5 w-5 text-gray-400" />

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.firstName} {item.lastName}
                            </p>

                            {isNewest && (
                              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                NEW
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <span
                          className={`text-xs font-medium ${
                            isConfirmed ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.createdAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
