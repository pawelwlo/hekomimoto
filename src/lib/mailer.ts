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
  const isEn = input.locale === "en";

  await sendEmail({
    to: workshopInbox(),
    replyTo: input.email,
    subject: `[Wycena] ${input.name} · ${input.phone}`,
    text: [
      "Nowe zgłoszenie wyceny / New quote request",
      "",
      `Imię / Name: ${input.name}`,
      `Telefon / Phone: ${input.phone}`,
      `Email: ${input.email}`,
      `Język / Locale: ${input.locale}`,
      "",
      "Wiadomość / Message:",
      input.message || "—",
      "",
      `Załączniki / Attachments: ${input.files.length}`,
    ].join("\n"),
    attachments,
  });

  try {
    await sendEmail({
      to: input.email,
      subject: isEn
        ? "We received your quote request — Hekomimoto"
        : "Otrzymaliśmy Twoje zgłoszenie wyceny — Hekomimoto",
      text: isEn
        ? [
            `Hi ${input.name},`,
            "",
            "Thanks for contacting Hekomimoto. We received your photos and details.",
            "We’ll get back to you shortly with a quote.",
            "",
            `Phone: ${siteConfig.phone}`,
            `Address: ${siteConfig.address.full}`,
            "",
            "Hekomimoto",
          ].join("\n")
        : [
            `Cześć ${input.name},`,
            "",
            "Dziękujemy za kontakt z Hekomimoto. Otrzymaliśmy Twoje zdjęcia i dane.",
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
