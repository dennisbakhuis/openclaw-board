"use client";

import { useState, useCallback } from "react";
import type { Column, Priority } from "@/lib/tickets";
import type { Project } from "@/lib/projects";

interface StatsData {
  total: number;
  byColumn: Record<Column, number>;
  byPriority: Record<Priority, number>;
  byProject: Record<string, number>;
  avgProcessingTime: number | null;
  completedThisWeek: number;
  completedThisMonth: number;
  projects: Project[];
}

const COLUMN_LABELS: Record<Column, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
  archived: "Archived",
};

const COLUMN_COLORS: Record<Column, string> = {
  todo: "#6366f1",
  "in-progress": "#f59e0b",
  review: "#06b6d4",
  done: "#10b981",
  archived: "#6b7280",
};

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: "#14532d", text: "#4ade80" },
  medium: { bg: "#713f12", text: "#fbbf24" },
  high: { bg: "#7f1d1d", text: "#f87171" },
};

function formatDuration(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Props {
  onClose: () => void;
}

export function StatsPanel({ onClose }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/board/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on first render
  useState(() => {
    fetchStats();
  });

  const maxColumnCount = stats ? Math.max(...Object.values(stats.byColumn), 1) : 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white dark:bg-[#0f0f0f] border-l border-gray-200 dark:border-[#2a2a2a] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">📊 Stats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="rounded px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {error && (
            <p className="text-sm text-red-400 bg-red-950/20 rounded px-3 py-2">{error}</p>
          )}

          {!stats && !loading && !error && (
            <p className="text-sm text-gray-400">No data yet.</p>
          )}

          {loading && !stats && (
            <p className="text-sm text-gray-400 animate-pulse">Loading stats…</p>
          )}

          {stats && (
            <>
              {/* Overview */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">Overview</h3>
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                  <span className="text-sm text-gray-500">total tickets</span>
                </div>
                <div className="space-y-2">
                  {(Object.entries(stats.byColumn) as [Column, number][])
                    .filter(([, count]) => count > 0)
                    .map(([col, count]) => (
                      <div key={col} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-gray-400">{COLUMN_LABELS[col]}</span>
                        <div className="flex-1 rounded-full bg-gray-100 dark:bg-[#1e1e1e] h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round((count / maxColumnCount) * 100)}%`,
                              backgroundColor: COLUMN_COLORS[col],
                            }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">{count}</span>
                      </div>
                    ))}
                </div>
              </section>

              {/* By Priority */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">By Priority</h3>
                <div className="flex gap-3">
                  {(["high", "medium", "low"] as Priority[]).map((p) => (
                    <div
                      key={p}
                      className="flex-1 rounded-lg px-3 py-2 text-center"
                      style={{ backgroundColor: PRIORITY_COLORS[p].bg }}
                    >
                      <div className="text-xl font-bold" style={{ color: PRIORITY_COLORS[p].text }}>
                        {stats.byPriority[p]}
                      </div>
                      <div className="text-xs capitalize" style={{ color: PRIORITY_COLORS[p].text, opacity: 0.8 }}>
                        {p}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* By Project */}
              {Object.keys(stats.byProject).length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">By Project</h3>
                  <div className="space-y-1.5">
                    {Object.entries(stats.byProject)
                      .sort(([, a], [, b]) => b - a)
                      .map(([projectName, count]) => {
                        const proj = stats.projects.find((p) => p.name === projectName);
                        const color = proj?.color ?? "#6366f1";
                        return (
                          <div
                            key={projectName}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 dark:bg-[#161616]"
                          >
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{projectName}</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* Velocity */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">Velocity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-[#161616] px-4 py-3 text-center">
                    <div className="text-2xl font-bold text-emerald-500">{stats.completedThisWeek}</div>
                    <div className="text-xs text-gray-500 mt-0.5">This week</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-[#161616] px-4 py-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.completedThisMonth}</div>
                    <div className="text-xs text-gray-500 mt-0.5">This month</div>
                  </div>
                </div>
              </section>

              {/* Avg Processing Time */}
              {stats.avgProcessingTime !== null && (
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">Avg Processing Time</h3>
                  <div className="rounded-lg bg-gray-50 dark:bg-[#161616] px-4 py-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      ⏱ {formatDuration(stats.avgProcessingTime)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">average time to complete</div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
