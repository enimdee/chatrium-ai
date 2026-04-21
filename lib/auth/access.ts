/**
 * Email allow-list logic.
 *
 * Priority order:
 * 1. ADMIN_EMAIL env var — always admin, used for initial bootstrap
 * 2. admin_emails in settings.json — additional admins
 * 3. allowed_emails in settings.json — staff access
 * 4. If ALL lists are empty → open bootstrap (first login becomes admin)
 */
import { readSettings } from "@/lib/admin/settings-store";

function splitEmails(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Check if the email is allowed to sign in.
 * Returns the role ("admin" | "staff") or null if not allowed.
 */
export async function checkEmailAccess(
  email: string,
): Promise<"admin" | "staff" | null> {
  const normalized = email.toLowerCase().trim();
  const adminEnv = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // 1. ADMIN_EMAIL env var — always works
  if (adminEnv && normalized === adminEnv) return "admin";

  const settings = await readSettings();
  const adminEmails = splitEmails(settings.admin_emails ?? "");
  const allowedEmails = splitEmails(settings.allowed_emails ?? "");

  // 2. Admin list
  if (adminEmails.includes(normalized)) return "admin";

  // 3. Staff list
  if (allowedEmails.includes(normalized)) return "staff";

  // 4. Bootstrap: if no emails configured at all, let anyone in as admin
  const hasAnyConfig = adminEnv || adminEmails.length > 0 || allowedEmails.length > 0;
  if (!hasAnyConfig) return "admin";

  return null;
}
