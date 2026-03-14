import { NextRequest, NextResponse } from "next/server";
import { writeTicket } from "@/lib/tickets";
import type { Column, Priority, Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";

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
