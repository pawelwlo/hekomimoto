import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  emailCustomerCancellation,
  emailCustomerConfirmation,
  emailCustomerRejection,
  emailCustomerReschedule,
} from "@/lib/booking/email";
import {
  cancelConfirmedBooking,
  decideBooking,
  listBookingsByStatus,
  rescheduleBooking,
} from "@/lib/booking/store";
import { FirebaseAdminConfigError } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [pending, confirmed] = await Promise.all([
      listBookingsByStatus("pending"),
      listBookingsByStatus("confirmed"),
    ]);
    return NextResponse.json({ pending, confirmed });
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[admin] list bookings failed", error);
    return NextResponse.json(
      { error: "Failed to load bookings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    bookingId?: string;
    decision?: "confirmed" | "rejected";
    action?: "decide" | "reschedule" | "cancel";
    date?: string;
    time?: string;
    notify?: boolean;
  } | null;

  const bookingId = String(body?.bookingId ?? "");
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action =
    body?.action ??
    (body?.decision ? "decide" : body?.date && body?.time ? "reschedule" : null);

  try {
    if (action === "cancel") {
      const booking = await cancelConfirmedBooking(bookingId);
      await emailCustomerCancellation(booking);
      return NextResponse.json({ ok: true, booking });
    }

    if (action === "reschedule") {
      const date = String(body?.date ?? "");
      const time = String(body?.time ?? "");
      const result = await rescheduleBooking(bookingId, date, time);

      // Notify client only when a confirmed booking actually moved.
      if (
        result.changed &&
        result.booking.status === "confirmed" &&
        body?.notify !== false
      ) {
        await emailCustomerReschedule(result.booking, result.previous);
      }

      return NextResponse.json({
        ok: true,
        booking: result.booking,
        changed: result.changed,
      });
    }

    const decision = body?.decision;
    if (decision !== "confirmed" && decision !== "rejected") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const booking = await decideBooking(bookingId, decision);
    if (decision === "confirmed") {
      await emailCustomerConfirmation(booking);
    } else {
      await emailCustomerRejection(booking);
    }
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    console.error("[admin] booking update failed", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
