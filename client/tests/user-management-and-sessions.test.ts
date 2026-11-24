/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import * as mongoModule from "@/lib/mongodb";
import { handlers } from "@/auth";

describe("User Management & OAuth Account Linking Security", () => {
  let mockUsers: any[] = [];

  const mockDb = {
    collection: vi.fn(() => ({
      findOne: vi.fn(async (query: any) => {
        return (
          mockUsers.find((u) => {
            for (const key of Object.keys(query)) {
              if (u[key] !== query[key]) return false;
            }
            return true;
          }) || null
        );
      }),
      insertOne: vi.fn(async (doc: any) => {
        mockUsers.push(doc);
        return { acknowledged: true, insertedId: doc._id };
      }),
      updateOne: vi.fn(async (filter: any, update: any) => {
        const index = mockUsers.findIndex((u) => {
          for (const key of Object.keys(filter)) {
            if (u[key] !== queryValueMatch(u[key], filter[key])) return false;
          }
          return true;
        });
        if (index >= 0) {
          mockUsers[index] = { ...mockUsers[index], ...(update.$set || {}) };
        }
        return { acknowledged: true };
      }),
      createIndex: vi.fn(async () => "index_created"),
    })),
  };

  function queryValueMatch(actual: any, expected: any) {
    if (expected instanceof ObjectId && actual instanceof ObjectId) {
      return actual.equals(expected) ? expected : null;
    }
    return expected;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    mockUsers = [];
    vi.spyOn(mongoModule, "getDb").mockResolvedValue(mockDb as any);
  });

  it("ensureDatabaseIndexes calls unique indexes for user isolation", async () => {
    const db = mockDb;
    await mongoModule.ensureDatabaseIndexes(db as any);
    expect(db.collection).toHaveBeenCalledWith("users");
    expect(db.collection).toHaveBeenCalledWith("user_tracker_state");
    expect(db.collection).toHaveBeenCalledWith("user_timetables");
    expect(db.collection).toHaveBeenCalledWith("user_reviews");
  });

  it("Auth.js route handler is exported and handles GET /api/auth/providers", async () => {
    const req = new Request("http://localhost:3000/api/auth/providers");
    const res = await (handlers.GET as any)(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.github).toBeDefined();
    expect(json.github.id).toBe("github");
    expect(json.github.name).toBe("GitHub");
  });
});
