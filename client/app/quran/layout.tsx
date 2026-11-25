import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quran & Daily Adhkar",
  description:
    "Time-aware Quran recitation and post-prayer Adhkar: Surah Yasin at Fajr, Ayat al-Kursi & Three Quls at Dhuhr/Asr, Surah Al-Waqi'ah at Maghrib, Surah Al-Mulk & Baqarah at Isha, and Surah Al-Kahf on Fridays.",
  openGraph: {
    title: "Quran & Daily Adhkar | DeenSync",
    description:
      "Automated time-based Quran recitation and post-prayer Sunnah Adhkar for spiritual consistency.",
  },
};

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
