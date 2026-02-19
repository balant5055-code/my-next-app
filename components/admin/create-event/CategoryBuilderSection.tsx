"use client";

import { useState } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface Category {
  title: string;
  distance: string;
  price: string;
  minAge: string;
  maxAge: string;
  maxSeats: string;
}

interface Props {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  errors: Record<string, string>;
}

const DEFAULT_CATEGORY_TEMPLATES: Record<string, Category> = {
  "2KM": {
    title: "2KM Fun Run",
    distance: "2",
    price: "300",
    minAge: "5",
    maxAge: "60",
    maxSeats: "999",
  },
  "3KM": {
    title: "3KM Kids Run",
    distance: "3",
    price: "500",
    minAge: "5",
    maxAge: "14",
    maxSeats: "999",
  },
  "5KM": {
    title: "5KM Fit Run",
    distance: "5",
    price: "800",
    minAge: "12",
    maxAge: "100",
    maxSeats: "999",
  },
  "10KM": {
    title: "10KM Pro Run",
    distance: "10",
    price: "1000",
    minAge: "16",
    maxAge: "100",
    maxSeats: "999",
  },
  "21KM": {
    title: "21KM Half Marathon",
    distance: "21",
    price: "1500",
    minAge: "18",
    maxAge: "100",
    maxSeats: "999",
  },
  "42KM": {
    title: "42KM Full Marathon",
    distance: "42",
    price: "2000",
    minAge: "18",
    maxAge: "100",
    maxSeats: "999",
  },
};

export default function CategoryBuilderSection({
  categories,
  setCategories,
}: Props) {
  const updateCategory = (
    index: number,
    field: keyof Category,
    value: string,
  ) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const addCategory = () => {
    const scrollPosition = window.scrollY;

    const updated = [
      ...categories,
      {
        title: "",
        distance: "",
        price: "",
        minAge: "",
        maxAge: "",
        maxSeats: "",
      },
    ];

    updated.sort((a, b) => Number(a.distance) - Number(b.distance));

    setCategories(updated);

    // 🔥 restore scroll position
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition });
    }, 0);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };
  const toggleCollapse = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };
  const getCategoryColor = (distance: string) => {
    const d = Number(distance);

    if (d <= 3) return "teal"; // 2K / 3K
    if (d === 5) return "blue";
    if (d === 10) return "orange";
    if (d === 21) return "purple";
    if (d === 42) return "red";

    return "indigo";
  };

  /* ================= PRESET HANDLER ================= */

  const toggleDefaultCategory = (key: string) => {
    const template = DEFAULT_CATEGORY_TEMPLATES[key];

    const exists = categories.some((cat) => cat.distance === template.distance);

    if (exists) {
      setCategories(
        categories.filter((cat) => cat.distance !== template.distance),
      );
    } else {
      const updated = [...categories, template];

      // 🔥 Sort ascending by distance
      updated.sort((a, b) => Number(a.distance) - Number(b.distance));

      setCategories(updated);
    }
  };

  /* ================= BIB PREVIEW ================= */

  const getBibPreview = (distance: string, seats: string) => {
    const distanceNumber = parseInt(distance);
    const maxSeats = parseInt(seats);

    if (!distanceNumber || !maxSeats) return null;

    const bibBase = distanceNumber * 1000;
    const bibStart = bibBase + 1;
    const bibEnd = bibBase + maxSeats;

    return { bibStart, bibEnd };
  };

  return (
    <section className="bg-gradient-to-br from-[#0f172a] to-[#111827] border border-slate-700 rounded-2xl p-6 space-y-8 shadow-xl shadow-black/30">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Category Builder Engine
        </h2>
        <p className="text-sm text-slate-400">
          Select preset distances or create custom categories.
        </p>
      </div>

      {/* ================= PRESET SELECTOR ================= */}
      <div className="flex flex-wrap gap-3">
        {Object.keys(DEFAULT_CATEGORY_TEMPLATES).map((key) => {
          const template = DEFAULT_CATEGORY_TEMPLATES[key];

          const isSelected = categories.some(
            (cat) => cat.distance === template.distance,
          );

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleDefaultCategory(key)}
              className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 border
        ${
          isSelected
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 scale-105"
            : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
        }`}
            >
              {key}
            </button>
          );
        })}
        {/* MANUAL ADD BUTTON */}

        <button
          onClick={addCategory}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium transition shadow-md shadow-indigo-500/30"
        >
          <PlusIcon className="h-4 w-4" />
          Add Custom Category
        </button>
      </div>

      {/* ================= CATEGORY CARDS ================= */}

      <div className="space-y-6">
        {categories.map((cat, index) => {
          const bibPreview = getBibPreview(cat.distance, cat.maxSeats);
          const isOpen = openIndexes.includes(index);
          const color = getCategoryColor(cat.distance);

          const colorMap: any = {
            teal: "from-teal-500 to-emerald-600 shadow-emerald-500/30",
            blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
            orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
            purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
            red: "from-rose-500 to-red-600 shadow-red-500/30",
            indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/30",
          };

          return (
            <div
              key={index}
              className="bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl shadow-lg transition"
            >
              {/* HEADER */}
              <div
                onClick={() => toggleCollapse(index)}
                className="flex justify-between items-center p-5 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Color Badge */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white font-bold text-sm shadow-md`}
                  >
                    {cat.distance || "?"}K
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        value={cat.title}
                        onClick={(e) => e.stopPropagation()} // prevent collapse toggle
                        onChange={(e) =>
                          updateCategory(index, "title", e.target.value)
                        }
                        placeholder="Untitled Category"
                        className="bg-transparent text-white font-semibold text-base border-b border-transparent focus:border-indigo-500 focus:outline-none transition w-48"
                      />
                    </div>

                    <p className="text-xs text-slate-400">₹ {cat.price || 0}</p>
                  </div>
                </div>

                <ChevronDownIcon
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* COLLAPSIBLE BODY */}
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  isOpen
                    ? "max-h-[1000px] opacity-100 p-6 pt-0"
                    : "max-h-0 opacity-0"
                }`}
              >
                {/* GRID INPUTS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {[
                    { label: "Distance (KM)", field: "distance" },
                    { label: "Price (₹)", field: "price" },
                    { label: "Max Seats", field: "maxSeats" },
                    { label: "Min Age", field: "minAge" },
                    { label: "Max Age", field: "maxAge" },
                  ].map((item) => (
                    <div key={item.field}>
                      <label className="block text-xs text-slate-400 mb-2">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        value={(cat as any)[item.field]}
                        onChange={(e) =>
                          updateCategory(
                            index,
                            item.field as any,
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                  ))}
                </div>

                {/* BIB PREVIEW */}
                {bibPreview && (
                  <div className="mt-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/40 rounded-xl px-4 py-3 text-sm flex justify-between">
                    <span className="text-indigo-300">
                      Bib Range: {bibPreview.bibStart} – {bibPreview.bibEnd}
                    </span>
                    <span className="text-slate-300">
                      Total Bibs: {cat.maxSeats}
                    </span>
                  </div>
                )}

                {/* DELETE */}
                {categories.length > 1 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => removeCategory(index)}
                      className="text-rose-400 hover:text-rose-300 text-sm"
                    >
                      Remove Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
