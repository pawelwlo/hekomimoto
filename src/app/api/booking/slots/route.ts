import { NextResponse } from "next/server";
import { listOpenFutureSlots } from "@/lib/booking/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const slots = await listOpenFutureSlots();
    return NextResponse.json({
      slots: slots.map((s) => ({
        id: s.id,
        date: s.date,
        time: s.time,
        startAt: s.startAt,
        endAt: s.endAt,
      })),
    });
  } catch (error) {
    console.error("[booking] list slots failed", error);
    return NextResponse.json(
      { error: "Unable to load available slots." },
      { status: 503 },
    );
  }
}
