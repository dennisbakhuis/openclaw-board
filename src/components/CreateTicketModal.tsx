"use client";

import { useState } from "react";
import type { Column, Priority } from "@/lib/tickets";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function CreateTicketModal({ onSuccess, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [labels, setLabels] = useState("");
  const [column, setColumn] = useState<Column>("todo");
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
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 shadow-xl"
        style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-white">
          Create Ticket
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ticket title"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Description
            </label>
            <textarea
              className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #2a2a2a",
                resize: "vertical",
                minHeight: "80px",
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-gray-400">
                Priority
              </label>
              <select
                className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                }}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-gray-400">Column</label>
              <select
                className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                }}
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
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Labels{" "}
              <span className="text-xs text-gray-600">(comma-separated)</span>
            </label>
            <input
              className="w-full rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a" }}
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
              className="rounded px-4 py-2 text-sm text-gray-400 hover:text-white"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#2563eb" }}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
