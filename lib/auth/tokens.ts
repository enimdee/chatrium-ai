/**
 * Magic-link token store — file-based (DATA_DIR/auth-tokens.json).
 * Tokens are single-use, 15-minute TTL.
 * Phase 2: migrate to DB verificationTokens table.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ulid } from "ulid";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "auth-tokens.json");

/** 15 minutes in milliseconds. */
const TTL_MS = 15 * 60 * 1000;

interface MagicToken {
  token: string;
  email: string;
  expires_at: string; // ISO-8601
  used: boolean;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readAll(): Promise<MagicToken[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as MagicToken[];
  } catch {
    return [];
  }
}

/** Prune expired tokens and persist. */
async function persist(tokens: MagicToken[]): Promise<void> {
  await ensureDir();
  const now = new Date();
  const fresh = tokens.filter((t) => new Date(t.expires_at) > now);
  await fs.writeFile(FILE, JSON.stringify(fresh), "utf8");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Generate a new magic token for the given email and store it. Returns the token. */
export async function generateMagicToken(email: string): Promise<string> {
  const all = await readAll();
  const token = ulid();
  const expires_at = new Date(Date.now() + TTL_MS).toISOString();
  await persist([...all, { token, email: email.toLowerCase(), expires_at, used: false }]);
  return token;
}

/**
 * Verify a magic token.
 * Returns the associated email on success, or null if invalid/expired/already-used.
 * Marks the token as used on success (single-use).
 */
export async function verifyMagicToken(token: string): Promise<string | null> {
  const all = await readAll();
  const entry = all.find((t) => t.token === token);

  if (!entry || entry.used || new Date(entry.expires_at) < new Date()) {
    return null;
  }

  // Mark used
  await persist(all.map((t) => (t.token === token ? { ...t, used: true } : t)));
  return entry.email;
}
