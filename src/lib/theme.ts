export type Theme = "light" | "dark" | "auto";

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // auto: use system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
  localStorage.setItem("theme", theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "auto";
  return (localStorage.getItem("theme") as Theme) ?? "auto";
}
