import { Resend } from "resend";
import { siteConfig } from "@/content/site";
import { formatWarsawDateTime } from "@/lib/booking/time";
import type { Booking } from "@/lib/booking/types";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function fromAddress() {
  return process.env.RESEND_FROM ?? "Hekomimoto <onboarding@resend.dev>";
}

export async function emailAdminNewBooking(booking: Booking) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const when = formatWarsawDateTime(booking.startAt, "pl");
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [siteConfig.email],
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
      `Zdjęcia / Photos: ${booking.photoUrls.length}`,
      ...booking.photoUrls.map((url, i) => `${i + 1}. ${url}`),
      "",
      "Zaakceptuj lub odrzuć w panelu /admin",
    ].join("\n"),
  });

  if (error) {
    console.error("[booking] admin notify failed", error);
    return { skipped: false as const, error };
  }
  return { skipped: false as const };
}

export async function emailCustomerConfirmation(booking: Booking) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);
  const subject = isEn
    ? `Booking confirmed — ${booking.date} ${booking.time}`
    : `Rezerwacja potwierdzona — ${booking.date} ${booking.time}`;
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
      ].join("\n");

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [booking.email],
    subject,
    text,
  });

  if (error) {
    console.error("[booking] customer confirm failed", error);
    return { skipped: false as const, error };
  }
  return { skipped: false as const };
}

export async function emailCustomerRejection(booking: Booking) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const isEn = booking.locale === "en";
  const when = formatWarsawDateTime(booking.startAt, booking.locale);
  const subject = isEn
    ? `Booking update — ${booking.date} ${booking.time}`
    : `Aktualizacja rezerwacji — ${booking.date} ${booking.time}`;
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

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [booking.email],
    subject,
    text,
  });

  if (error) {
    console.error("[booking] customer reject failed", error);
    return { skipped: false as const, error };
  }
  return { skipped: false as const };
}
