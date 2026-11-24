/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedUser, apiError, checkPayloadSize } from "@/lib/auth-helpers";
import * as authModule from "@/auth";

describe("Server-Side Authentication & Helper Security", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null when session is absent (unauthenticated)", async () => {
    vi.spyOn(authModule, "auth").mockResolvedValue(null as any);
    const user = await getAuthenticatedUser();
    expect(user).toBeNull();
  });

  it("should return null when session user has no ID", async () => {
    vi.spyOn(authModule, "auth").mockResolvedValue({ user: {} } as any);
    const user = await getAuthenticatedUser();
    expect(user).toBeNull();
  });

  it("should return authenticated user details when session is valid", async () => {
    vi.spyOn(authModule, "auth").mockResolvedValue({
      user: {
        id: "usr_12345_secure",
        name: "Test Developer",
        email: "dev@example.com",
        image: "https://github.com/avatar.png",
      },
      expires: "2027-01-01",
    } as any);

    const user = await getAuthenticatedUser();
    expect(user).not.toBeNull();
    expect(user?.id).toBe("usr_12345_secure");
    expect(user?.email).toBe("dev@example.com");
  });

  it("apiError should return safe error response without exposing internal errors", async () => {
    const res = apiError(400, "Validation failed", { field: "dsaCount is required" });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({ field: "dsaCount is required" });
    expect(body.stack).toBeUndefined();
  });

  it("checkPayloadSize should reject requests exceeding byte limit", () => {
    const smallReq = new Request("http://localhost:3000/api/sync", {
      headers: { "content-length": "1024" },
    });
    expect(checkPayloadSize(smallReq, 2048)).toBe(true);

    const hugeReq = new Request("http://localhost:3000/api/sync", {
      headers: { "content-length": "5000000" },
    });
    expect(checkPayloadSize(hugeReq, 1024 * 1024)).toBe(false);
  });
});
