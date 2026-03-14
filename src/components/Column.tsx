"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TicketCard from "./TicketCard";
import type { Ticket, Column as ColumnType } from "@/lib/tickets";

interface Props {
  column: ColumnType;
  tickets: Ticket[];
  onDelete: (id: string) => void;
}

const columnLabels: Record<ColumnType, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export default function Column({ column, tickets, onDelete }: Props) {
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
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-300">
          {columnLabels[column]}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs text-gray-500"
          style={{ backgroundColor: "#2a2a2a" }}
        >
          {tickets.length}
        </span>
      </div>
      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 p-3 pt-0">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
