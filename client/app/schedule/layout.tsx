import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timetable & Daily Schedule",
  description:
    "Manage daily timetable schedules with College vs. No-College templates, customizable time blocks, and active execution.",
  openGraph: {
    title: "Timetable & Daily Schedule | DeenSync",
    description:
      "Customizable daily schedules, College and No-College routines, and live time block tracking.",
  },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
