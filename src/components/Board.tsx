"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./Column";
import CreateTicketModal from "./CreateTicketModal";
import type { Ticket, Column as ColumnType } from "@/lib/tickets";

const COLUMNS: ColumnType[] = ["todo", "in-progress", "review", "done"];

interface Props {
  initialTickets: Ticket[];
}

export default function Board({ initialTickets }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function getColumn(id: string): ColumnType | null {
    return tickets.find((t) => t.id === id)?.column ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTicketId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = getColumn(activeTicketId);
    if (!sourceColumn) return;

    // Determine target column: if dropped on a column id directly, use it; else find the column of the ticket
    const targetColumn: ColumnType = COLUMNS.includes(overId as ColumnType)
      ? (overId as ColumnType)
      : getColumn(overId) ?? sourceColumn;

    if (sourceColumn === targetColumn) {
      // Reorder within same column (visual only, disk order doesn't matter)
      setTickets((prev) => {
        const ids = prev.filter((t) => t.column === sourceColumn).map((t) => t.id);
        const oldIdx = ids.indexOf(activeTicketId);
        const newIdx = ids.indexOf(overId);
        if (oldIdx === -1 || newIdx === -1) return prev;
        const reordered = arrayMove(ids, oldIdx, newIdx);
        const columnTickets = reordered.map((id) => prev.find((t) => t.id === id)!);
        const others = prev.filter((t) => t.column !== sourceColumn);
        return [...others, ...columnTickets];
      });
      return;
    }

    // Optimistic update: move ticket to new column
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId ? { ...t, column: targetColumn } : t
      )
    );

    try {
      await fetch(`/api/tickets/${activeTicketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column: targetColumn }),
      });
      router.refresh();
    } catch {
      // Revert on error
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicketId ? { ...t, column: sourceColumn } : t
        )
      );
    }
  }

  const handleDelete = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }, [router]);

  function handleModalSuccess() {
    setShowModal(false);
    router.refresh();
    // Refresh ticket list from server
    fetch("/api/tickets")
      .then(() => router.refresh())
      .catch(() => {});
  }

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-white">OpenClaw Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#2563eb" }}
        >
          + New Ticket
        </button>
      </div>

      <div className="flex-1 px-6 pb-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-4 gap-4 h-full">
            {COLUMNS.map((col) => (
              <Column
                key={col}
                column={col}
                tickets={tickets.filter((t) => t.column === col)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTicket && (
              <div
                className="rounded-md p-3 shadow-lg"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  opacity: 0.9,
                }}
              >
                <span className="text-sm font-medium text-white">
                  {activeTicket.title}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showModal && (
        <CreateTicketModal
          onSuccess={handleModalSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
