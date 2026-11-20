import { siteConfig } from "@/content/site";
import { formatWarsawDateTime } from "@/lib/booking/time";
import type { Booking } from "@/lib/booking/types";
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

  await sendEmail({
    to: workshopInbox(),
    replyTo: booking.email,
    subject: `[Rezerwacja] ${booking.name} · ${booking.date} ${booking.time}`,
    text: [
      "Nowa prośba o rezerwację / New booking request",
      "",
      `Termin / Slot: ${when}`,
      `Imię / Name: ${booking.name}`,
      `Telefon / Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Język / Locale: ${booking.locale}`,
      "",
      "Wiadomość / Message:",
      booking.message || "—",
      "",
      `Zdjęcia / Photos: ${Math.max(booking.photoUrls.length, files.length)}`,
      ...booking.photoUrls.map((url, i) => `${i + 1}. ${url}`),
      "",
      "Zaakceptuj lub odrzuć w panelu /admin",
    ].join("\n"),
    attachments,
  });

  return { skipped: false as const };
}

/** Acknowledge pending booking to the customer. */
export async function emailCustomerBookingReceived(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  try {
    await sendEmail({
      to: booking.email,
      subject: isEn
        ? `Booking request received — ${booking.date} ${booking.time}`
        : `Otrzymaliśmy rezerwację — ${booking.date} ${booking.time}`,
      text: isEn
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
          ].join("\n"),
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

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Booking confirmed — ${booking.date} ${booking.time}`
      : `Rezerwacja potwierdzona — ${booking.date} ${booking.time}`,
    text: isEn
      ? [
          `Hi ${booking.name},`,
          "",
          "Your Hekomimoto appointment is confirmed.",
          `Date & time: ${when}`,
          "",
          `Address: ${siteConfig.address.full}`,
          `Phone: ${siteConfig.phone}`,
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
          "Do zobaczenia,",
          "Hekomimoto",
        ].join("\n"),
  });

  return { skipped: false as const };
}

export async function emailCustomerRejection(booking: Booking) {
  if (!getResendClient()) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);

  await sendEmail({
    to: booking.email,
    subject: isEn
      ? `Booking update — ${booking.date} ${booking.time}`
      : `Aktualizacja rezerwacji — ${booking.date} ${booking.time}`,
    text: isEn
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
        ].join("\n"),
  });

  return { skipped: false as const };
}
