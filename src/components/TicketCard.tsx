"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "@/lib/tickets";
import type { Project } from "@/lib/projects";

interface Props {
  ticket: Ticket;
  onDelete: (id: string) => void;
  projects: Project[];
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: "#14532d", text: "#4ade80" },
  medium: { bg: "#713f12", text: "#fbbf24" },
  high: { bg: "#7f1d1d", text: "#f87171" },
};

const DEFAULT_PROJECT_COLOR = "#6366f1";

export default function TicketCard({ ticket, onDelete, projects }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const project = ticket.project
    ? projects.find((p) => p.name === ticket.project)
    : null;
  const projectColor = project?.color ?? DEFAULT_PROJECT_COLOR;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/tickets/${ticket.id}`, { method: "DELETE" });
    onDelete(ticket.id);
  }

  const pColors = priorityColors[ticket.priority] ?? priorityColors.medium;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "#1e1e1e",
        border: "1px solid #2a2a2a",
        borderLeft: ticket.project ? `4px solid ${projectColor}` : "4px solid #2a2a2a",
      }}
      className="group relative rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-[#3a3a3a] transition-all duration-150"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-white leading-snug">
          {ticket.title}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
          className="flex-shrink-0 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none mt-0.5"
          title="Delete ticket"
        >
          ✕
        </button>
      </div>

      {/* Project badge */}
      {ticket.project && (
        <div className="mt-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${projectColor}22`,
              color: projectColor,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: projectColor }}
            />
            {ticket.project}
          </span>
        </div>
      )}

      {/* Priority and labels */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: pColors.bg, color: pColors.text }}
        >
          {ticket.priority}
        </span>
        {ticket.labels.map((label) => (
          <span
            key={label}
            className="rounded-full px-2 py-0.5 text-xs text-gray-400"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
