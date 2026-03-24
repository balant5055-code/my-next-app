"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function Leaderboard({ eventId, eventSlug, filters }: any) {
  const router = useRouter();

  const [runners, setRunners] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* -----------------------------
     LOAD RUNNERS
  ----------------------------- */

  async function loadRunners() {
    if (!eventId || !filters?.distance) return;

    const url =
      `/api/results/leaderboard?eventId=${eventId}` +
      `&distance=${filters.distance}` +
      `&gender=${filters.gender}` +
      `&category=${filters.category}` +
      `&page=${page}` +
      `&limit=${PAGE_SIZE}` +
      `&search=${search}`;

    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setRunners(data.runners || []);
        setTotal(data.total || 0);
      } else {
        setRunners([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setRunners([]);
      setTotal(0);
    }
  }

  /* -----------------------------
     RESET PAGE WHEN FILTER CHANGES
  ----------------------------- */

  useEffect(() => {
    setPage(1);
  }, [filters?.distance, filters?.gender, filters?.category]);

  /* -----------------------------
     LOAD DATA
  ----------------------------- */

  useEffect(() => {
    loadRunners();
  }, [
    page,
    search,
    eventId,
    filters?.distance,
    filters?.gender,
    filters?.category,
  ]);

  /* -----------------------------
     PAGINATION
  ----------------------------- */

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      pages.push(1);

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="font-semibold text-gray-900">Leaderboard</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />

          <input
            placeholder="Search runner or bib"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-[200px]"
          />
        </div>
      </div>

      <div className="h-[420px] overflow-y-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="sticky top-0 bg-white border-y border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left w-[70px]">Rank</th>
              <th className="px-6 py-3 text-left w-[90px]">Bib</th>
              <th className="px-6 py-3 text-left w-[240px]">Runner</th>
              <th className="px-6 py-3 text-right w-[120px]">Gun Time</th>
              <th className="px-6 py-3 text-right w-[120px]">Net Time</th>
              <th className="px-6 py-3 text-right w-[140px]">Pace</th>
              <th className="px-6 py-3 text-right w-[120px]">Speed</th>
            </tr>
          </thead>

          <tbody>
            {runners.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No results found
                </td>
              </tr>
            )}

            {runners.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => {
                  if (!r.bib) return;
                  router.push(`/results/${eventSlug}/runner/${r.bib}`);
                }}
                className={`cursor-pointer hover:bg-red-50 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                }`}
              >
                <td className="px-6 py-3 font-semibold text-gray-900">
                  {r.rankDisplay}
                </td>

                <td className="px-6 py-3">{r.bib}</td>

                <td className="px-6 py-3 font-medium">{r.name}</td>

                <td className="px-6 py-3 text-right tabular-nums text-gray-500">
                  {r.gun}
                </td>

                <td className="px-6 py-3 text-right tabular-nums font-semibold text-red-600">
                  {r.chip}
                </td>

                <td className="px-6 py-3 text-right tabular-nums text-gray-500">
                  {r.pace}
                </td>

                <td className="px-6 py-3 text-right tabular-nums text-gray-500">
                  {r.speed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {getPageNumbers().map((p, i) => {
            if (p === "...") {
              return (
                <span key={i} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <button
                key={i}
                onClick={() => setPage(Number(p))}
                className={`px-3 py-1 text-sm rounded-md ${
                  page === p
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
