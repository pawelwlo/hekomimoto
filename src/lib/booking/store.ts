import { randomUUID } from "crypto";
import { getAdminBucket, getAdminDb } from "@/lib/firebase-admin";
import {
  addOneHour,
  slotIdFor,
  warsawLocalToUtc,
} from "@/lib/booking/time";
import type {
  Booking,
  BookingSlot,
  SlotStatus,
} from "@/lib/booking/types";

const SLOTS = "bookingSlots";
const BOOKINGS = "bookings";

function nowIso() {
  return new Date().toISOString();
}

export async function listSlotsByStatus(statuses: SlotStatus[]) {
  const db = getAdminDb();
  const snap = await db.collection(SLOTS).where("status", "in", statuses).get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as BookingSlot)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function listOpenFutureSlots() {
  const slots = await listSlotsByStatus(["open"]);
  const now = Date.now();
  return slots.filter((s) => new Date(s.startAt).getTime() > now);
}

export async function listSlotsInRange(fromDate: string, toDate: string) {
  const db = getAdminDb();
  const snap = await db
    .collection(SLOTS)
    .where("date", ">=", fromDate)
    .where("date", "<=", toDate)
    .get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as BookingSlot)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function upsertOpenSlots(
  entries: Array<{ date: string; time: string }>,
) {
  const db = getAdminDb();
  const batch = db.batch();
  const created: BookingSlot[] = [];
  const skipped: string[] = [];
  const now = nowIso();

  for (const { date, time } of entries) {
    const id = slotIdFor(date, time);
    const ref = db.collection(SLOTS).doc(id);
    const existing = await ref.get();
    if (existing.exists) {
      const data = existing.data() as BookingSlot;
      if (data.status !== "open") {
        skipped.push(id);
        continue;
      }
      skipped.push(id);
      continue;
    }
    const start = warsawLocalToUtc(date, time);
    const end = addOneHour(start);
    const slot: BookingSlot = {
      id,
      date,
      time,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: "open",
      bookingId: null,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(ref, slot);
    created.push(slot);
  }

  if (created.length) await batch.commit();
  return { created, skipped };
}

export async function deleteOpenSlot(slotId: string) {
  const db = getAdminDb();
  const ref = db.collection(SLOTS).doc(slotId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Slot not found");
  const data = snap.data() as BookingSlot;
  if (data.status !== "open") {
    throw new Error("Only open slots can be removed");
  }
  await ref.delete();
}

export async function uploadBookingPhotos(
  bookingId: string,
  files: File[],
): Promise<string[]> {
  const bucket = getAdminBucket();
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "photo.jpg";
    const path = `bookings/${bookingId}/${index}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const object = bucket.file(path);
    await object.save(buffer, {
      contentType: file.type || "image/jpeg",
      resumable: false,
      metadata: {
        cacheControl: "private, max-age=0",
      },
    });
    const [signedUrl] = await object.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    });
    urls.push(signedUrl);
  }

  return urls;
}

export async function createPendingBooking(input: {
  slotId: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  files: File[];
}) {
  const db = getAdminDb();
  const slotRef = db.collection(SLOTS).doc(input.slotId);
  const bookingId = randomUUID();
  const bookingRef = db.collection(BOOKINGS).doc(bookingId);
  const now = nowIso();

  await db.runTransaction(async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new Error("Slot not found");
    const slot = slotSnap.data() as BookingSlot;
    if (slot.status !== "open") throw new Error("Slot unavailable");
    if (new Date(slot.startAt).getTime() <= Date.now()) {
      throw new Error("Slot is in the past");
    }

    const booking: Booking = {
      id: bookingId,
      slotId: slot.id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      date: slot.date,
      time: slot.time,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      locale: input.locale,
      photoUrls: [],
      status: "pending",
      createdAt: now,
      updatedAt: now,
      decidedAt: null,
    };

    tx.set(bookingRef, booking);
    tx.update(slotRef, {
      status: "pending",
      bookingId,
      updatedAt: now,
    });
  });

  let photoUrls: string[] = [];
  try {
    photoUrls = await uploadBookingPhotos(bookingId, input.files);
    await bookingRef.update({ photoUrls, updatedAt: nowIso() });
  } catch (error) {
    console.error("[booking] photo upload failed", error);
    await db.runTransaction(async (tx) => {
      tx.update(slotRef, {
        status: "open",
        bookingId: null,
        updatedAt: nowIso(),
      });
      tx.update(bookingRef, {
        status: "rejected",
        updatedAt: nowIso(),
        decidedAt: nowIso(),
      });
    });
    throw new Error("Photo upload failed");
  }

  const bookingSnap = await bookingRef.get();
  return { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
}

export async function listBookingsByStatus(
  status: Booking["status"] | Booking["status"][],
) {
  const db = getAdminDb();
  const statuses = Array.isArray(status) ? status : [status];
  const snap = await db
    .collection(BOOKINGS)
    .where("status", "in", statuses)
    .get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Booking)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function decideBooking(
  bookingId: string,
  decision: "confirmed" | "rejected",
) {
  const db = getAdminDb();
  const bookingRef = db.collection(BOOKINGS).doc(bookingId);
  const now = nowIso();

  const booking = await db.runTransaction(async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists) throw new Error("Booking not found");
    const current = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
    if (current.status !== "pending") {
      throw new Error("Booking already decided");
    }
    const slotRef = db.collection(SLOTS).doc(current.slotId);
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new Error("Slot missing");

    tx.update(bookingRef, {
      status: decision,
      updatedAt: now,
      decidedAt: now,
    });

    if (decision === "confirmed") {
      tx.update(slotRef, {
        status: "booked",
        bookingId: current.id,
        updatedAt: now,
      });
    } else {
      tx.update(slotRef, {
        status: "open",
        bookingId: null,
        updatedAt: now,
      });
    }

    return { ...current, status: decision, updatedAt: now, decidedAt: now };
  });

  return booking;
}
