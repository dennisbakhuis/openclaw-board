import { readAllTickets } from "@/lib/tickets";
import Board from "@/components/Board";
import type { Column, Ticket } from "@/lib/tickets";

const COLUMNS: Column[] = ["todo", "in-progress", "review", "done"];

export default function Home() {
  const tickets: Ticket[] = readAllTickets();

  // Ensure all columns are represented
  const grouped = COLUMNS.reduce<Record<Column, Ticket[]>>(
    (acc, col) => {
      acc[col] = tickets.filter((t) => t.column === col);
      return acc;
    },
    { todo: [], "in-progress": [], review: [], done: [] }
  );

  const allTickets = Object.values(grouped).flat();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0f0f0f" }}>
      <Board initialTickets={allTickets} />
    </main>
  );
}
