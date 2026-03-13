"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function Leaderboard({ eventId, eventSlug }: any) {
  const router = useRouter();

  const [runners, setRunners] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  /* load runners */

  async function loadRunners() {
    const url =
      `/api/results/leaderboard?eventId=${eventId}` +
      `&page=${page}` +
      `&limit=${PAGE_SIZE}` +
      `&search=${search}` +
      `&category=${category}`;

    const res = await fetch(url, { cache: "no-store" });

    const data = await res.json();

    if (data.success) {
      setRunners(data.runners);
      setTotal(data.total);
    }
  }

  /* load categories */

  async function loadCategories() {
    const res = await fetch(`/api/results/categories?eventId=${eventId}`);

    const data = await res.json();

    if (data.success) {
      setCategories(data.categories);
    }
  }

  useEffect(() => {
    loadRunners();
  }, [page, search, category]);

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* HEADER */}

      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="font-semibold text-gray-900">Leaderboard</h2>

        <div className="flex items-center gap-4">
          {/* SEARCH */}

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

          {/* CATEGORY FILTER */}

          <div className="relative">
            <FunnelIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />

            <select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-[200px]"
            >
              <option value="">All Categories</option>

              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} KM
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}

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
            {runners.map((r, i) => (
              <tr
                key={r.id}
                onClick={() =>
                  router.push(`/results/${eventSlug}/runner/${r.bib}`)
                }
                className={`cursor-pointer hover:bg-red-50
                ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
              >
                <td className="px-6 py-3 font-semibold">#{r.rank}</td>
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

      {/* PAGINATION */}

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Page {page} / {totalPages || 1}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => {
            const p = i + 1;

            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm rounded-md
                ${
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
