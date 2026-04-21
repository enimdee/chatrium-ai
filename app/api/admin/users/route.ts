import { NextResponse } from "next/server";
import { readSettings } from "@/lib/admin/settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function splitEmails(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** GET /api/admin/users — returns the user list for the admin UI. */
export async function GET() {
  const settings = await readSettings();
  const adminEnv = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  const adminEmails = splitEmails(settings.admin_emails);
  const allowedEmails = splitEmails(settings.allowed_emails);

  // Merge into a unified list (deduplicated)
  const all = new Set([
    ...(adminEnv ? [adminEnv] : []),
    ...adminEmails,
    ...allowedEmails,
  ]);

  const users = [...all].map((email) => ({
    email,
    role: adminEmails.includes(email) || email === adminEnv ? "admin" : "staff",
    isEnvAdmin: email === adminEnv,
  }));

  return NextResponse.json({ users });
}
