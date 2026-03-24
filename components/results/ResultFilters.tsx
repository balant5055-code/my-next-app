"use client";

import { useEffect, useState, useCallback } from "react";
import AnimatedDropdown from "@/components/ui/AnimatedDropdown";

import {
  FlagIcon,
  UserIcon,
  TagIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

type Props = {
  eventId: string;
  onChange: (filters: {
    distance: string;
    gender: string;
    category: string;
  }) => void;
};

export default function ResultFilters({ eventId, onChange }: Props) {
  const [distance, setDistance] = useState("");
  const [gender, setGender] = useState("overall");
  const [category, setCategory] = useState("overall");

  const [distances, setDistances] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* LOAD FILTER DATA */

  useEffect(() => {
    if (!eventId) return;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/results/categories?eventId=${eventId}`);
        const data = await res.json();

        if (data.success) {
          const d = data.distances || [];

          setDistances(d);
          setCategories(data.categories || []);

          if (d.length > 0) {
            const defaultDistance = d.includes("3") ? "3" : d[0];

            setDistance(defaultDistance);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  /* EMIT FILTERS */

  const emitFilters = useCallback(() => {
    if (!distance) return;

    onChange({
      distance,
      gender,
      category,
    });
  }, [distance, gender, category, onChange]);

  useEffect(() => {
    emitFilters();
  }, [emitFilters]);

  /* RESET */

  const resetFilters = () => {
    setGender("overall");
    setCategory("overall");
  };

  if (loading) {
    return (
      <div className="border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 animate-pulse">
            <div className="h-9 bg-gray-200 rounded-md"></div>
            <div className="h-9 bg-gray-200 rounded-md"></div>
            <div className="h-9 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* LEFT SIDE */}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
              Filters
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="min-w-[170px]">
              <AnimatedDropdown
                label=""
                value={distance}
                onChange={setDistance}
                options={distances.map((d) => ({
                  label: `${d} KM`,
                  value: d,
                  icon: <FlagIcon className="w-4 h-4" />,
                }))}
              />
            </div>

            <div className="min-w-[170px]">
              <AnimatedDropdown
                label=""
                value={gender}
                onChange={setGender}
                options={[
                  {
                    label: "Overall",
                    value: "overall",
                    icon: <UserIcon className="w-4 h-4" />,
                  },
                  {
                    label: "Male",
                    value: "male",
                    icon: <UserIcon className="w-4 h-4" />,
                  },
                  {
                    label: "Female",
                    value: "female",
                    icon: <UserIcon className="w-4 h-4" />,
                  },
                ]}
              />
            </div>

            <div className="min-w-[170px]">
              <AnimatedDropdown
                label=""
                value={category}
                onChange={setCategory}
                options={[
                  {
                    label: "Overall",
                    value: "overall",
                    icon: <TagIcon className="w-4 h-4" />,
                  },
                  ...categories.map((c) => ({
                    label: c,
                    value: c,
                    icon: <TagIcon className="w-4 h-4" />,
                  })),
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
