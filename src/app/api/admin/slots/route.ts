import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteOpenSlot,
  listSlotsInRange,
  upsertOpenSlots,
} from "@/lib/booking/store";
import { SLOT_HOURS } from "@/lib/booking/types";
import { FirebaseAdminConfigError } from "@/lib/firebase-admin";

function adminErrorResponse(error: unknown) {
  if (error instanceof FirebaseAdminConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  console.error("[admin] slots error", error);
  return NextResponse.json({ error: "Failed to load slots." }, { status: 500 });
}

export const runtime = "nodejs";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "1970-01-01";
  const to = searchParams.get("to") ?? "2999-12-31";

  try {
    const slots = await listSlotsInRange(from, to);
    return NextResponse.json({ slots });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    date?: string;
    times?: string[];
  } | null;

  const date = String(body?.date ?? "");
  const times = Array.isArray(body?.times) ? body!.times : [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const allowed = new Set<string>(SLOT_HOURS);
  const uniqueTimes = [...new Set(times.map(String))].filter((t) =>
    allowed.has(t),
  );
  if (!uniqueTimes.length) {
    return NextResponse.json({ error: "Select at least one hour." }, { status: 400 });
  }

  try {
    const result = await upsertOpenSlots(
      uniqueTimes.map((time) => ({ date, time })),
    );
    return NextResponse.json(result);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const slotId = searchParams.get("id");
  if (!slotId) {
    return NextResponse.json({ error: "Missing slot id." }, { status: 400 });
  }

  try {
    await deleteOpenSlot(slotId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
