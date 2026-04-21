import { NextResponse } from "next/server";
import { readSettings } from "@/lib/admin/settings-store";
import { generateDraft } from "@/lib/ai/client";

export async function POST() {
  const settings = await readSettings();
  const provider = settings.ai_provider;
  const start = Date.now();

  try {
    const result = await generateDraft({
      systemPrompt: "Reply with exactly one word: OK",
      userContent: "ping",
      maxTokens: 10,
    });

    return NextResponse.json({
      ok: true,
      provider,
      model: result.model,
      latency_ms: Date.now() - start,
      response: result.text.trim(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        provider,
        error: err instanceof Error ? err.message : "Unknown error",
        latency_ms: Date.now() - start,
      },
      { status: 200 }, // always 200 so client reads the body
    );
  }
}
