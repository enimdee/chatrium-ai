/**
 * Send magic-link emails via SMTP (nodemailer).
 *
 * Dev fallback: if SMTP is not configured, logs the link to the console
 * and returns it in the result so the caller can surface it.
 */
import nodemailer from "nodemailer";

interface SendResult {
  /** true = email sent via SMTP; false = dev console fallback */
  sent: boolean;
  /** Set only in dev-fallback mode (no SMTP) — the raw magic link. */
  devLink?: string;
}

export async function sendMagicLink(
  to: string,
  link: string,
  appName: string,
): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const isProd = process.env.NODE_ENV === "production";

  // Production without SMTP = hard error
  if (isProd && !host) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your environment.",
    );
  }

  // Development without SMTP = console fallback
  if (!host) {
    console.log(`\n🔗  Magic link for ${to} (dev mode — no SMTP configured):\n  ${link}\n`);
    return { sent: false, devLink: link };
  }

  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const from =
    process.env.AUTH_EMAIL_FROM ?? `${appName} <no-reply@example.com>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    subject: `Sign in to ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 16px">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
              <tr>
                <td style="background:#17191c;padding:28px 32px">
                  <p style="margin:0;color:#c5a572;font-size:22px;letter-spacing:.12em;text-transform:uppercase">
                    ${appName}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px">
                  <h2 style="margin:0 0 12px;font-size:20px;color:#111">Sign in</h2>
                  <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.5">
                    Click the button below to sign in. This link expires in
                    <strong>15&nbsp;minutes</strong> and can only be used once.
                  </p>
                  <a href="${link}"
                    style="display:inline-block;background:#c5a572;color:#17191c;font-weight:700;
                           padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px">
                    Sign In →
                  </a>
                  <p style="margin:28px 0 0;color:#999;font-size:12px;line-height:1.5">
                    If you did not request this, you can safely ignore this email.<br>
                    Do not share this link with anyone.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    text: `Sign in to ${appName}\n\nClick this link to sign in (expires in 15 minutes):\n${link}\n\nIf you did not request this, ignore this email.`,
  });

  return { sent: true };
}
