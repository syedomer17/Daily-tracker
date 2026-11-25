import { z } from "zod";

// TimeBlock Validation
export const TimeBlockSchema = z.object({
  id: z.string().min(1).max(100),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid 24h format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid 24h format (HH:MM)"),
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  category: z.enum(["deen", "tech", "college", "health"]),
  durationMinutes: z.number().int().min(1).max(1440),
  subtasks: z.array(z.string().max(200)).optional(),
});

export const TimetablePayloadSchema = z.object({
  templates: z.object({
    college: z.array(TimeBlockSchema).max(50),
    noCollege: z.array(TimeBlockSchema).max(50),
  }),
});

// Salah Daily Record Validation
export const DailySalahSchema = z.object({
  fajr: z.boolean(),
  dhuhr: z.boolean(),
  asr: z.boolean(),
  maghrib: z.boolean(),
  isha: z.boolean(),
});

// Habit Flags Validation
export const HabitFlagsSchema = z.object({
  quran: z.boolean(),
  salah5: z.boolean(),
  exercise: z.boolean(),
  deepWork: z.boolean(),
  healthyFoodSleep: z.boolean(),
});

// Habit Log Validation (with completionRate)
export const HabitLogItemSchema = z.object({
  id: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  quran: z.boolean(),
  salah5: z.boolean(),
  exercise: z.boolean(),
  deepWork: z.boolean(),
  healthySleep: z.boolean().optional(),
  healthyFoodSleep: z.boolean().optional(),
  completionRate: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
});

// DSA Entry Validation
export const DsaEntrySchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  topic: z.string().max(100).optional(),
  url: z.string().url().max(500).optional().or(z.literal("")),
  timestamp: z.string(),
});

// SQL Entry Validation
export const SqlEntrySchema = z.object({
  id: z.string().max(100),
  queryName: z.string().max(200).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  topic: z.string().max(100).optional(),
  timestamp: z.string(),
});

// Deep Work Session Validation
export const DeepWorkSessionSchema = z.object({
  id: z.string().max(100),
  blockId: z.string().max(100).optional(),
  startTime: z.string(),
  endTime: z.string(),
  durationMinutes: z.number().int().min(0).max(1440),
  plannedMinutes: z.number().int().min(0).max(1440).optional(),
});

// Normalized Date-Wise Daily Record Validation
export const DailyRecordSchema = z.object({
  userId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  dayType: z.enum(["college", "no-college"]),
  dsaCount: z.number().int().min(0).max(100000),
  dsaEntries: z.array(DsaEntrySchema).max(500).optional(),
  sqlCount: z.number().int().min(0).max(100000),
  sqlEntries: z.array(SqlEntrySchema).max(500).optional(),
  deepWorkMinutes: z.number().int().min(0).max(1440),
  deepWorkSessions: z.array(DeepWorkSessionSchema).max(50).optional(),
  completedBlocks: z.record(z.string(), z.boolean()),
  salah: DailySalahSchema,
  habits: HabitFlagsSchema,
  quranProgress: z.record(z.string(), z.number().int().min(0)).optional(),
  notes: z.string().max(5000).optional(),
  version: z.number().int().min(0).default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Daily Review Validation
export const ReviewPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  whatWentWell: z.string().max(5000).optional(),
  wentWell: z.string().max(5000).optional(),
  whatBlockedMe: z.string().max(5000).optional(),
  blockedBy: z.string().max(5000).optional(),
  tomorrowPriority: z.string().max(5000).optional(),
  githubUpdated: z.boolean(),
  githubCommitsCount: z.number().int().min(0).max(1000).optional(),
  tomorrowDayType: z.enum(["college", "no-college"]),
  moodScore: z.number().int().min(1).max(5).optional(),
  energyScore: z.number().int().min(1).max(5).optional(),
  overallMood: z.string().max(50).optional(),
});

// Weekly Goal Validation
export const WeeklyGoalSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(200),
  category: z.enum(["deen", "tech", "college", "health"]),
  completed: z.boolean(),
  targetCount: z.number().int().min(0).max(10000).optional(),
  currentCount: z.number().int().min(0).max(10000).optional(),
  unit: z.string().max(50).optional(),
});

// Milestone Validation
export const MilestoneSchema = z.object({
  id: z.string().max(100),
  months: z.string().max(100).optional(),
  phase: z.string().max(100).optional(),
  period: z.string().max(100).optional(),
  title: z.string().max(200),
  description: z.string().max(1000),
  status: z.enum(["completed", "in-progress", "upcoming"]),
  targetRole: z.string().max(200).optional(),
  targetDate: z.string().max(100).optional(),
  skills: z.array(z.string().max(100)).optional(),
  checklist: z.array(
    z.object({
      id: z.string().max(100),
      text: z.string().max(500),
      done: z.boolean(),
    })
  ).optional(),
});

// Full Sync State Payload Validation (backward and forward compatible)
export const SyncPayloadSchema = z.object({
  dayType: z.enum(["college", "no-college"]).optional(),
  dayTypeByDate: z.record(z.string(), z.enum(["college", "no-college"])).optional(),
  dsaCount: z.number().int().min(0).max(100000).optional(),
  sqlCount: z.number().int().min(0).max(100000).optional(),
  deepWorkMinutesToday: z.number().int().min(0).max(1440).optional(),
  completedBlocks: z.record(z.string(), z.boolean()).optional(),
  salahRecords: z.record(z.string(), DailySalahSchema).optional(),
  habitLogs: z.array(HabitLogItemSchema).max(365).optional(),
  dailyRecords: z.record(z.string(), DailyRecordSchema).optional(),
  dailyReviews: z.array(ReviewPayloadSchema).max(365).optional(),
  weeklyGoals: z.array(WeeklyGoalSchema).max(50).optional(),
  milestones: z.array(MilestoneSchema).max(50).optional(),
  syncVersion: z.number().int().min(0).optional(),
  updatedAt: z.string().optional(),
});

// Single Daily Record Sync Payload
export const SingleDailyRecordSyncSchema = z.object({
  record: DailyRecordSchema,
});

// Claim Legacy Data Payload Validation
export const ClaimLegacyPayloadSchema = z.object({
  confirm: z.boolean().refine((val) => val === true, "Confirmation must be true"),
});
