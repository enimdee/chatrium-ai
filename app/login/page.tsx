"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface AppInfo {
  app_name: string;
  app_tagline: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "This sign-in link has expired or already been used. Please request a new one.",
  missing_token: "Sign-in link is missing. Please request a new one.",
  access_denied: "Your email is not authorised to access this app. Contact your administrator.",
};

function LoginForm({ appInfo }: { appInfo: AppInfo }) {
  const params = useSearchParams();
  const errorKey = params.get("error");
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? "Something went wrong. Please try again.") : null;

  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [devLink, setDevLink]   = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const initial = appInfo.app_name.charAt(0).toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; devLink?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Failed to send link. Please try again.");
      } else {
        setSent(true);
        if (data.devLink) setDevLink(data.devLink);
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0b0d0f" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #c5a572, #8a6d3f)",
              color: "#17191c",
              fontFamily: "Georgia, serif",
            }}
          >
            {initial}
          </div>
          <h1
            className="text-lg tracking-[0.16em] uppercase font-medium"
            style={{ color: "#c5a572", fontFamily: "Georgia, serif" }}
          >
            {appInfo.app_name}
          </h1>
          {appInfo.app_tagline && (
            <p className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: "#6b7280" }}>
              {appInfo.app_tagline}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "#111316",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Error from URL params (e.g. expired link) */}
          {errorMessage && (
            <div
              className="mb-5 p-3 rounded text-[12px]"
              style={{
                background: "rgba(201,122,122,0.08)",
                borderLeft: "2px solid #c97a7a",
                color: "#e8d4d4",
              }}
            >
              {errorMessage}
            </div>
          )}

          {!sent ? (
            <>
              <h2
                className="text-xl font-medium mb-1"
                style={{ color: "#e8e6e0", fontFamily: "Georgia, serif" }}
              >
                Sign in
              </h2>
              <p className="text-xs mb-6" style={{ color: "#6b7280" }}>
                Enter your email — we&apos;ll send you a sign-in link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    className="w-full text-sm rounded-lg px-4 py-3 outline-none focus:ring-2"
                    style={{
                      background: "#1a1d21",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e8e6e0",
                    }}
                  />
                </div>

                {formError && (
                  <p className="text-xs" style={{ color: "#c97a7a" }}>
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ background: "#c5a572", color: "#17191c" }}
                >
                  {loading ? "Sending…" : "Send Sign-in Link →"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-4">📬</div>
              <h2
                className="text-lg font-medium mb-2"
                style={{ color: "#e8e6e0", fontFamily: "Georgia, serif" }}
              >
                Check your email
              </h2>
              <p className="text-sm" style={{ color: "#9ca3af" }}>
                If <strong style={{ color: "#c5a572" }}>{email}</strong> is in the allow-list,
                a sign-in link has been sent. It expires in 15 minutes.
              </p>

              {/* Dev fallback: show link directly when no SMTP is configured */}
              {devLink && (
                <div
                  className="mt-5 p-3 rounded text-left text-[11px] break-all"
                  style={{
                    background: "rgba(197,165,114,0.08)",
                    borderLeft: "2px solid #c5a572",
                    color: "#c5a572",
                  }}
                >
                  <div className="mb-1 font-semibold" style={{ color: "#9ca3af" }}>
                    Dev mode — no SMTP configured. Use this link:
                  </div>
                  <a href={devLink} style={{ color: "#c5a572" }}>
                    {devLink}
                  </a>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setDevLink(null); setEmail(""); }}
                className="mt-5 text-xs underline"
                style={{ color: "#6b7280" }}
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: "#374151" }}>
          Powered by Wokeflow
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    app_name: "HotelAI",
    app_tagline: "Communication Assistant",
  });

  useEffect(() => {
    fetch("/api/app-config")
      .then((r) => r.json())
      .then((d: AppInfo) => setAppInfo(d))
      .catch(() => {});
  }, []);

  return (
    <Suspense>
      <LoginForm appInfo={appInfo} />
    </Suspense>
  );
}
