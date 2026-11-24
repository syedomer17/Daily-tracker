import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Review & Reflection",
  description:
    "End-of-day reflection, productivity scoring, daily accomplishments, and next-day schedule planning.",
  openGraph: {
    title: "Daily Review & Reflection | DeenSync",
    description:
      "End-of-day reflection, productivity self-assessment, and tomorrow's preparation.",
  },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
