import { readAllTickets } from "@/lib/tickets";
import { readProjects } from "@/lib/projects";
import Board from "@/components/Board";
import type { Ticket } from "@/lib/tickets";

export default function Home() {
  const tickets: Ticket[] = readAllTickets(true); // read all including archived
  const projectsData = readProjects();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f0f0f]">
      <Board initialTickets={tickets} projects={projectsData.projects} />
    </div>
  );
}
