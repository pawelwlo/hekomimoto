import { NextResponse } from "next/server";
import { emailAdminNewBooking } from "@/lib/booking/email";
import { createPendingBooking } from "@/lib/booking/store";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const locale = String(form.get("locale") ?? "pl").trim();
    const slotId = String(form.get("slotId") ?? "").trim();

    if (!name || !phone || !email || !slotId) {
      return NextResponse.json(
        { error: "Name, phone, email and slot are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length < 1) {
      return NextResponse.json(
        { error: "At least one damage photo is required." },
        { status: 400 },
      );
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} images allowed.` },
        { status: 400 },
      );
    }
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed." },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Each image must be 5 MB or smaller." },
          { status: 400 },
        );
      }
    }

    const booking = await createPendingBooking({
      slotId,
      name,
      phone,
      email,
      message,
      locale,
      files,
    });

    await emailAdminNewBooking(booking);

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("[booking] request failed", error);
    const status =
      message === "Slot unavailable" || message === "Slot is in the past"
        ? 409
        : message === "Slot not found"
          ? 404
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
