"use client";

import { useState, useCallback, useRef } from "react";
import type { Project } from "@/lib/projects";

interface Props {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Map of project name → pending color (for color picker debounce)
  const pendingColors = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on first render
  useState(() => {
    fetchProjects();
  });

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  async function handleColorChange(name: string, color: string) {
    // Update local state immediately
    setProjects((prev) =>
      prev.map((p) => (p.name === name ? { ...p, color } : p))
    );
    // Debounce API call
    if (pendingColors.current[name]) clearTimeout(pendingColors.current[name]);
    pendingColors.current[name] = setTimeout(async () => {
      try {
        await fetch(`/api/projects/${encodeURIComponent(name)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ color }),
        });
        await fetchProjects();
      } catch {
        // ignore
      }
    }, 400);
  }

  async function handleArchive(name: string) {
    if (!confirm(`Archive project "${name}"?`)) return;
    try {
      await fetch(`/api/projects/${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      await fetchProjects();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleUnarchive(name: string) {
    try {
      await fetch(`/api/projects/${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      await fetchProjects();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white dark:bg-[#0f0f0f] border-l border-gray-200 dark:border-[#2a2a2a] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {error && (
            <p className="text-sm text-red-400 bg-red-950/20 rounded px-3 py-2">{error}</p>
          )}

          {loading && projects.length === 0 && (
            <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
          )}

          {/* Active Projects */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">
              Project Colors
            </h3>
            {activeProjects.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No active projects.</p>
            )}
            <div className="space-y-2">
              {activeProjects.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a]"
                >
                  {/* Color swatch / picker */}
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={p.color}
                      onChange={(e) => handleColorChange(p.name, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Pick color"
                    />
                    <span
                      className="inline-block h-6 w-6 rounded-full border-2 border-white dark:border-[#2a2a2a] shadow cursor-pointer"
                      style={{ backgroundColor: p.color }}
                    />
                  </div>

                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {p.name}
                  </span>

                  <button
                    onClick={() => handleArchive(p.name)}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/20"
                    title="Archive project"
                  >
                    Archive
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Archived Projects */}
          {archivedProjects.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">
                Archived Projects
              </h3>
              <div className="space-y-2">
                {archivedProjects.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] opacity-60"
                  >
                    <span
                      className="inline-block h-5 w-5 rounded-full shrink-0 border border-gray-300 dark:border-[#2a2a2a]"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate line-through">
                      {p.name}
                    </span>
                    <button
                      onClick={() => handleUnarchive(p.name)}
                      className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-emerald-950/20"
                      title="Unarchive project"
                    >
                      Unarchive
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">Unarchiving will assign a new color.</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
