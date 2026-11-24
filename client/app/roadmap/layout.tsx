import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Roadmap & Milestones",
  description:
    "Strategic career milestones, DSA & SQL preparation targets, and skills checklist toward July 2027.",
  openGraph: {
    title: "Career Roadmap & Milestones | DeenSync",
    description:
      "Long-term engineering career milestones and target progress toward July 2027.",
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
