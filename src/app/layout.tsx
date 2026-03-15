import type { Metadata } from "next";
import "./globals.css";
import { Logo } from "@/components/Logo";
import { HeaderControls } from "@/components/HeaderControls";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'auto';if(t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="bg-[#f8f9fa] dark:bg-[#0f0f0f] text-gray-900 dark:text-white min-h-screen flex flex-col">
        <ThemeProvider>
          <header className="border-b border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <Logo size={28} />
              <span className="text-gray-900 dark:text-white font-semibold text-lg tracking-tight">
                OpenClaw Board
              </span>
            </div>
            <HeaderControls />
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-gray-200 dark:border-[#2a2a2a] py-4 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Created with ❤️ by{" "}
            <a
              href="https://github.com/dennisbakhuis/openclaw-board"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3b82f6] hover:underline"
            >
              Dennis Bakhuis
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
