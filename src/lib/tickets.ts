import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Column = "todo" | "in-progress" | "review" | "done" | "archived";
export type Priority = "low" | "medium" | "high";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  created: string;
  column: Column;
  project?: string;
}

const COLUMNS: Column[] = ["todo", "in-progress", "review", "done"];
const TICKETS_BASE =
  process.env.TICKETS_DIR ?? path.join(process.cwd(), "tickets");

function columnDir(column: Column): string {
  return path.join(TICKETS_BASE, column);
}

function ticketFilePath(id: string, column: Column): string {
  return path.join(columnDir(column), `${id}.md`);
}

function parseTicketFile(filePath: string, column: Column): Ticket | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      id: data.id ?? path.basename(filePath, ".md"),
      title: data.title ?? "Untitled",
      description: content.trim(),
      priority: (data.priority as Priority) ?? "medium",
      labels: Array.isArray(data.labels) ? data.labels : [],
      created: data.created ?? new Date().toISOString(),
      column,
      project: data.project ?? undefined,
    };
  } catch {
    return null;
  }
}

// Ensure required folders exist
export function ensureFolders(): void {
  const allColumns: Column[] = [...COLUMNS, "archived"];
  for (const col of allColumns) {
    fs.mkdirSync(columnDir(col), { recursive: true });
  }
}

export function readAllTickets(includeArchived = false): Ticket[] {
  // Ensure folders exist
  ensureFolders();

  const tickets: Ticket[] = [];
  const columnsToRead: Column[] = includeArchived
    ? [...COLUMNS, "archived"]
    : COLUMNS;

  for (const column of columnsToRead) {
    const dir = columnDir(column);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const ticket = parseTicketFile(path.join(dir, file), column);
      if (ticket) tickets.push(ticket);
    }
  }
  return tickets;
}

export function findTicket(
  id: string
): { ticket: Ticket; column: Column; filePath: string } | null {
  const allColumns: Column[] = [...COLUMNS, "archived"];
  for (const column of allColumns) {
    const fp = ticketFilePath(id, column);
    if (fs.existsSync(fp)) {
      const ticket = parseTicketFile(fp, column);
      if (ticket) return { ticket, column, filePath: fp };
    }
  }
  return null;
}

export function writeTicket(ticket: Ticket, column: Column): void {
  const dir = columnDir(column);
  fs.mkdirSync(dir, { recursive: true });
  const frontmatter: Record<string, unknown> = {
    id: ticket.id,
    title: ticket.title,
    priority: ticket.priority,
    labels: ticket.labels,
    created: ticket.created,
  };
  if (ticket.project) {
    frontmatter.project = ticket.project;
  }
  const fileContent = matter.stringify(ticket.description, frontmatter);
  fs.writeFileSync(ticketFilePath(ticket.id, column), fileContent, "utf-8");
}

export function moveTicket(id: string, newColumn: Column): void {
  const found = findTicket(id);
  if (!found) throw new Error(`Ticket not found: ${id}`);
  const { ticket, filePath } = found;
  fs.unlinkSync(filePath);
  writeTicket({ ...ticket, column: newColumn }, newColumn);
}

export function deleteTicket(id: string): void {
  const found = findTicket(id);
  if (!found) throw new Error(`Ticket not found: ${id}`);
  fs.unlinkSync(found.filePath);
}
