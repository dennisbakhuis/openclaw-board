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
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "#2a2a2a" }}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">Filter:</span>

      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selectedProject === null
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        style={{
          backgroundColor: selectedProject === null ? "#2563eb" : "#2a2a2a",
        }}
      >
        All Projects
      </button>

      {activeProjects.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(p.name)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedProject === p.name ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          style={{
            backgroundColor: selectedProject === p.name ? "#2a2a2a" : "#1e1e1e",
            border: selectedProject === p.name ? `1px solid ${p.color}` : "1px solid #2a2a2a",
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
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selectedProject === "archived"
            ? "text-white"
            : "text-gray-500 hover:text-gray-300"
        }`}
        style={{
          backgroundColor: selectedProject === "archived" ? "#3a2a2a" : "#1e1e1e",
          border: selectedProject === "archived" ? "1px solid #7f1d1d" : "1px solid #2a2a2a",
        }}
      >
        🗄 Archived
      </button>
    </div>
  );
}
