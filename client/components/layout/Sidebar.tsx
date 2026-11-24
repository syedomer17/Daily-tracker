"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Flame,
  Milestone as MilestoneIcon,
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Daily Timetable",
    href: "/schedule",
    icon: CalendarClock,
    badge: "18 blocks",
  },
  {
    name: "Habits & Streaks",
    href: "/habits",
    icon: Flame,
    badge: "90 Days",
  },
  {
    name: "Career Roadmap",
    href: "/roadmap",
    icon: MilestoneIcon,
    badge: "July 2027",
  },
  {
    name: "Analytics & Reports",
    href: "/analytics",
    icon: BarChart3,
    badge: "Insights",
  },
  {
    name: "Daily Review",
    href: "/review",
    icon: BookOpenCheck,
    badge: "9:00 PM",
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const todayDate = useTrackerStore((s) => s.todayDate);
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const dsaCount = useTrackerStore((s) => s.dsaCount);

  const completionPercent = useMemo(() => {
    const list = dayType === "college" ? collegeTimetable : noCollegeTimetable;
    if (list.length === 0) return 0;
    const count = list.filter((b) => !!completedBlocks[`${todayDate}_${b.id}`]).length;
    return Math.round((count / list.length) * 100);
  }, [dayType, collegeTimetable, noCollegeTimetable, completedBlocks, todayDate]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur transition-all duration-300 lg:static shadow-sm",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 transition-colors">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-emerald-950/30 border border-emerald-500/20 bg-zinc-900">
              <Image
                src="/apple-touch-icon.png"
                alt="DeenSync Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 text-sm">
                  DeenSync
                  <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Tech Career & Akhirah
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Schedule Mode Pill in Sidebar */}
        {!collapsed && (
          <div className="mx-3 mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 transition-colors">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Today&apos;s Schedule</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{completionPercent}% Done</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                {dayType === "college" ? (
                  <GraduationCap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                ) : (
                  <Code2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                )}
                {dayType === "college" ? "College Day" : "No College Day"}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 font-mono">DSA: {dsaCount}/150</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                  )}
                />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                          isActive
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                            : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        {session?.user && (
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 p-3 transition-colors">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40",
                collapsed && "justify-center px-0"
              )}
              title="Sign out"
            >
              <LogOut className="h-4 w-4 shrink-0 transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
