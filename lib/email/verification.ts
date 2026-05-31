function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type Payload = {
  username: string;
  verifyUrl: string;
  expiresInHours: number;
  siteUrl: string;
  /** Theme accent (hex). Falls back to the default brand blue. */
  accent?: string;
};

// Urbanist with system fallbacks. Most email clients ignore web fonts and use
// the fallback; clients that honor the <link> (e.g. Apple Mail) get Urbanist.
const EMAIL_FONT =
  "'Urbanist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function verifyEmailHtml({
  username,
  verifyUrl,
  expiresInHours,
  siteUrl,
  accent,
}: Payload): string {
  const safeUser = escape(username);
  const accentColor = accent ?? "#2d5bff";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify your email</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap" />
  </head>
  <body style="margin:0;padding:0;background:#0a0a0b;font-family:${EMAIL_FONT};color:#f7f7f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0b;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;border-bottom:1px solid #27272a;">
                <div style="font-family:${EMAIL_FONT};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${accentColor};font-weight:600;">
                  Verify email
                </div>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;letter-spacing:-0.01em;color:#f7f7f8;">
                  Welcome, ${safeUser}. Confirm it's really you.
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;font-size:14px;line-height:1.6;color:#ededef;">
                <p style="margin:0 0 16px;">
                  Thanks for creating your portfolio. Click the button below
                  to verify your email address. The link is valid for
                  ${expiresInHours} hours.
                </p>

                <p style="margin:24px 0;">
                  <a href="${escape(verifyUrl)}" style="display:inline-block;padding:12px 22px;background:${accentColor};color:#ffffff;border-radius:999px;text-decoration:none;font-size:14px;font-weight:500;">
                    Verify email
                  </a>
                </p>

                <p style="margin:16px 0 0;font-size:12px;color:#87878f;">
                  If the button doesn't work, paste this URL into your browser:
                  <br/>
                  <span style="word-break:break-all;color:#b1b1b9;">${escape(verifyUrl)}</span>
                </p>

                <p style="margin:24px 0 0;font-size:12px;color:#87878f;">
                  Didn't sign up? You can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px;background:#0a0a0b;border-top:1px solid #27272a;font-size:11px;color:#6b6b73;">
                Sent automatically by ${escape(siteUrl)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verifyEmailText({
  username,
  verifyUrl,
  expiresInHours,
  siteUrl,
}: Payload): string {
  return [
    `Welcome, ${username}.`,
    ``,
    `Thanks for creating your portfolio. Open this link to verify your email.`,
    `It's valid for ${expiresInHours} hours:`,
    ``,
    `${verifyUrl}`,
    ``,
    `Didn't sign up? You can safely ignore this email.`,
    ``,
    `--`,
    `${siteUrl}`,
  ].join("\n");
}
