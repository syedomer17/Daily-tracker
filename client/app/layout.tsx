import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Deen & Dunya Tracker — Career & Daily Routine System",
  description: "Personal daily routine, Islamic habits, DSA practice, and career-goal tracking to land a top tech job by July 2027.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300 font-sans transition-colors duration-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
