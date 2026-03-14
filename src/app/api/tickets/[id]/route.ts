import { NextRequest, NextResponse } from "next/server";
import {
  findTicket,
  writeTicket,
  moveTicket,
  deleteTicket,
} from "@/lib/tickets";
import type { Column, Priority } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const found = findTicket(id);
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(found.ticket);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const found = findTicket(id);
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = {
    ...found.ticket,
    ...(body.title !== undefined && { title: body.title as string }),
    ...(body.description !== undefined && {
      description: body.description as string,
    }),
    ...(body.priority !== undefined && { priority: body.priority as Priority }),
    ...(body.labels !== undefined && { labels: body.labels as string[] }),
  };

  writeTicket(updated, found.column);
  return NextResponse.json(updated);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const newColumn = body.column as Column;

  if (!newColumn) {
    return NextResponse.json({ error: "column is required" }, { status: 400 });
  }

  try {
    moveTicket(id, newColumn);
    const found = findTicket(id);
    return NextResponse.json(found?.ticket ?? { id, column: newColumn });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    deleteTicket(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}
