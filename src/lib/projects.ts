import fs from "fs";
import path from "path";

const TICKETS_BASE = process.env.TICKETS_DIR ?? path.join(process.cwd(), "tickets");
const PROJECTS_FILE = path.join(TICKETS_BASE, "projects.json");

export const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
  "#6366f1", // indigo
  "#f97316", // orange
];

export interface Project {
  name: string;
  color: string;
  archived: boolean;
  colorIndex: number; // index into PROJECT_COLORS, -1 if overflow (uses last color)
}

export interface ProjectsData {
  projects: Project[];
}

export function readProjects(): ProjectsData {
  if (!fs.existsSync(PROJECTS_FILE)) {
    return { projects: [] };
  }
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf-8")) as ProjectsData;
}

export function writeProjects(data: ProjectsData): void {
  fs.mkdirSync(path.dirname(PROJECTS_FILE), { recursive: true });
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getProjectColor(name: string, data: ProjectsData): string {
  const project = data.projects.find((p) => p.name === name);
  if (!project) return PROJECT_COLORS[PROJECT_COLORS.length - 1];
  if (project.colorIndex < 0 || project.colorIndex >= PROJECT_COLORS.length) {
    return PROJECT_COLORS[PROJECT_COLORS.length - 1];
  }
  return PROJECT_COLORS[project.colorIndex];
}

/**
 * Assign a color index to a new project.
 * Finds the lowest free color index among active (non-archived) projects.
 * If all 10 are taken, returns -1 (overflow → last color).
 */
export function assignColorIndex(data: ProjectsData): number {
  const usedIndices = new Set(
    data.projects
      .filter((p) => !p.archived && p.colorIndex >= 0)
      .map((p) => p.colorIndex)
  );
  for (let i = 0; i < PROJECT_COLORS.length; i++) {
    if (!usedIndices.has(i)) return i;
  }
  return -1; // overflow
}

export function addProject(name: string): Project {
  const data = readProjects();
  const existing = data.projects.find((p) => p.name === name);
  if (existing) return existing;

  const colorIndex = assignColorIndex(data);
  const color =
    colorIndex >= 0
      ? PROJECT_COLORS[colorIndex]
      : PROJECT_COLORS[PROJECT_COLORS.length - 1];
  const project: Project = { name, color, archived: false, colorIndex };
  data.projects.push(project);
  writeProjects(data);
  return project;
}

export function archiveProject(name: string): void {
  const data = readProjects();
  const project = data.projects.find((p) => p.name === name);
  if (!project) return;
  project.archived = true;

  // Free up the color: find another active project sharing this color (overflow case) and reassign it
  if (project.colorIndex >= 0) {
    const overflow = data.projects.find(
      (p) => !p.archived && p.colorIndex === -1
    );
    if (overflow) {
      overflow.colorIndex = project.colorIndex;
      overflow.color = PROJECT_COLORS[project.colorIndex];
    }
  }

  writeProjects(data);
}
