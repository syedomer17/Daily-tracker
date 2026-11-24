/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authModule from "@/auth";
import * as mongoModule from "@/lib/mongodb";
import { GET as getSync, POST as postSync } from "@/app/api/sync/route";
import { GET as getReviews, POST as postReviews } from "@/app/api/reviews/route";
import { GET as getTimetable, POST as postTimetable } from "@/app/api/timetable/route";
import { GET as getClaimLegacy, POST as postClaimLegacy } from "@/app/api/migration/claim-legacy/route";

describe("API Security & Multi-Tenant Authorization Tests", () => {
  let mockCollections: Record<string, any[]> = {};

  const createMockDb = () => ({
    collection: (name: string) => ({
      findOne: vi.fn(async (query: any) => {
        const items = mockCollections[name] || [];
        return (
          items.find((item) => {
            for (const key of Object.keys(query)) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          }) || null
        );
      }),
      find: vi.fn((query: any) => {
        const getFiltered = () => {
          const items = mockCollections[name] || [];
          return items.filter((item) => {
            for (const key of Object.keys(query)) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
        };
        const cursor: any = {
          toArray: vi.fn(async () => getFiltered()),
          sort: vi.fn(() => cursor),
          project: vi.fn(() => cursor),
        };
        return cursor;
      }),
      updateOne: vi.fn(async (filter: any, update: any, options?: any) => {
        if (!mockCollections[name]) mockCollections[name] = [];
        const items = mockCollections[name];
        const index = items.findIndex((item) => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });

        const newDoc = {
          ...(index >= 0 ? items[index] : {}),
          ...filter,
          ...(update.$set || {}),
        };

        if (index >= 0) {
          items[index] = newDoc;
        } else if (options?.upsert) {
          items.push(newDoc);
        }
        return { acknowledged: true, upsertedCount: index >= 0 ? 0 : 1 };
      }),
      insertOne: vi.fn(async (doc: any) => {
        if (!mockCollections[name]) mockCollections[name] = [];
        mockCollections[name].push(doc);
        return { acknowledged: true, insertedId: "mock_id" };
      }),
    }),
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    mockCollections = {
      users: [],
      user_tracker_state: [],
      user_reviews: [],
      user_timetables: [],
      app_state: [],
      legacy_backups: [],
    };

    vi.spyOn(mongoModule, "isMongoConnected").mockResolvedValue(true);
    vi.spyOn(mongoModule, "getDb").mockResolvedValue(createMockDb() as any);
  });

  describe("1. Unauthenticated Access Protection (401 Unauthorized)", () => {
    beforeEach(() => {
      vi.spyOn(authModule, "auth").mockResolvedValue(null as any);
    });

    it("GET /api/sync should return 401 when unauthenticated", async () => {
      const res = await getSync();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Authentication required/i);
    });

    it("POST /api/sync should return 401 when unauthenticated", async () => {
      const req = new Request("http://localhost:3000/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dsaCount: 10 }),
      });
      const res = await postSync(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/reviews should return 401 when unauthenticated", async () => {
      const res = await getReviews();
      expect(res.status).toBe(401);
    });

    it("POST /api/reviews should return 401 when unauthenticated", async () => {
      const req = new Request("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-11-23" }),
      });
      const res = await postReviews(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/timetable should return 401 when unauthenticated", async () => {
      const res = await getTimetable();
      expect(res.status).toBe(401);
    });

    it("POST /api/timetable should return 401 when unauthenticated", async () => {
      const req = new Request("http://localhost:3000/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates: { college: [], noCollege: [] } }),
      });
      const res = await postTimetable(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/migration/claim-legacy should return 401 when unauthenticated", async () => {
      const res = await getClaimLegacy();
      expect(res.status).toBe(401);
    });

    it("POST /api/migration/claim-legacy should return 401 when unauthenticated", async () => {
      const req = new Request("http://localhost:3000/api/migration/claim-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const res = await postClaimLegacy(req);
      expect(res.status).toBe(401);
    });
  });

  describe("2. Payload Validation & Rejection (400 Bad Request)", () => {
    beforeEach(() => {
      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_alice", name: "Alice", email: "alice@example.com" },
      } as any);
    });

    it("POST /api/sync should reject invalid JSON with 400", async () => {
      const req = new Request("http://localhost:3000/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json{",
      });
      const res = await postSync(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Invalid JSON payload/i);
    });

    it("POST /api/sync should reject invalid schema with 400 and validation details", async () => {
      const req = new Request("http://localhost:3000/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayType: "invalid-type",
          dsaCount: -1,
        }),
      });
      const res = await postSync(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.details).toBeDefined();
    });

    it("POST /api/reviews should reject invalid date with 400", async () => {
      const req = new Request("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "bad-date-format",
          whatWentWell: "Good",
          whatBlockedMe: "None",
          githubUpdated: true,
          tomorrowDayType: "college",
        }),
      });
      const res = await postReviews(req);
      expect(res.status).toBe(400);
    });
  });

  describe("3. Multi-Tenant Data Isolation (User A vs User B)", () => {
    const validSyncPayloadAlice = {
      dayType: "college",
      dsaCount: 42,
      sqlCount: 18,
      deepWorkMinutesToday: 90,
      completedBlocks: { "2026-11-23_1": true },
      salahRecords: {
        "2026-11-23": { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
      },
      habitLogs: [],
      dailyReviews: [],
      weeklyGoals: [],
      milestones: [],
    };

    it("User A saves data; User B cannot read User A's data", async () => {
      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_alice", name: "Alice", email: "alice@example.com" },
      } as any);

      const alicePostReq = new Request("http://localhost:3000/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validSyncPayloadAlice),
      });
      const postResAlice = await postSync(alicePostReq);
      expect(postResAlice.status).toBe(200);

      const getResAlice = await getSync();
      const aliceData = await getResAlice.json();
      expect(aliceData.data.dsaCount).toBe(42);

      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_bob", name: "Bob", email: "bob@example.com" },
      } as any);

      const getResBob = await getSync();
      const bobData = await getResBob.json();
      expect(bobData.data).toBeNull();

      const bobReviewReq = new Request("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-11-23",
          whatWentWell: "Bob solved 5 SQL problems",
          whatBlockedMe: "None",
          githubUpdated: true,
          tomorrowDayType: "no-college",
        }),
      });
      await postReviews(bobReviewReq);

      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_alice", name: "Alice", email: "alice@example.com" },
      } as any);

      const aliceReviewsRes = await getReviews();
      const aliceReviews = await aliceReviewsRes.json();
      expect(aliceReviews.reviews.length).toBe(0);
    });
  });

  describe("4. Legacy Claim Migration Protection", () => {
    it("backs up legacy data and moves it strictly to authenticated user", async () => {
      mockCollections.app_state.push({
        key: "current_user_state",
        data: { dsaCount: 99, sqlCount: 88 },
        updatedAt: "2026-11-20T10:00:00Z",
      });

      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_alice", name: "Alice", email: "alice@example.com" },
      } as any);

      const claimCheck = await getClaimLegacy();
      const previewJson = await claimCheck.json();
      expect(previewJson.availableToClaim).toBe(true);
      expect(previewJson.preview.dsaCount).toBe(99);

      const claimReq = new Request("http://localhost:3000/api/migration/claim-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const claimRes = await postClaimLegacy(claimReq);
      expect(claimRes.status).toBe(200);

      expect(mockCollections.legacy_backups.length).toBe(1);
      expect(mockCollections.legacy_backups[0].claimedByUserId).toBe("user_alice");

      const legacyDoc = mockCollections.app_state.find((d) => d.key === "current_user_state");
      expect(legacyDoc.claimed).toBe(true);
      expect(legacyDoc.claimedByUserId).toBe("user_alice");

      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user_bob", name: "Bob", email: "bob@example.com" },
      } as any);

      const bobClaimReq = new Request("http://localhost:3000/api/migration/claim-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const bobClaimRes = await postClaimLegacy(bobClaimReq);
      expect(bobClaimRes.status).toBe(403);
    });
  });
});
