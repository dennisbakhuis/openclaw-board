import { NextResponse } from "next/server";
import { readAllTickets } from "@/lib/tickets";
import type { Column, Priority } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tickets = readAllTickets();

    const byColumn: Record<Column, number> = {
      todo: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
    };

    const byPriority: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    for (const ticket of tickets) {
      byColumn[ticket.column]++;
      byPriority[ticket.priority]++;
    }

    return NextResponse.json({
      total: tickets.length,
      byColumn,
      byPriority,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
