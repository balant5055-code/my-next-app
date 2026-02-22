"use client";

import {
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import { useEffect, useState } from "react";

interface Props {
  metrics: any;
}

export default function ParticipantStats({ metrics }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, [metrics]);

  const total = metrics?.totalParticipants ?? 0;
  const revenue = metrics?.totalRevenue ?? 0;
  const capacity = metrics?.totalCapacity ?? 0;
  const occupancy = metrics?.occupancyRate ?? 0;

  const stats = [
    {
      label: "Participants",
      value: total,
      prefix: "",
      icon: UsersIcon,
      trend: 12,
    },
    {
      label: "Revenue",
      value: revenue,
      prefix: "₹",
      icon: CurrencyRupeeIcon,
      trend: 8,
    },
    {
      label: "Capacity",
      value: capacity,
      prefix: "",
      icon: ChartBarIcon,
      trend: -3,
    },
    {
      label: "Occupancy",
      value: occupancy,
      prefix: "",
      suffix: "%",
      icon: FireIcon,
      trend: 5,
      isProgress: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        const isPositive = item.trend >= 0;

        return (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 transition-all duration-200 hover:border-slate-700"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-800">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>

                <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                  {item.label}
                </span>
              </div>

              <div
                className={`flex items-center text-[11px] font-medium ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(item.trend)}%
              </div>
            </div>

            {/* Value */}
            <div className="text-xl font-semibold text-white tracking-tight">
              {item.prefix}
              {animated && (
                <CountUp end={item.value} duration={1.4} separator="," />
              )}
              {item.suffix}
            </div>

            {/* Progress (only for occupancy) */}
            {item.isProgress && (
              <div className="mt-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
