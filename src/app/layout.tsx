import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
