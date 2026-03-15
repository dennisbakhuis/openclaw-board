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

const priorityClasses: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-[#14532d] dark:text-[#4ade80]",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-[#713f12] dark:text-[#fbbf24]",
  high: "bg-red-100 text-red-700 dark:bg-[#7f1d1d] dark:text-[#f87171]",
};

const DEFAULT_PROJECT_COLOR = "#6366f1";

function formatDuration(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function TicketCard({ ticket, onDelete, projects }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const project = ticket.project
    ? projects.find((p) => p.name === ticket.project)
    : null;
  const projectColor = project?.color ?? DEFAULT_PROJECT_COLOR;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/tickets/${ticket.id}`, { method: "DELETE" });
    onDelete(ticket.id);
  }

  const badgeClass = priorityClasses[ticket.priority] ?? priorityClasses.medium;

  const showProcessingTime =
    (ticket.column === "done" || ticket.column === "archived") &&
    ticket.processingTime !== undefined;

  const borderLeftStyle = ticket.project
    ? `4px solid ${projectColor}`
    : "4px solid transparent";

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        borderLeft: borderLeftStyle,
      }}
      className="group relative rounded-md p-3 cursor-grab active:cursor-grabbing transition-all duration-150 bg-[#f1f3f5] dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
          {ticket.title}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
          className="flex-shrink-0 rounded text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none mt-0.5"
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
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {ticket.priority}
        </span>
        {ticket.labels.map((label) => (
          <span
            key={label}
            className="rounded-full px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-[#2a2a2a]"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Processing time for done/archived cards */}
      {showProcessingTime && (
        <div className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          ⏱ {formatDuration(ticket.processingTime!)}
        </div>
      )}
    </div>
  );
}
