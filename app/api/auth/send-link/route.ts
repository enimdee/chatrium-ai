import { type NextRequest, NextResponse } from "next/server";
import { generateMagicToken } from "@/lib/auth/tokens";
import { sendMagicLink } from "@/lib/auth/email";
import { checkEmailAccess } from "@/lib/auth/access";
import { readSettings } from "@/lib/admin/settings-store";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { email } = parsed.data;

  // Check access (but don't reveal whether the email is valid to prevent enumeration)
  const role = await checkEmailAccess(email);

  // Always return the same 200 response for security — don't expose whether
  // the email is in the allow-list
  if (!role) {
    // Simulate a small delay to prevent timing attacks
    await new Promise((r) => setTimeout(r, 200));
    return NextResponse.json({ ok: true });
  }

  // Generate token & build link
  const token = await generateMagicToken(email);
  const baseUrl =
    process.env.AUTH_URL ??
    (req.headers.get("x-forwarded-proto") ?? "http") +
      "://" +
      (req.headers.get("host") ?? "localhost:3000");
  const link = `${baseUrl}/api/auth/verify?token=${token}`;

  // Send email (or console fallback in dev)
  const settings = await readSettings();
  const result = await sendMagicLink(email, link, settings.app_name || "HotelAI");

  // In development with no SMTP: return the link so it can be shown in the UI
  if (result.devLink) {
    return NextResponse.json({ ok: true, devLink: result.devLink });
  }

  return NextResponse.json({ ok: true });
}
