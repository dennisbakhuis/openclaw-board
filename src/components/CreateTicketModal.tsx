"use client";

import { useState } from "react";
import type { Column, Priority } from "@/lib/tickets";
import type { Project } from "@/lib/projects";
import ProjectCombobox from "./ProjectCombobox";

interface Props {
  projects: Project[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function CreateTicketModal({ projects, onSuccess, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [labels, setLabels] = useState("");
  const [column, setColumn] = useState<Column>("todo");
  const [project, setProject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // If a project name is provided and it doesn't exist yet, create it
      const projectName: string | undefined = project.trim() || undefined;
      if (projectName) {
        const existing = projects.find(
          (p) => p.name.toLowerCase() === projectName!.toLowerCase()
        );
        if (!existing) {
          const projRes = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: projectName }),
          });
          if (!projRes.ok) {
            const err = await projRes.json();
            throw new Error(err.error ?? "Failed to create project");
          }
        }
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          labels: labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          column,
          project: projectName,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 shadow-xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Create Ticket</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ticket title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Description</label>
            <textarea
              className={inputClass}
              style={{ resize: "vertical", minHeight: "80px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          {/* Project */}
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Project</label>
            <ProjectCombobox
              projects={projects}
              value={project}
              onSelect={setProject}
            />
          </div>

          {/* Priority + Column */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Priority</label>
              <select
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Column</label>
              <select
                className={inputClass}
                value={column}
                onChange={(e) => setColumn(e.target.value as Column)}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              Labels{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              className={inputClass}
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, feature, urgent"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity bg-[#2563eb] hover:bg-blue-600"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
