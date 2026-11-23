import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime12(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function calculateTimeDiffMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  // If block wraps around midnight (e.g. 21:30 to 04:45)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  return endMinutes - startMinutes;
}

export const APP_TIME_ZONE = "Asia/Kolkata";

/** Today's date (YYYY-MM-DD) in Asia/Kolkata, regardless of the device timezone. */
export function getTodayDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getDaysUntilJuly2027(): {
  totalDays: number;
  months: number;
  days: number;
} {
  const now = new Date();
  const targetDate = new Date(2027, 6, 1); // July 1, 2027
  const diffTime = targetDate.getTime() - now.getTime();
  const totalDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const months = Math.floor(totalDays / 30.4375);
  const days = Math.floor(totalDays % 30.4375);
  
  return { totalDays, months, days };
}

export const CATEGORY_CONFIG = {
  deen: {
    label: "Deen / Spiritual",
    shortLabel: "Deen",
    badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badgeBgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-emerald-500",
    ring: "ring-emerald-500/20",
    accent: "#10b981",
    barColor: "#10b981",
    cardBg: "hover:border-emerald-500/40",
    iconName: "Moon",
  },
  tech: {
    label: "Tech / Coding / DSA",
    shortLabel: "Tech",
    badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    badgeBgLight: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-blue-500",
    ring: "ring-blue-500/20",
    accent: "#3b82f6",
    barColor: "#3b82f6",
    cardBg: "hover:border-blue-500/40",
    iconName: "Code2",
  },
  college: {
    label: "College / Academics",
    shortLabel: "College",
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    badgeBgLight: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-amber-500",
    ring: "ring-amber-500/20",
    accent: "#f59e0b",
    barColor: "#f59e0b",
    cardBg: "hover:border-amber-500/40",
    iconName: "GraduationCap",
  },
  health: {
    label: "Health / Workout / Sleep",
    shortLabel: "Health",
    badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    badgeBgLight: "bg-rose-50 text-rose-700 border-rose-200",
    border: "border-rose-500",
    ring: "ring-rose-500/20",
    accent: "#f43f5e",
    barColor: "#f43f5e",
    cardBg: "hover:border-rose-500/40",
    iconName: "HeartPulse",
  },
} as const;
