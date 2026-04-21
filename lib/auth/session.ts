/**
 * JWT-style session tokens — signed with HMAC-SHA256 via Web Crypto API.
 * Works in both Edge runtime (middleware) and Node.js (API routes).
 * No external dependencies required.
 */

export const SESSION_COOKIE = "__sess";
const SESSION_DURATION_S = 30 * 24 * 60 * 60; // 30 days

export interface SessionPayload {
  /** User email address. */
  sub: string;
  /** Access role. */
  role: "admin" | "staff";
  /** Issued-at (Unix seconds). */
  iat: number;
  /** Expiry (Unix seconds). */
  exp: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is not set. Add a 32-character random string to your environment.",
    );
  }
  return secret ?? "dev-only-secret-do-not-use-in-production-32chars";
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function strToBase64Url(str: string): string {
  return toBase64Url(new TextEncoder().encode(str).buffer as ArrayBuffer);
}

function fromBase64Url(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer as ArrayBuffer;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Create a signed session token string (cookie value). */
export async function createSessionToken(
  email: string,
  role: "admin" | "staff",
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: email.toLowerCase(),
    role,
    iat: now,
    exp: now + SESSION_DURATION_S,
  };

  const header = strToBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = strToBase64Url(JSON.stringify(payload));
  const message = `${header}.${body}`;

  const key = await importKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));

  return `${message}.${toBase64Url(sig)}`;
}

/** Verify a session token and return the payload, or null if invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const message = `${parts[0]}.${parts[1]}`;
    const sig = fromBase64Url(parts[2]!);

    const key = await importKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      new TextEncoder().encode(message),
    );
    if (!valid) return null;

    // Decode payload
    const payloadJson = new TextDecoder().decode(fromBase64Url(parts[1]!));
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Cookie options for set-cookie. */
export function sessionCookieOptions(maxAge = SESSION_DURATION_S) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
