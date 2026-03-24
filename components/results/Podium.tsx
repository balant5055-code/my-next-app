"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  TrophyIcon,
  UserIcon,
  MapPinIcon,
  IdentificationIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Runner {
  id: string;
  name: string;
  bib: string;
  chip: string;
  club?: string;
  city?: string;
  country?: string;
  photo?: string;
}

interface Filters {
  distance: string;
  gender: string;
  category: string;
}

export default function Podium({
  eventId,
  filters,
}: {
  eventId?: string;
  filters: Filters;
}) {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId || !filters.distance) return;

    async function loadPodium() {
      setLoading(true);

      const url =
        `/api/results/podium?eventId=${eventId}` +
        `&distance=${filters.distance}` +
        `&gender=${filters.gender}` +
        `&category=${filters.category}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success) setRunners(data.runners || []);
      else setRunners([]);

      setLoading(false);
    }

    loadPodium();
  }, [eventId, filters]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">Loading winners...</div>
    );
  }

  if (!runners.length) {
    return (
      <div className="py-20 text-center text-gray-400">
        Winners not available
      </div>
    );
  }

  const [first, second, third] = runners;

  const avatar = (name: string) => name?.charAt(0).toUpperCase();

  const Avatar = ({ runner, size }: any) =>
    runner.photo ? (
      <img
        src={runner.photo}
        className={`${size} rounded-full object-cover ring-2 ring-gray-100`}
      />
    ) : (
      <div
        className={`${size}
        rounded-full bg-gray-100 flex items-center justify-center
        font-semibold text-gray-700 ring-2 ring-gray-100`}
      >
        {avatar(runner.name)}
      </div>
    );

  const RunnerInfo = ({ runner }: any) => (
    <div className="flex flex-col items-center gap-1 mt-3">
      <div className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
        <UserIcon className="w-4 h-4 text-gray-400" />
        {runner.name}
      </div>

      {(runner.club || runner.city) && (
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <MapPinIcon className="w-3 h-3" />
          {runner.club} • {runner.city}
        </div>
      )}

      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <IdentificationIcon className="w-3 h-3" />
        Bib {runner.bib}
      </div>

      <div className="flex items-center gap-1 text-xs font-medium px-3 py-[3px] rounded bg-gray-100 text-gray-700">
        <ClockIcon className="w-3 h-3" />
        {runner.chip}
      </div>
    </div>
  );

  return (
    <section className="pt-6 pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <TrophyIcon className="w-6 h-6 text-red-500" />

          <div className="text-left">
            <h2 className="text-2xl font-semibold text-gray-900">
              Race Winners
            </h2>

            <p className="text-xs tracking-widest uppercase text-gray-400">
              Podium Finishers
            </p>
          </div>
        </div>

        {/* Podium */}

        {/* PODIUM STAGE */}

        <div className="relative flex items-end justify-center gap-12 flex-wrap sm:flex-nowrap pt-20">
          {/* stage base */}

          <div
            className="
  absolute bottom-0 left-0 right-0
  h-8
  bg-gradient-to-r from-gray-100 via-white to-gray-100
  rounded-xl
  shadow-inner
  "
          />

          {/* SECOND */}

          {second && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col items-center w-[200px]"
            >
              <Avatar runner={second} size="w-16 h-16" />

              <RunnerInfo runner={second} />

              <div
                className="
        mt-6 w-full h-24
        bg-gradient-to-b from-gray-200 to-gray-300
        rounded-t-xl
        shadow-lg
        flex flex-col items-center justify-center
        text-gray-700
        font-semibold
        relative
      "
              >
                {/* reflection */}

                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/30 blur-sm" />

                <div className="text-lg font-bold">2</div>

                <div className="text-[11px] uppercase tracking-wide opacity-80">
                  Elite Finisher
                </div>
              </div>
            </motion.div>
          )}

          {/* FIRST */}

          {first && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex flex-col items-center w-[240px]"
            >
              {/* stage spotlight */}

              <div
                className="
      absolute -top-12
      w-44 h-44
      bg-red-200/40
      blur-3xl
      rounded-full
      "
              />

              {/* floating badge */}

              <div
                className="
      absolute -top-10
      px-4 py-1
      text-[11px]
      font-semibold
      text-white
      bg-gradient-to-r from-orange-500 to-red-500
      rounded-full
      shadow-lg
      "
              >
                Champion
              </div>

              <Avatar runner={first} size="w-20 h-20" />

              <RunnerInfo runner={first} />

              <div
                className="
        mt-6 w-full h-32
        bg-gradient-to-r from-orange-500 to-red-500
        rounded-t-xl
        shadow-2xl
        flex flex-col items-center justify-center
        text-white
        font-semibold
        relative
      "
              >
                {/* reflection */}

                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/30 blur-sm" />

                <div className="text-2xl font-bold">1</div>

                <div className="text-[11px] uppercase tracking-wide opacity-90">
                  Champion
                </div>
              </div>
            </motion.div>
          )}

          {/* THIRD */}

          {third && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col items-center w-[200px]"
            >
              <Avatar runner={third} size="w-16 h-16" />

              <RunnerInfo runner={third} />

              <div
                className="
        mt-6 w-full h-20
        bg-gradient-to-b from-gray-100 to-gray-200
        rounded-t-xl
        shadow
        flex flex-col items-center justify-center
        text-gray-600
        font-semibold
        relative
      "
              >
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 blur-sm" />

                <div className="text-lg font-bold">3</div>

                <div className="text-[11px] uppercase tracking-wide opacity-80">
                  Rising Runner
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
