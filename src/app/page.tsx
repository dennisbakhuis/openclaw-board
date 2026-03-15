import { readAllTickets } from "@/lib/tickets";
import { readProjects } from "@/lib/projects";
import Board from "@/components/Board";
import type { Ticket } from "@/lib/tickets";

export default function Home() {
  const tickets: Ticket[] = readAllTickets(true); // read all including archived
  const projectsData = readProjects();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0f0f0f" }}>
      <Board initialTickets={tickets} projects={projectsData.projects} />
    </main>
  );
}
