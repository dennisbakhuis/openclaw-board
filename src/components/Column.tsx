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
      className="flex flex-col rounded-lg border border-gray-200 dark:border-[#2a2a2a] transition-colors duration-150"
      style={{
        backgroundColor: isOver ? undefined : undefined,
        minHeight: "200px",
      }}
      data-is-over={isOver}
    >
      {/* Tailwind can't use dynamic classes so we use a wrapper with conditional class */}
      <div
        className={`flex flex-col rounded-lg h-full ${
          isOver
            ? "bg-gray-100 dark:bg-[#1a1a1a]"
            : "bg-white dark:bg-[#161616]"
        }`}
        style={{ minHeight: "200px" }}
      >
        {/* Column header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: columnAccent[column] }}
            />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {columnLabels[column]}
            </h2>
          </div>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-500">
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
              <div className="rounded-md border-2 border-dashed px-4 py-6 text-center text-xs text-gray-400 border-gray-200 dark:border-[#2a2a2a]">
                Drop tickets here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
