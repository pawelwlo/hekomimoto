import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  emailCustomerConfirmation,
  emailCustomerRejection,
} from "@/lib/booking/email";
import { decideBooking, listBookingsByStatus } from "@/lib/booking/store";
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
  } | null;

  const bookingId = String(body?.bookingId ?? "");
  const decision = body?.decision;
  if (!bookingId || (decision !== "confirmed" && decision !== "rejected")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const booking = await decideBooking(bookingId, decision);
    if (decision === "confirmed") {
      await emailCustomerConfirmation(booking);
    } else {
      await emailCustomerRejection(booking);
    }
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    console.error("[admin] decide booking failed", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
