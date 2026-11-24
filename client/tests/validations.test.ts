/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
  SyncPayloadSchema,
  ReviewPayloadSchema,
  TimetablePayloadSchema,
  ClaimLegacyPayloadSchema,
} from "@/lib/validations";

describe("Zod Payload Validation Security", () => {
  describe("SyncPayloadSchema", () => {
    const validSyncPayload = {
      dayType: "college",
      dsaCount: 25,
      sqlCount: 15,
      deepWorkMinutesToday: 120,
      completedBlocks: { "2026-11-23_1": true },
      salahRecords: {
        "2026-11-23": {
          fajr: true,
          dhuhr: true,
          asr: true,
          maghrib: true,
          isha: true,
        },
      },
      habitLogs: [],
      dailyReviews: [],
      weeklyGoals: [],
      milestones: [],
    };

    it("should accept a valid sync payload", () => {
      const res = SyncPayloadSchema.safeParse(validSyncPayload);
      expect(res.success).toBe(true);
    });

    it("should reject negative counter values", () => {
      const res = SyncPayloadSchema.safeParse({
        ...validSyncPayload,
        dsaCount: -5,
      });
      expect(res.success).toBe(false);
    });

    it("should reject unsupported day types", () => {
      const res = SyncPayloadSchema.safeParse({
        ...validSyncPayload,
        dayType: "holiday_mode",
      });
      expect(res.success).toBe(false);
    });

    it("should reject malformed salah records", () => {
      const res = SyncPayloadSchema.safeParse({
        ...validSyncPayload,
        salahRecords: {
          "2026-11-23": { fajr: "yes", dhuhr: 1 } as any,
        },
      });
      expect(res.success).toBe(false);
    });
  });

  describe("ReviewPayloadSchema", () => {
    it("should accept a valid review payload", () => {
      const validReview = {
        date: "2026-11-23",
        whatWentWell: "Completed 3 DSA questions on binary search trees.",
        whatBlockedMe: "Struggled with SQL recursive CTEs.",
        githubUpdated: true,
        tomorrowDayType: "no-college",
      };
      const res = ReviewPayloadSchema.safeParse(validReview);
      expect(res.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const invalidReview = {
        date: "23-11-2026", // Invalid format
        whatWentWell: "Good day",
        whatBlockedMe: "None",
        githubUpdated: false,
        tomorrowDayType: "college",
      };
      const res = ReviewPayloadSchema.safeParse(invalidReview);
      expect(res.success).toBe(false);
    });

    it("should reject text exceeding max length limits (anti-DoS)", () => {
      const oversizedReview = {
        date: "2026-11-23",
        whatWentWell: "A".repeat(6000), // Exceeds 5000 chars limit
        whatBlockedMe: "None",
        githubUpdated: false,
        tomorrowDayType: "college",
      };
      const res = ReviewPayloadSchema.safeParse(oversizedReview);
      expect(res.success).toBe(false);
    });
  });

  describe("TimetablePayloadSchema", () => {
    it("should reject invalid 24-hour time formats", () => {
      const invalidTimetable = {
        templates: {
          college: [
            {
              id: "block-1",
              startTime: "25:70", // Invalid time
              endTime: "26:80",
              title: "Fajr",
              description: "Prayer",
              category: "deen",
              durationMinutes: 30,
            },
          ],
          noCollege: [],
        },
      };
      const res = TimetablePayloadSchema.safeParse(invalidTimetable);
      expect(res.success).toBe(false);
    });

    it("should reject unapproved categories", () => {
      const invalidCategory = {
        templates: {
          college: [
            {
              id: "block-1",
              startTime: "05:00",
              endTime: "05:30",
              title: "Gaming",
              description: "Play games",
              category: "entertainment", // Invalid category
              durationMinutes: 30,
            },
          ],
          noCollege: [],
        },
      };
      const res = TimetablePayloadSchema.safeParse(invalidCategory);
      expect(res.success).toBe(false);
    });
  });

  describe("ClaimLegacyPayloadSchema", () => {
    it("should require confirmation to be explicitly true", () => {
      expect(ClaimLegacyPayloadSchema.safeParse({ confirm: false }).success).toBe(false);
      expect(ClaimLegacyPayloadSchema.safeParse({ confirm: true }).success).toBe(true);
      expect(ClaimLegacyPayloadSchema.safeParse({}).success).toBe(false);
    });
  });
});
