import { NextRequest, NextResponse } from "next/server";
import { readProjects, addProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = readProjects();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body as { name: string };
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const project = addProject(name.trim());
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
