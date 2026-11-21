import { Resend } from "resend";
import { siteConfig } from "@/content/site";
import {
  brandedEmailHtml,
  emailLink,
  emailRows,
  escapeHtml,
} from "@/lib/email-layout";

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

export async function filesToAttachments(files: File[]) {
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name || "photo.jpg",
      content: Buffer.from(await file.arrayBuffer()),
    })),
  );
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

  return brandedEmailHtml({
    lang: "pl",
    eyebrow: "Formularz kontaktowy",
    title: "Nowe zgłoszenie wyceny",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${emailRows([
          ["Imię i nazwisko", escapeHtml(input.name)],
          ["Telefon", emailLink(`tel:${input.phone}`, input.phone)],
          ["E-mail", emailLink(`mailto:${input.email}`, input.email)],
          [
            "Załączniki",
            input.attachmentCount
              ? `${input.attachmentCount} (w załączeniu)`
              : "Brak",
          ],
        ])}
      </table>
      <p style="margin:22px 0 8px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#a3a3a3;">Wiadomość</p>
      <div style="margin:0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:15px;line-height:1.55;color:#ffffff;">
        ${message}
      </div>
      <p style="margin:18px 0 0;font-size:13px;color:#a3a3a3;">
        Odpowiedz na tę wiadomość, aby napisać bezpośrednio do klienta.
      </p>
    `,
  });
}

function quoteCustomerHtml(input: {
  name: string;
  hasPhotos: boolean;
}) {
  return brandedEmailHtml({
    lang: "pl",
    eyebrow: "Wycena",
    title: "Otrzymaliśmy Twoje zgłoszenie",
    bodyHtml: `
      <p style="margin:0 0 14px;">Cześć ${escapeHtml(input.name)},</p>
      <p style="margin:0 0 14px;">
        ${
          input.hasPhotos
            ? "Dziękujemy za kontakt z Hekomimoto. Otrzymaliśmy Twoje zdjęcia i dane."
            : "Dziękujemy za kontakt z Hekomimoto. Otrzymaliśmy Twoją wiadomość."
        }
      </p>
      <p style="margin:0 0 18px;">Wkrótce odezwiemy się z wyceną.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${emailRows([
          ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ["Adres", escapeHtml(siteConfig.address.full)],
        ])}
      </table>
    `,
  });
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
      html: quoteCustomerHtml({
        name: input.name,
        hasPhotos: input.files.length > 0,
      }),
    });
  } catch (error) {
    // Common while Resend domain is unverified (can only mail the account owner).
    console.warn("[mailer] customer quote ack skipped", error);
  }
}
