"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "@/lib/tickets";

interface Props {
  ticket: Ticket;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444",
};

export default function TicketCard({ ticket, onDelete }: Props) {
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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/tickets/${ticket.id}`, { method: "DELETE" });
    onDelete(ticket.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "#1e1e1e",
        border: "1px solid #2a2a2a",
      }}
      className="group relative rounded-md p-3 cursor-grab active:cursor-grabbing"
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
          className="flex-shrink-0 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
          title="Delete ticket"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span
          className="rounded px-1.5 py-0.5 text-xs font-medium text-black"
          style={{ backgroundColor: priorityColors[ticket.priority] }}
        >
          {ticket.priority}
        </span>
        {ticket.labels.map((label) => (
          <span
            key={label}
            className="rounded px-1.5 py-0.5 text-xs text-gray-400"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
