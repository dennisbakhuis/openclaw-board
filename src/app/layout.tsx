import type { Metadata } from "next";
import "./globals.css";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "OpenClaw Board",
  description: "Kanban board — tickets as markdown files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0f0f0f", margin: 0, padding: 0 }}>
        <header
          className="flex items-center gap-3 border-b px-6 py-4"
          style={{ borderColor: "#2a2a2a", backgroundColor: "#0a0a0a" }}
        >
          <Logo size={32} />
          <span
            className="text-lg font-semibold tracking-tight text-white"
          >
            OpenClaw Board
          </span>
        </header>
        {children}
      </body>
    </html>
  );
}
