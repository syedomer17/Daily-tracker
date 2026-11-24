import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Performance Reports",
  description:
    "Evidence-based daily, weekly, and monthly productivity reports, Recharts performance metrics, and streak tracking.",
  openGraph: {
    title: "Analytics & Performance Reports | DeenSync",
    description:
      "Detailed daily, weekly, and monthly productivity metrics, habit consistency, and study trends.",
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
