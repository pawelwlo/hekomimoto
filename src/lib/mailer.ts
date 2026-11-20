import { Resend } from "resend";
import { siteConfig } from "@/content/site";

export type MailAttachment = {
  filename: string;
  content: Buffer;
};

export class MailerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailerConfigError";
  }
}

function fromAddress() {
  return process.env.RESEND_FROM ?? "Hekomimoto <onboarding@resend.dev>";
}

/** Workshop inbox — override with RESEND_TO while testing without a verified domain. */
export function workshopInbox() {
  return process.env.RESEND_TO?.trim() || siteConfig.email;
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function requireResend() {
  const client = getResendClient();
  if (!client) {
    throw new MailerConfigError(
      "RESEND_API_KEY is not configured. Add it to .env.local (and App Hosting secrets).",
    );
  }
  return client;
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}) {
  const resend = requireResend();
  const { error, data } = await resend.emails.send({
    from: fromAddress(),
    to: Array.isArray(input.to) ? input.to : [input.to],
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments?.length ? input.attachments : undefined,
  });

  if (error) {
    console.error("[mailer] send failed", error);
    throw new Error(error.message || "Failed to send email.");
  }

  return data;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function quoteWorkshopHtml(input: {
  name: string;
  phone: string;
  email: string;
  message: string;
  attachmentCount: number;
}) {
  const message = input.message.trim()
    ? escapeHtml(input.message).replaceAll("\n", "<br />")
    : "—";
  const rows = [
    ["Imię i nazwisko", escapeHtml(input.name)],
    [
      "Telefon",
      `<a href="tel:${escapeHtml(input.phone)}" style="color:#e3262a;text-decoration:none;">${escapeHtml(input.phone)}</a>`,
    ],
    [
      "E-mail",
      `<a href="mailto:${escapeHtml(input.email)}" style="color:#e3262a;text-decoration:none;">${escapeHtml(input.email)}</a>`,
    ],
    [
      "Załączniki",
      input.attachmentCount
        ? `${input.attachmentCount} (w załączeniu)`
        : "Brak",
    ],
  ];

  return `<!DOCTYPE html>
<html lang="pl">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:#111111;padding:20px 24px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Hekomi<span style="color:#e3262a;">moto</span>
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#a1a1aa;">Nowe zgłoszenie wyceny</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rows
                  .map(
                    ([label, value]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;width:140px;font-size:13px;color:#71717a;">${label}</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:15px;font-weight:600;color:#18181b;">${value}</td>
                </tr>`,
                  )
                  .join("")}
              </table>
              <p style="margin:20px 0 8px;font-size:13px;color:#71717a;">Wiadomość</p>
              <div style="margin:0;padding:14px 16px;background:#fafafa;border:1px solid #f4f4f5;border-radius:8px;font-size:15px;line-height:1.5;color:#18181b;">
                ${message}
              </div>
              <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">
                Odpowiedz na tę wiadomość, aby napisać bezpośrednio do klienta.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function filesToAttachments(files: File[]) {
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name || "photo.jpg",
      content: Buffer.from(await file.arrayBuffer()),
    })),
  );
}

/** Admin + customer emails for contact / quote form. */
export async function sendQuoteEmails(input: {
  name: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  files: File[];
}) {
  const attachments = await filesToAttachments(input.files);

  await sendEmail({
    to: workshopInbox(),
    replyTo: input.email,
    subject: `[Wycena] ${input.name} · ${input.phone}`,
    text: [
      "Nowe zgłoszenie wyceny",
      "",
      `Imię i nazwisko: ${input.name}`,
      `Telefon: ${input.phone}`,
      `E-mail: ${input.email}`,
      `Załączniki: ${input.files.length || "brak"}`,
      "",
      "Wiadomość:",
      input.message || "—",
    ].join("\n"),
    html: quoteWorkshopHtml({
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      attachmentCount: input.files.length,
    }),
    attachments,
  });

  try {
    await sendEmail({
      to: input.email,
      subject: "Otrzymaliśmy Twoje zgłoszenie wyceny — Hekomimoto",
      text: [
        `Cześć ${input.name},`,
        "",
        input.files.length
          ? "Dziękujemy za kontakt z Hekomimoto. Otrzymaliśmy Twoje zdjęcia i dane."
          : "Dziękujemy za kontakt z Hekomimoto. Otrzymaliśmy Twoją wiadomość.",
        "Wkrótce odezwiemy się z wyceną.",
        "",
        `Telefon: ${siteConfig.phone}`,
        `Adres: ${siteConfig.address.full}`,
        "",
        "Hekomimoto",
      ].join("\n"),
    });
  } catch (error) {
    // Common while Resend domain is unverified (can only mail the account owner).
    console.warn("[mailer] customer quote ack skipped", error);
  }
}
