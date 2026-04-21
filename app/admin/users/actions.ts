"use server";

import { readSettings, writeSettings } from "@/lib/admin/settings-store";
import { revalidatePath } from "next/cache";

function splitEmails(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function joinEmails(emails: string[]): string {
  return [...new Set(emails)].join("\n");
}

export type UsersActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

/** Add an email to the allow-list, optionally as admin. */
export async function addUser(
  _prev: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const role = formData.get("role") as "admin" | "staff";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Invalid email address." };
  }

  const settings = await readSettings();
  const allowed = splitEmails(settings.allowed_emails);
  const admins = splitEmails(settings.admin_emails);

  if (!allowed.includes(email)) allowed.push(email);
  if (role === "admin" && !admins.includes(email)) admins.push(email);
  if (role === "staff") {
    const idx = admins.indexOf(email);
    if (idx !== -1) admins.splice(idx, 1);
  }

  await writeSettings({
    allowed_emails: joinEmails(allowed),
    admin_emails: joinEmails(admins),
  });

  revalidatePath("/admin/users");
  return { status: "success", message: `${email} added as ${role}.` };
}

/** Remove an email from both lists. */
export async function removeUser(email: string): Promise<void> {
  const settings = await readSettings();
  const allowed = splitEmails(settings.allowed_emails).filter((e) => e !== email);
  const admins = splitEmails(settings.admin_emails).filter((e) => e !== email);

  await writeSettings({
    allowed_emails: joinEmails(allowed),
    admin_emails: joinEmails(admins),
  });

  revalidatePath("/admin/users");
}

/** Toggle admin/staff role for an existing user. */
export async function setUserRole(email: string, role: "admin" | "staff"): Promise<void> {
  const settings = await readSettings();
  let admins = splitEmails(settings.admin_emails);

  if (role === "admin" && !admins.includes(email)) admins.push(email);
  if (role === "staff") admins = admins.filter((e) => e !== email);

  await writeSettings({ admin_emails: joinEmails(admins) });
  revalidatePath("/admin/users");
}
