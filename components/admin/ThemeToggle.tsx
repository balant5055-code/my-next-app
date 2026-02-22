"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

interface Props {
  collapsed?: boolean;
}

export default function ThemeToggle({ collapsed }: Props) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}
    >
      {/* Hide text when collapsed */}
      {!collapsed && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isDark ? "Dark" : "Light"}
        </span>
      )}

      <button
        onClick={toggleTheme}
        className={`flex items-center justify-center rounded-lg
          transition-all duration-300
          ${collapsed ? "h-9 w-9" : "h-9 w-9"}
          bg-slate-200 dark:bg-slate-700
          hover:bg-slate-300 dark:hover:bg-slate-600`}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
