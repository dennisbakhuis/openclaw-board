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
import ProjectFilter from "./ProjectFilter";
import type { Ticket, Column as ColumnType } from "@/lib/tickets";
import type { Project } from "@/lib/projects";

const COLUMNS: ColumnType[] = ["todo", "in-progress", "review", "done"];

interface Props {
  initialTickets: Ticket[];
  projects: Project[];
}

export default function Board({ initialTickets, projects }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null | "archived">(null);
  const [projectList, setProjectList] = useState<Project[]>(projects);

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

    const allColumns: ColumnType[] = [...COLUMNS, "archived"];
    // Determine target column: if dropped on a column id directly, use it; else find the column of the ticket
    const targetColumn: ColumnType = allColumns.includes(overId as ColumnType)
      ? (overId as ColumnType)
      : getColumn(overId) ?? sourceColumn;

    if (sourceColumn === targetColumn) {
      // Reorder within same column (visual only, disk order doesn't matter)
      setTickets((prev) => {
        const ids = prev
          .filter((t) => t.column === sourceColumn)
          .map((t) => t.id);
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

  const handleDelete = useCallback(
    (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    },
    [router]
  );

  function handleModalSuccess() {
    setShowModal(false);
    // Refresh ticket list from server
    fetch("/api/tickets?includeArchived=true")
      .then((res) => res.json())
      .then((data: Ticket[]) => setTickets(data))
      .catch(() => {});
    // Refresh project list
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: { projects: Project[] }) => setProjectList(data.projects))
      .catch(() => {});
    router.refresh();
  }

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null;

  // Determine which columns and tickets to show
  const isArchivedView = selectedProject === "archived";

  function getVisibleTickets(col: ColumnType): Ticket[] {
    let filtered = tickets.filter((t) => t.column === col);
    if (selectedProject && selectedProject !== "archived") {
      filtered = filtered.filter((t) => t.project === selectedProject);
    }
    // Sort by project name, then by created desc
    filtered.sort((a, b) => {
      const pa = a.project ?? "";
      const pb = b.project ?? "";
      if (pa < pb) return -1;
      if (pa > pb) return 1;
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
    return filtered;
  }

  const visibleColumns = isArchivedView ? (["archived"] as ColumnType[]) : COLUMNS;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div /> {/* spacer */}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 bg-[#2563eb]"
        >
          + New Ticket
        </button>
      </div>

      {/* Project filter */}
      <ProjectFilter
        projects={projectList}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
      />

      {/* Board */}
      <div className="flex-1 px-6 pb-6 pt-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid gap-4 h-full"
            style={{
              gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(0, 1fr))`,
            }}
          >
            {visibleColumns.map((col) => (
              <Column
                key={col}
                column={col}
                tickets={getVisibleTickets(col)}
                onDelete={handleDelete}
                projects={projectList}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTicket && (
              <div className="rounded-md p-3 shadow-xl rotate-1 bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3a3a3a]">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeTicket.title}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showModal && (
        <CreateTicketModal
          projects={projectList}
          onSuccess={handleModalSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
