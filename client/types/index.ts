export type Category = 'deen' | 'tech' | 'college' | 'health';

export type DayType = 'college' | 'no-college';

export interface TimeBlock {
  id: string;
  startTime: string; // "HH:mm" in 24h format
  endTime: string;   // "HH:mm" in 24h format
  title: string;
  description: string;
  category: Category;
  isCompleted?: boolean;
  actualDurationMinutes?: number;
}

export type SalahName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type SalahStatus = {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
};

export interface HabitFlags {
  quran: boolean;
  salah5: boolean;
  exercise: boolean;
  deepWork: boolean;
  healthyFoodSleep: boolean;
}

export interface HabitLog extends HabitFlags {
  date: string; // YYYY-MM-DD
  completionRate: number; // 0 - 100
  notes?: string;
}

export interface DsaEntry {
  id: string;
  name?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  url?: string;
  timestamp: string;
}

export interface SqlEntry {
  id: string;
  queryName?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  timestamp: string;
}

export interface DeepWorkSession {
  id: string;
  blockId?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationMinutes: number;
  plannedMinutes?: number;
}

export interface DailyRecord {
  userId?: string;
  date: string; // YYYY-MM-DD in Asia/Kolkata
  dayType: DayType;
  dsaCount: number;
  dsaEntries?: DsaEntry[];
  sqlCount: number;
  sqlEntries?: SqlEntry[];
  deepWorkMinutes: number;
  deepWorkSessions?: DeepWorkSession[];
  completedBlocks: Record<string, boolean>; // key: blockId
  salah: SalahStatus;
  habits: HabitFlags;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  date: string;
  githubUpdated: boolean;
  githubCommitsCount?: number;
  wentWell: string;
  blockedBy: string;
  tomorrowPriority: string;
  tomorrowDayType: DayType;
  moodScore: number; // 1 to 5
  energyScore: number; // 1 to 5
  createdAt: string;
}

export interface MilestoneChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Milestone {
  id: string;
  phase: string;
  period: string; // e.g. "Dec - Jan"
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  targetDate: string;
  skills: string[];
  checklist: MilestoneChecklistItem[];
}

export interface WeeklyGoal {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  targetMetric?: string;
  currentMetric?: string;
}

export interface DailyAnalyticsRecord {
  date: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue", etc.
  deenHours: number;
  techHours: number;
  collegeHours: number;
  healthHours: number;
  dsaCount: number;
  sqlCount: number;
  salahCount: number; // 0 - 5
  habitsCompleted: number; // 0 - 5
}
