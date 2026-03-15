"use client";
import { useState } from "react";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" ? getStoredTheme() : "auto"
  );

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "☀️" },
    { value: "dark", label: "🌙" },
    { value: "auto", label: "🖥" },
  ];

  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            applyTheme(opt.value);
            setTheme(opt.value);
          }}
          className={`px-2 py-1 text-sm transition-colors ${
            theme === opt.value
              ? "bg-[#3b82f6] text-white"
              : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
          title={opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
