import { whatsappLink, telLink } from "../phone";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type Payload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  siteUrl: string;
};

export function contactNotificationHtml({
  name,
  email,
  phone,
  subject,
  message,
  siteUrl,
}: Payload): string {
  const adminUrl = `${siteUrl}/admin/messages`;
  const safeMessage = escape(message).replace(/\n/g, "<br/>");
  const safeName = escape(name);
  const safeEmail = escape(email);
  const safePhone = phone ? escape(phone) : "";
  const safeSubject = subject ? escape(subject) : "(no subject)";
  const waUrl = phone ? whatsappLink(phone) : null;
  const callUrl = phone ? telLink(phone) : null;

  const phoneRow = phone
    ? `<tr>
        <td style="padding:0 0 12px;color:#87878f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Phone</td>
        <td style="padding:0 0 12px;color:#f7f7f8;font-size:14px;">
          <strong>${safePhone}</strong>
          ${
            waUrl
              ? `&nbsp;·&nbsp;<a href="${waUrl}" style="color:#2d5bff;text-decoration:none;">WhatsApp</a>`
              : ""
          }${
            callUrl
              ? `&nbsp;·&nbsp;<a href="${callUrl}" style="color:#2d5bff;text-decoration:none;">Call</a>`
              : ""
          }
        </td>
      </tr>`
    : "";

  const phoneCta = waUrl
    ? `&nbsp;<a href="${waUrl}" style="display:inline-block;padding:10px 18px;border:1px solid #25d36644;color:#25d366;border-radius:999px;text-decoration:none;font-size:13px;font-weight:500;">
        WhatsApp ${safeName.split(" ")[0]}
      </a>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New message from your portfolio</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f7f7f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0b;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;border-bottom:1px solid #27272a;">
                <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#2d5bff;font-weight:600;">
                  New message
                </div>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;letter-spacing:-0.01em;color:#f7f7f8;">
                  Someone reached out via your portfolio
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:0 0 12px;width:80px;color:#87878f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">From</td>
                    <td style="padding:0 0 12px;color:#f7f7f8;font-size:14px;">
                      <strong style="font-weight:600;">${safeName}</strong>
                      &nbsp;<a href="mailto:${safeEmail}" style="color:#2d5bff;text-decoration:none;">&lt;${safeEmail}&gt;</a>
                    </td>
                  </tr>
                  ${phoneRow}
                  <tr>
                    <td style="padding:0 0 12px;color:#87878f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Subject</td>
                    <td style="padding:0 0 12px;color:#f7f7f8;font-size:14px;">${safeSubject}</td>
                  </tr>
                </table>

                <div style="margin-top:16px;padding:16px 18px;background:#0a0a0b;border:1px solid #27272a;border-radius:10px;font-size:14px;line-height:1.6;color:#ededef;">
                  ${safeMessage}
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td>
                      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(safeSubject)}" style="display:inline-block;padding:10px 18px;background:#2d5bff;color:#ffffff;border-radius:999px;text-decoration:none;font-size:13px;font-weight:500;">
                        Reply to ${safeName.split(" ")[0]}
                      </a>${phoneCta}
                      &nbsp;
                      <a href="${adminUrl}" style="display:inline-block;padding:10px 18px;border:1px solid #27272a;color:#f7f7f8;border-radius:999px;text-decoration:none;font-size:13px;font-weight:500;">
                        Open in admin
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px;background:#0a0a0b;border-top:1px solid #27272a;font-size:11px;color:#6b6b73;">
                Sent automatically from the contact form on ${escape(siteUrl)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function contactNotificationText({
  name,
  email,
  phone,
  subject,
  message,
  siteUrl,
}: Payload): string {
  const lines = [
    `New message from your portfolio`,
    ``,
    `From:    ${name} <${email}>`,
  ];
  if (phone) {
    const waUrl = whatsappLink(phone);
    lines.push(
      `Phone:   ${phone}${waUrl ? ` (WhatsApp: ${waUrl})` : ""}`
    );
  }
  lines.push(
    `Subject: ${subject ?? "(no subject)"}`,
    ``,
    `${message}`,
    ``,
    `--`,
    `Reply directly to this email, or view in admin:`,
    `${siteUrl}/admin/messages`
  );
  return lines.join("\n");
}
