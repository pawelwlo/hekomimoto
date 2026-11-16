export type SlotStatus = "open" | "pending" | "booked";

export type BookingStatus = "pending" | "confirmed" | "rejected";

export type BookingSlot = {
  id: string;
  /** ISO datetime in UTC */
  startAt: string;
  /** ISO datetime in UTC */
  endAt: string;
  /** Europe/Warsaw calendar date YYYY-MM-DD */
  date: string;
  /** HH:mm in Europe/Warsaw */
  time: string;
  status: SlotStatus;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  slotId: string;
  startAt: string;
  endAt: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  photoUrls: string[];
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string | null;
};

export const BOOKING_TIMEZONE = "Europe/Warsaw";

export const SLOT_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;
