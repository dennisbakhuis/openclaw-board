"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TicketCard from "./TicketCard";
import type { Ticket, Column as ColumnType } from "@/lib/tickets";
import type { Project } from "@/lib/projects";

interface Props {
  column: ColumnType;
  tickets: Ticket[];
  onDelete: (id: string) => void;
  projects: Project[];
}

const columnLabels: Record<ColumnType, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
  archived: "Archived",
};

const columnAccent: Record<ColumnType, string> = {
  todo: "#6366f1",
  "in-progress": "#f59e0b",
  review: "#06b6d4",
  done: "#10b981",
  archived: "#6b7280",
};

export default function Column({ column, tickets, onDelete, projects }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-lg"
      style={{
        backgroundColor: isOver ? "#1a1a1a" : "#161616",
        border: "1px solid #2a2a2a",
        minHeight: "200px",
        transition: "background-color 0.15s",
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "#2a2a2a" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: columnAccent[column] }}
          />
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#9ca3af" }}
          >
            {columnLabels[column]}
          </h2>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: "#2a2a2a", color: "#6b7280" }}
        >
          {tickets.length}
        </span>
      </div>

      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 p-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onDelete={onDelete}
              projects={projects}
            />
          ))}
          {tickets.length === 0 && (
            <div
              className="rounded-md border-2 border-dashed px-4 py-6 text-center text-xs text-gray-600"
              style={{ borderColor: "#2a2a2a" }}
            >
              Drop tickets here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
