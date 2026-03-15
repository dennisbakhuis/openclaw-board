import { NextRequest, NextResponse } from "next/server";
import { readAllTickets, writeTicket } from "@/lib/tickets";
import type { Column, Priority, Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const column = searchParams.get("column") as Column | null;
    const priority = searchParams.get("priority") as Priority | null;
    const label = searchParams.get("label");
    const q = searchParams.get("q");

    let tickets: Ticket[] = readAllTickets();

    if (column) {
      tickets = tickets.filter((t) => t.column === column);
    }
    if (priority) {
      tickets = tickets.filter((t) => t.priority === priority);
    }
    if (label) {
      tickets = tickets.filter((t) => t.labels.includes(label));
    }
    if (q) {
      const lower = q.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower)
      );
    }

    tickets.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, priority, labels, column } = body as {
      title: string;
      description?: string;
      priority?: Priority;
      labels?: string[];
      column?: Column;
    };

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      title,
      description: description ?? "",
      priority: priority ?? "medium",
      labels: labels ?? [],
      created: new Date().toISOString(),
      column: column ?? "todo",
    };

    writeTicket(ticket, ticket.column);
    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
