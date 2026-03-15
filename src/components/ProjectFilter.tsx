"use client";

import type { Project } from "@/lib/projects";

interface Props {
  projects: Project[];
  selectedProject: string | null | "archived";
  onSelect: (project: string | null | "archived") => void;
}

export default function ProjectFilter({ projects, selectedProject, onSelect }: Props) {
  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-gray-200 dark:border-[#2a2a2a]">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">Filter:</span>

      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selectedProject === null
            ? "bg-blue-600 text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#2a2a2a]"
        }`}
      >
        All Projects
      </button>

      {activeProjects.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(p.name)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
            selectedProject === p.name
              ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#2a2a2a]"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#1e1e1e]"
          }`}
          style={{
            borderColor: selectedProject === p.name ? p.color : undefined,
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          {p.name}
        </button>
      ))}

      <button
        onClick={() => onSelect("archived")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
          selectedProject === "archived"
            ? "text-white bg-red-950 border-red-800"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
        }`}
      >
        🗄 Archived
      </button>
    </div>
  );
}
