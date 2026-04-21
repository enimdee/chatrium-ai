/**
 * Public app config endpoint — no secrets, safe to call from client components.
 * Returns brand identity, properties, and roles for the compose UI.
 */
import { readSettings, parseList } from "@/lib/admin/settings-store";
import { NextResponse } from "next/server";

export async function GET() {
  const s = await readSettings();

  return NextResponse.json({
    app_name:           s.app_name,
    app_tagline:        s.app_tagline,
    brand_voice_author: s.brand_voice_author,
    properties:         parseList(s.properties_text),
    roles:              parseList(s.roles_text),
  });
}
