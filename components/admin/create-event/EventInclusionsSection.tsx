"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  GiftIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  HeartIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import { EVENT_INCLUSIONS } from "@/components/constants/eventInclusions";

interface Props {
  data: any;
  onChange: (path: string, value: any) => void;
}

const categoryIcons: Record<string, any> = {
  apparel: GiftIcon,
  timing: ClockIcon,
  certificates: DocumentTextIcon,
  media: PhotoIcon,
  support: HeartIcon,
  awards: TrophyIcon,
};

const categoryColors: Record<string, string> = {
  apparel: "from-pink-500 to-rose-500",
  timing: "from-indigo-500 to-blue-500",
  certificates: "from-amber-500 to-orange-500",
  media: "from-purple-500 to-fuchsia-500",
  support: "from-emerald-500 to-teal-500",
  awards: "from-yellow-500 to-amber-500",
};

export default function EventInclusionsSection({ data, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  /* custom inclusion inputs */
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  /* toggle preset inclusion */
  const toggleItem = (categoryKey: string, item: string) => {
    const updated = data.inclusions.map((cat: any) => {
      if (cat.key !== categoryKey) return cat;

      const exists = cat.items.includes(item);

      return {
        ...cat,
        items: exists
          ? cat.items.filter((i: string) => i !== item)
          : [...cat.items, item],
      };
    });

    onChange("inclusions", updated);
  };
  /* add custom inclusion */
  const addCustomItem = (categoryKey: string) => {
    const value = customInputs[categoryKey]?.trim();
    if (!value) return;

    const updated = data.inclusions.map((cat: any) => {
      if (cat.key !== categoryKey) return cat;

      if (cat.items.includes(value)) return cat;

      return {
        ...cat,
        items: [...cat.items, value],
      };
    });

    onChange("inclusions", updated);

    setCustomInputs((prev) => ({
      ...prev,
      [categoryKey]: "",
    }));
  };

  return (
    <section className="bg-gradient-to-br from-[#0f172a] to-[#111827] border border-slate-700 rounded-2xl p-8 space-y-8 shadow-xl">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white">Event Inclusions</h2>

        <p className="text-slate-400 text-sm mt-2">
          Select preset runner benefits or add your own custom inclusions.
        </p>
      </div>

      {/* CATEGORIES */}
      <div className="space-y-5">
        {data.inclusions.map((category: any) => {
          const isDefault = EVENT_INCLUSIONS.some(
            (c) => c.key === category.key,
          );
          const isOpen = open === category.key;
          const Icon = categoryIcons[category.key] || GiftIcon;
          const gradient =
            categoryColors[category.key] || "from-gray-500 to-gray-700";

          return (
            <div
              key={category.key}
              className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/40 backdrop-blur"
            >
              {/* HEADER */}
              <div
                onClick={() => setOpen(isOpen ? null : category.key)}
                className="w-full flex items-center justify-between px-6 py-5 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <span className="text-base font-semibold text-white">
                    <input
                      value={
                        data.inclusions.find((c: any) => c.key === category.key)
                          ?.title || ""
                      }
                      onChange={(e) => {
                        const updated = data.inclusions.map((cat: any) => {
                          if (cat.key !== category.key) return cat;

                          return {
                            ...cat,
                            title: e.target.value,
                          };
                        });

                        onChange("inclusions", updated);
                      }}
                      className="bg-transparent border-b border-slate-600 focus:border-indigo-500 outline-none text-white font-semibold"
                    />
                  </span>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-3">
                  {/* DELETE BUTTON */}
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        const updated = data.inclusions.filter(
                          (c: any) => c.key !== category.key,
                        );

                        onChange("inclusions", updated);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-500/30 rounded"
                    >
                      Delete
                    </button>
                  )}

                  {/* DROPDOWN ICON */}
                  <ChevronDownIcon
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* BODY */}
              <div
                className={`grid md:grid-cols-2 gap-4 px-6 transition-all duration-300 ${
                  isOpen
                    ? "max-h-[800px] opacity-100 pb-6"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {/* PRESET ITEMS */}
                {/* PRESET + CUSTOM ITEMS */}

                {(() => {
                  const inclusionsArray = Array.isArray(data.inclusions)
                    ? data.inclusions
                    : Object.keys(data.inclusions || {}).map((key) => {
                        const base = EVENT_INCLUSIONS.find(
                          (c) => c.key === key,
                        );

                        return {
                          key,
                          title: base?.title || key,
                          items: data.inclusions[key] || [],
                        };
                      });

                  const categoryData = inclusionsArray.find(
                    (c: any) => c.key === category.key,
                  ) || {
                    items: [],
                    title: category.title,
                  };

                  const selected = categoryData.items || [];
                  const baseCategory = EVENT_INCLUSIONS.find(
                    (c) => c.key === category.key,
                  );

                  const preset = baseCategory?.items || [];

                  // merge preset items + custom added items
                  const allItems = Array.from(
                    new Set([...preset, ...selected]),
                  );

                  return allItems.map((item) => {
                    const checked = selected.includes(item);

                    return (
                      <div
                        key={item}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                          checked
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
                        }`}
                      >
                        <span className="text-sm text-slate-200">{item}</span>

                        <button
                          type="button"
                          onClick={() => toggleItem(category.key, item)}
                          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                            checked ? "bg-indigo-600" : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                              checked ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                      </div>
                    );
                  });
                })()}
                {/* CUSTOM INPUT */}
                <div className="md:col-span-2 flex gap-3 mt-2">
                  <input
                    value={customInputs[category.key] || ""}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({
                        ...prev,
                        [category.key]: e.target.value,
                      }))
                    }
                    placeholder="Add custom inclusion..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => addCustomItem(category.key)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-4">
        <button
          type="button"
          onClick={() => {
            const exists = data.inclusions.some(
              (cat: any) => cat.title === "New Category",
            );

            if (exists) return; // 🚫 prevent duplicate

            const newKey = `custom_${Date.now()}`;

            const updated = [
              ...data.inclusions,
              {
                key: newKey,
                title: `Category ${data.inclusions.length + 1}`,
                items: [],
              },
            ];

            onChange("inclusions", updated);
          }}
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm"
        >
          + Add Category
        </button>
      </div>
    </section>
  );
}
