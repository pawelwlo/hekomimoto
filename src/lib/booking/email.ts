import { siteConfig } from "@/content/site";
import { formatWarsawDateTime } from "@/lib/booking/time";
import type { Booking } from "@/lib/booking/types";
import {
  brandedEmailHtml,
  emailLink,
  emailRows,
  escapeHtml,
} from "@/lib/email-layout";
import {
  filesToAttachments,
  getResendClient,
  sendEmail,
  workshopInbox,
} from "@/lib/mailer";

export async function emailAdminNewBooking(
  booking: Booking,
  files: File[] = [],
) {
  if (!getResendClient()) {
    console.warn("[booking] RESEND_API_KEY missing — admin email skipped");
    return { skipped: true as const };
  }

  const when = formatWarsawDateTime(booking.startAt, "pl");
  const attachments = await filesToAttachments(files);
  const photoCount = Math.max(booking.photoUrls.length, files.length);
  const message = booking.message.trim()
    ? escapeHtml(booking.message).replaceAll("\n", "<br />")
    : "—";

  await sendEmail({
    to: workshopInbox(),
    replyTo: booking.email,
    subject: `[Rezerwacja] ${booking.name} · ${booking.date} ${booking.time}`,
    text: [
      "Nowa prośba o rezerwację",
      "",
      `Termin: ${when}`,
      `Imię i nazwisko: ${booking.name}`,
      `Telefon: ${booking.phone}`,
      `E-mail: ${booking.email}`,
      "",
      "Wiadomość:",
      booking.message || "—",
      "",
      `Zdjęcia: ${photoCount}`,
      ...booking.photoUrls.map((url, i) => `${i + 1}. ${url}`),
      "",
      "Zaakceptuj lub odrzuć w panelu /admin",
    ].join("\n"),
    html: brandedEmailHtml({
      lang: "pl",
      eyebrow: "Panel rezerwacji",
      title: "Nowa prośba o rezerwację",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Termin", escapeHtml(when)],
            ["Imię i nazwisko", escapeHtml(booking.name)],
            ["Telefon", emailLink(`tel:${booking.phone}`, booking.phone)],
            ["E-mail", emailLink(`mailto:${booking.email}`, booking.email)],
            [
              "Zdjęcia",
              photoCount ? `${photoCount}` : "Brak",
            ],
          ])}
        </table>
        <p style="margin:22px 0 8px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#a3a3a3;">Wiadomość</p>
        <div style="margin:0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:15px;line-height:1.55;color:#ffffff;">
          ${message}
        </div>
        <p style="margin:18px 0 0;font-size:13px;color:#a3a3a3;">
          Zaakceptuj lub odrzuć w panelu /admin
        </p>
      `,
    }),
    attachments,
  });

  return { skipped: false as const };
}

/** Acknowledge pending booking to the customer. */
export async function emailCustomerBookingReceived(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  const text = isEn
    ? [
        `Hi ${booking.name},`,
        "",
        "We received your booking request for:",
        when,
        "",
        "It is pending confirmation. We’ll email you once it’s accepted or if we need to change the time.",
        "",
        `Phone: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n")
    : [
        `Cześć ${booking.name},`,
        "",
        "Otrzymaliśmy Twoją prośbę o rezerwację na:",
        when,
        "",
        "Termin oczekuje na potwierdzenie. Wyślemy e-mail po akceptacji lub jeśli będzie potrzebna zmiana godziny.",
        "",
        `Telefon: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n");

  const html = brandedEmailHtml({
    lang: isEn ? "en" : "pl",
    eyebrow: isEn ? "Booking" : "Rezerwacja",
    title: isEn ? "Request received" : "Otrzymaliśmy rezerwację",
    bodyHtml: isEn
      ? `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 14px;">We received your booking request.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Date & time", escapeHtml(when)],
            ["Phone", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          It is pending confirmation. We’ll email you once it’s accepted or if we need to change the time.
        </p>
      `
      : `
        <p style="margin:0 0 14px;">Cześć ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 14px;">Otrzymaliśmy Twoją prośbę o rezerwację.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Termin", escapeHtml(when)],
            ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          Termin oczekuje na potwierdzenie. Wyślemy e-mail po akceptacji lub jeśli będzie potrzebna zmiana godziny.
        </p>
      `,
  });

  try {
    await sendEmail({
      to: booking.email,
      subject: isEn
        ? `Booking request received — ${booking.date} ${booking.time}`
        : `Otrzymaliśmy rezerwację — ${booking.date} ${booking.time}`,
      text,
      html,
    });
  } catch (error) {
    console.warn("[booking] customer received email skipped", error);
    return { skipped: true as const };
  }

  return { skipped: false as const };
}

export async function emailCustomerConfirmation(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  const text = isEn
    ? [
        `Hi ${booking.name},`,
        "",
        "Your Hekomimoto appointment is confirmed.",
        `Date & time: ${when}`,
        "",
        `Address: ${siteConfig.address.full}`,
        `Phone: ${siteConfig.phone}`,
        "",
        `To cancel or change the appointment, call ${siteConfig.phone} or reply to this message.`,
        "",
        "See you soon,",
        "Hekomimoto",
      ].join("\n")
    : [
        `Cześć ${booking.name},`,
        "",
        "Twoja wizyta w Hekomimoto jest potwierdzona.",
        `Termin: ${when}`,
        "",
        `Adres: ${siteConfig.address.full}`,
        `Telefon: ${siteConfig.phone}`,
        "",
        `Aby odwołać lub zmienić termin, zadzwoń: ${siteConfig.phone} lub odpowiedz na tę wiadomość.`,
        "",
        "Do zobaczenia,",
        "Hekomimoto",
      ].join("\n");

  const html = brandedEmailHtml({
    lang: isEn ? "en" : "pl",
    eyebrow: isEn ? "Confirmed" : "Potwierdzenie",
    title: isEn ? "Appointment confirmed" : "Rezerwacja potwierdzona",
    bodyHtml: isEn
      ? `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Your Hekomimoto appointment is confirmed.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Date & time", escapeHtml(when)],
            ["Address", escapeHtml(siteConfig.address.full)],
            ["Phone", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;line-height:1.5;color:#d6b36a;">
          To cancel or change the appointment, call ${emailLink(siteConfig.phoneHref, siteConfig.phone)} or reply to this message.
        </p>
        <p style="margin:20px 0 0;">See you soon,<br /><strong style="color:#ffffff;">Hekomimoto</strong></p>
      `
      : `
        <p style="margin:0 0 14px;">Cześć ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Twoja wizyta w Hekomimoto jest potwierdzona.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Termin", escapeHtml(when)],
            ["Adres", escapeHtml(siteConfig.address.full)],
            ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;line-height:1.5;color:#d6b36a;">
          Aby odwołać lub zmienić termin, zadzwoń: ${emailLink(siteConfig.phoneHref, siteConfig.phone)} lub odpowiedz na tę wiadomość.
        </p>
        <p style="margin:20px 0 0;">Do zobaczenia,<br /><strong style="color:#ffffff;">Hekomimoto</strong></p>
      `,
  });

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Booking confirmed — ${booking.date} ${booking.time}`
      : `Rezerwacja potwierdzona — ${booking.date} ${booking.time}`,
    text,
    html,
  });

  return { skipped: false as const };
}

export async function emailCustomerRejection(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  const text = isEn
    ? [
        `Hi ${booking.name},`,
        "",
        `Unfortunately we cannot confirm the slot on ${when}.`,
        "Please pick another available time on our website or call us.",
        "",
        `Phone: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n")
    : [
        `Cześć ${booking.name},`,
        "",
        `Niestety nie możemy potwierdzić terminu: ${when}.`,
        "Wybierz inny wolny termin na stronie lub zadzwoń do nas.",
        "",
        `Telefon: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n");

  const html = brandedEmailHtml({
    lang: isEn ? "en" : "pl",
    eyebrow: isEn ? "Update" : "Aktualizacja",
    title: isEn ? "Booking update" : "Aktualizacja rezerwacji",
    bodyHtml: isEn
      ? `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Unfortunately we cannot confirm this slot:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Date & time", escapeHtml(when)],
            ["Phone", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          Please pick another available time on our website or call us.
        </p>
      `
      : `
        <p style="margin:0 0 14px;">Cześć ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Niestety nie możemy potwierdzić tego terminu:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Termin", escapeHtml(when)],
            ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          Wybierz inny wolny termin na stronie lub zadzwoń do nas.
        </p>
      `,
  });

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Booking update — ${booking.date} ${booking.time}`
      : `Aktualizacja rezerwacji — ${booking.date} ${booking.time}`,
    text,
    html,
  });

  return { skipped: false as const };
}

export async function emailCustomerReschedule(
  booking: Booking,
  previous: { date: string; time: string; startAt: string },
) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);
  const previousWhen = formatWarsawDateTime(
    previous.startAt,
    booking.locale,
  );

  const text = isEn
    ? [
        `Hi ${booking.name},`,
        "",
        "Your Hekomimoto appointment has been rescheduled.",
        `Previous: ${previousWhen}`,
        `New date & time: ${when}`,
        "",
        `Address: ${siteConfig.address.full}`,
        `Phone: ${siteConfig.phone}`,
        "",
        `To cancel or change again, call ${siteConfig.phone} or reply to this message.`,
        "",
        "Hekomimoto",
      ].join("\n")
    : [
        `Cześć ${booking.name},`,
        "",
        "Twój termin wizyty w Hekomimoto został zmieniony.",
        `Poprzedni termin: ${previousWhen}`,
        `Nowy termin: ${when}`,
        "",
        `Adres: ${siteConfig.address.full}`,
        `Telefon: ${siteConfig.phone}`,
        "",
        `Aby odwołać lub zmienić termin, zadzwoń: ${siteConfig.phone} lub odpowiedz na tę wiadomość.`,
        "",
        "Hekomimoto",
      ].join("\n");

  const html = brandedEmailHtml({
    lang: isEn ? "en" : "pl",
    eyebrow: isEn ? "Rescheduled" : "Zmiana terminu",
    title: isEn ? "Appointment updated" : "Termin został zmieniony",
    bodyHtml: isEn
      ? `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Your Hekomimoto appointment has been rescheduled.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Previous", escapeHtml(previousWhen)],
            ["New date & time", escapeHtml(when)],
            ["Address", escapeHtml(siteConfig.address.full)],
            ["Phone", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;line-height:1.5;color:#d6b36a;">
          To cancel or change again, call ${emailLink(siteConfig.phoneHref, siteConfig.phone)} or reply to this message.
        </p>
      `
      : `
        <p style="margin:0 0 14px;">Cześć ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Twój termin wizyty w Hekomimoto został zmieniony.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Poprzedni termin", escapeHtml(previousWhen)],
            ["Nowy termin", escapeHtml(when)],
            ["Adres", escapeHtml(siteConfig.address.full)],
            ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;line-height:1.5;color:#d6b36a;">
          Aby odwołać lub zmienić termin, zadzwoń: ${emailLink(siteConfig.phoneHref, siteConfig.phone)} lub odpowiedz na tę wiadomość.
        </p>
      `,
  });

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Appointment rescheduled — ${booking.date} ${booking.time}`
      : `Zmiana terminu — ${booking.date} ${booking.time}`,
    text,
    html,
  });

  return { skipped: false as const };
}

export async function emailCustomerCancellation(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  const text = isEn
    ? [
        `Hi ${booking.name},`,
        "",
        `Your Hekomimoto appointment on ${when} has been cancelled.`,
        "If you’d like a new slot, book online or call us.",
        "",
        `Phone: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n")
    : [
        `Cześć ${booking.name},`,
        "",
        `Twoja wizyta w Hekomimoto w terminie ${when} została odwołana.`,
        "Jeśli chcesz umówić nowy termin, zarezerwuj online lub zadzwoń.",
        "",
        `Telefon: ${siteConfig.phone}`,
        "Hekomimoto",
      ].join("\n");

  const html = brandedEmailHtml({
    lang: isEn ? "en" : "pl",
    eyebrow: isEn ? "Cancelled" : "Odwołanie",
    title: isEn ? "Appointment cancelled" : "Rezerwacja odwołana",
    bodyHtml: isEn
      ? `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Your Hekomimoto appointment has been cancelled.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Cancelled slot", escapeHtml(when)],
            ["Phone", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          If you’d like a new slot, book online or call us.
        </p>
      `
      : `
        <p style="margin:0 0 14px;">Cześć ${escapeHtml(booking.name)},</p>
        <p style="margin:0 0 16px;">Twoja wizyta w Hekomimoto została odwołana.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${emailRows([
            ["Odwołany termin", escapeHtml(when)],
            ["Telefon", emailLink(siteConfig.phoneHref, siteConfig.phone)],
          ])}
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:14px;">
          Jeśli chcesz umówić nowy termin, zarezerwuj online lub zadzwoń.
        </p>
      `,
  });

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Appointment cancelled — ${booking.date} ${booking.time}`
      : `Rezerwacja odwołana — ${booking.date} ${booking.time}`,
    text,
    html,
  });

  return { skipped: false as const };
}
