import { NextResponse } from "next/server";
import { readAllTickets } from "@/lib/tickets";
import { readProjects } from "@/lib/projects";
import type { Column, Priority } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tickets = readAllTickets(true); // include archived

    const byColumn: Record<Column, number> = {
      todo: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
      archived: 0,
    };

    const byPriority: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const byProject: Record<string, number> = {};

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalProcessingTime = 0;
    let completedCount = 0;
    let completedThisWeek = 0;
    let completedThisMonth = 0;

    for (const ticket of tickets) {
      byColumn[ticket.column]++;
      byPriority[ticket.priority]++;

      if (ticket.project) {
        byProject[ticket.project] = (byProject[ticket.project] ?? 0) + 1;
      }

      if ((ticket.column === "done" || ticket.column === "archived") && ticket.processingTime !== undefined) {
        totalProcessingTime += ticket.processingTime;
        completedCount++;
      }

      if (ticket.completedAt) {
        const completedDate = new Date(ticket.completedAt);
        if (completedDate >= weekAgo) completedThisWeek++;
        if (completedDate >= monthAgo) completedThisMonth++;
      }
    }

    // Fetch project data for color info
    const projectsData = readProjects();

    return NextResponse.json({
      total: tickets.length,
      byColumn,
      byPriority,
      byProject,
      avgProcessingTime: completedCount > 0 ? Math.round(totalProcessingTime / completedCount) : null,
      completedThisWeek,
      completedThisMonth,
      projects: projectsData.projects,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
