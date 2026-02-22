"use client";

import { useGlobalLoading } from "@/context/LoadingContext";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function GlobalLoader() {
  const { loading } = useGlobalLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4">
        <ArrowPathIcon className="w-6 h-6 text-indigo-400 animate-spin" />
        <span className="text-white text-sm tracking-wide">
          Processing request...
        </span>
      </div>
    </div>
  );
}
