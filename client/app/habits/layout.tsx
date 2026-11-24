import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habits & Spiritual Consistency",
  description:
    "Track 5 daily prayers (Salah), Islamic habits, Quran recitation, and daily discipline.",
  openGraph: {
    title: "Habits & Spiritual Consistency | DeenSync",
    description: "Track daily prayers, Islamic spiritual routines, and healthy habit streaks.",
  },
};

export default function HabitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
