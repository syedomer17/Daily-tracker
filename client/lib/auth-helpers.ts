import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Server-side session verification.
 * Extracts and strictly validates user identity from the cryptographically signed session.
 * Never trusts client-supplied headers or body user IDs.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
  } catch {
    return null;
  }
}

/**
 * Standard safe error response.
 * Never leaks database errors, secrets, or internal stack traces.
 */
export function apiError(
  status: number,
  message: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

/**
 * Standard safe success response.
 */
export function apiSuccess(data: Record<string, unknown> = {}, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

/**
 * Checks content-length header to reject oversized payloads early.
 * Default max size: 500 KB.
 */
export function checkPayloadSize(req: Request, maxBytes: number = 512 * 1024): boolean {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return false;
  }
  return true;
}
