"use client";

import { useState, useRef, useEffect } from "react";
import type { Project } from "@/lib/projects";

interface Props {
  projects: Project[];
  value: string;
  onSelect: (name: string) => void;
}

export default function ProjectCombobox({ projects, value, onSelect }: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync if parent changes value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeProjects = projects.filter((p) => !p.archived);
  const filtered = inputValue.trim()
    ? activeProjects.filter((p) =>
        p.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : activeProjects;

  const exactMatch = activeProjects.some(
    (p) => p.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  function handleSelect(name: string) {
    setInputValue(name);
    onSelect(name);
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    onSelect(e.target.value);
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
        style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder="Select or create a project..."
        autoComplete="off"
      />
      {open && (filtered.length > 0 || (inputValue.trim() && !exactMatch)) && (
        <div
          className="absolute z-50 mt-1 w-full rounded border shadow-lg"
          style={{
            backgroundColor: "#1e1e1e",
            border: "1px solid #2a2a2a",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filtered.map((p) => (
            <button
              key={p.name}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(p.name);
              }}
            >
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
          {inputValue.trim() && !exactMatch && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-400 hover:bg-[#2a2a2a] transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(inputValue.trim());
              }}
            >
              <span className="text-blue-500">+</span>
              Create project: <span className="font-medium">{inputValue.trim()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
