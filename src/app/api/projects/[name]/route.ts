import { NextRequest, NextResponse } from "next/server";
import { readProjects, writeProjects, archiveProject, PROJECT_COLORS, assignColorIndex } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const projectName = decodeURIComponent(name);
    const body = await req.json();
    const { archived, color } = body as { archived?: boolean; color?: string };

    if (archived === true) {
      archiveProject(projectName);
    }

    if (archived === false) {
      // Unarchive: re-assign a color index
      const data = readProjects();
      const project = data.projects.find((p) => p.name === projectName);
      if (project && project.archived) {
        project.archived = false;
        const colorIndex = assignColorIndex(data);
        project.colorIndex = colorIndex;
        project.color = colorIndex >= 0
          ? PROJECT_COLORS[colorIndex]
          : PROJECT_COLORS[PROJECT_COLORS.length - 1];
        writeProjects(data);
      }
    }

    if (color) {
      const data = readProjects();
      const project = data.projects.find((p) => p.name === projectName);
      if (project) {
        project.color = color;
        // Update colorIndex if color matches a known palette color
        const idx = PROJECT_COLORS.indexOf(color);
        project.colorIndex = idx >= 0 ? idx : -1;
        writeProjects(data);
      }
    }

    const data = readProjects();
    const updated = data.projects.find((p) => p.name === projectName);
    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
