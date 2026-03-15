"use client";

import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { StatsPanel } from "./StatsPanel";
import { SettingsPanel } from "./SettingsPanel";

export function HeaderControls() {
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          onClick={() => { setShowStats(true); setShowSettings(false); }}
          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] border border-gray-200 dark:border-[#2a2a2a] transition-colors"
          title="Stats"
        >
          📊
        </button>

        <button
          onClick={() => { setShowSettings(true); setShowStats(false); }}
          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] border border-gray-200 dark:border-[#2a2a2a] transition-colors"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
