import { type NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/auth/tokens";
import { checkEmailAccess } from "@/lib/auth/access";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  // Verify magic token
  const email = await verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  // Re-check access in case allow-list changed since the token was issued
  const role = await checkEmailAccess(email);
  if (!role) {
    return NextResponse.redirect(new URL("/login?error=access_denied", req.url));
  }

  // Create session
  const sessionToken = await createSessionToken(email, role);

  // Set cookie and redirect to compose page
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  return res;
}
