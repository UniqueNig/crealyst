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
  resetUrl: string;
  expiresInMinutes: number;
  siteUrl: string;
};

export function passwordResetHtml({
  username,
  resetUrl,
  expiresInMinutes,
  siteUrl,
}: Payload): string {
  const safeUser = escape(username);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f7f7f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0b;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;border-bottom:1px solid #27272a;">
                <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#2d5bff;font-weight:600;">
                  Password reset
                </div>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;letter-spacing:-0.01em;color:#f7f7f8;">
                  Hey ${safeUser}, reset your password
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;font-size:14px;line-height:1.6;color:#ededef;">
                <p style="margin:0 0 16px;">
                  We got a request to reset the password for your account.
                  Click the button below to choose a new one. The link is
                  valid for ${expiresInMinutes} minutes.
                </p>

                <p style="margin:24px 0;">
                  <a href="${escape(resetUrl)}" style="display:inline-block;padding:12px 22px;background:#2d5bff;color:#ffffff;border-radius:999px;text-decoration:none;font-size:14px;font-weight:500;">
                    Reset password
                  </a>
                </p>

                <p style="margin:16px 0 0;font-size:12px;color:#87878f;">
                  If the button doesn't work, paste this URL into your browser:
                  <br/>
                  <span style="word-break:break-all;color:#b1b1b9;">${escape(resetUrl)}</span>
                </p>

                <p style="margin:24px 0 0;font-size:12px;color:#87878f;">
                  Didn't ask for this? You can safely ignore this email —
                  your password stays as it was.
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

export function passwordResetText({
  username,
  resetUrl,
  expiresInMinutes,
  siteUrl,
}: Payload): string {
  return [
    `Hey ${username},`,
    ``,
    `We got a request to reset the password for your account.`,
    `Open this link to choose a new password. The link is valid for ${expiresInMinutes} minutes:`,
    ``,
    `${resetUrl}`,
    ``,
    `Didn't ask for this? You can safely ignore this email — your password stays as it was.`,
    ``,
    `--`,
    `${siteUrl}`,
  ].join("\n");
}
