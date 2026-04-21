import { readSettings, maskKey } from "@/lib/admin/settings-store";
import { NextResponse } from "next/server";

export async function GET() {
  const s = await readSettings();

  return NextResponse.json({
    // AI provider
    ai_provider:     s.ai_provider,
    anthropic_model: s.anthropic_model,
    openai_model:    s.openai_model,
    google_model:    s.google_model,
    updated_at:      s.updated_at,
    // Masked key previews — never expose full value
    anthropic_key_preview: maskKey(s.anthropic_api_key) ?? (process.env.ANTHROPIC_API_KEY ? "(env)" : null),
    openai_key_preview:    maskKey(s.openai_api_key)    ?? (process.env.OPENAI_API_KEY    ? "(env)" : null),
    google_key_preview:    maskKey(s.google_api_key)    ?? (process.env.GOOGLE_API_KEY    ? "(env)" : null),
    // App identity
    app_name:           s.app_name,
    app_tagline:        s.app_tagline,
    brand_voice_author: s.brand_voice_author,
    properties_text:    s.properties_text,
    roles_text:         s.roles_text,
  });
}
