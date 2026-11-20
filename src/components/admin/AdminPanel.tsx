"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { monthMatrix, todayWarsawDate } from "@/lib/booking/time";
import { SLOT_HOURS, type Booking, type BookingSlot } from "@/lib/booking/types";

type BookingsResponse = {
  pending: Booking[];
  confirmed: Booking[];
};

export function AdminPanel() {
  const today = todayWarsawDate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [monthIndex, setMonthIndex] = useState(
    () => Number(today.slice(5, 7)) - 1,
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [bookings, setBookings] = useState<BookingsResponse>({
    pending: [],
    confirmed: [],
  });
  const [edits, setEdits] = useState<
    Record<string, { date: string; time: string }>
  >({});
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const from = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const to = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [slotsRes, bookingsRes] = await Promise.all([
      fetch(`/api/admin/slots?from=${from}&to=${to}`),
      fetch("/api/admin/bookings"),
    ]);

    if (slotsRes.status === 401 || bookingsRes.status === 401) {
      setAuthed(false);
      return;
    }

    const slotsData = (await slotsRes.json()) as {
      slots?: BookingSlot[];
      error?: string;
    };
    const bookingsData = (await bookingsRes.json()) as BookingsResponse & {
      error?: string;
    };

    if (!slotsRes.ok || !bookingsRes.ok) {
      setMessage(
        slotsData.error ||
          bookingsData.error ||
          "Nie udało się połączyć z bazą terminów.",
      );
      return;
    }

    setSlots(slotsData.slots ?? []);
    setBookings({
      pending: bookingsData.pending ?? [],
      confirmed: bookingsData.confirmed ?? [],
    });
  }, [year, monthIndex]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/session");
      const data = (await res.json()) as { authenticated?: boolean };
      setAuthed(Boolean(data.authenticated));
    })();
  }, []);

  useEffect(() => {
    if (!authed) return;
    void refresh();
  }, [authed, refresh]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, BookingSlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.date) ?? [];
      list.push(slot);
      map.set(slot.date, list);
    }
    return map;
  }, [slots]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Nieprawidłowe hasło.");
        setBusy(false);
        return;
      }
      setPassword("");
      setAuthed(true);
    } catch {
      setLoginError("Błąd logowania.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  async function openSlots() {
    if (!selectedTimes.length) {
      setMessage("Wybierz przynajmniej jedną godzinę.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, times: selectedTimes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Nie udało się otworzyć terminów.");
      } else {
        setMessage(
          `Dodano ${data.created?.length ?? 0} terminów (pominięto ${data.skipped?.length ?? 0}).`,
        );
        setSelectedTimes([]);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeSlot(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/slots?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Nie można usunąć.");
      } else {
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  function draftFor(b: Booking) {
    return edits[b.id] ?? { date: b.date, time: b.time };
  }

  function setDraft(
    bookingId: string,
    patch: Partial<{ date: string; time: string }>,
  ) {
    setEdits((prev) => {
      const fromBooking = bookings.pending.find((x) => x.id === bookingId);
      const current = prev[bookingId] ?? {
        date: fromBooking?.date ?? "",
        time: fromBooking?.time ?? "",
      };
      return {
        ...prev,
        [bookingId]: {
          date: patch.date ?? current.date,
          time: patch.time ?? current.time,
        },
      };
    });
  }

  async function saveSchedule(bookingId: string) {
    const booking = bookings.pending.find((b) => b.id === bookingId);
    if (!booking) return;
    const draft = draftFor(booking);
    if (draft.date === booking.date && draft.time === booking.time) {
      setMessage("Termin bez zmian.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          bookingId,
          date: draft.date,
          time: draft.time,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Nie udało się zmienić terminu.");
      } else {
        setMessage("Termin zaktualizowany.");
        setEdits((prev) => {
          const next = { ...prev };
          delete next[bookingId];
          return next;
        });
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function decide(bookingId: string, decision: "confirmed" | "rejected") {
    setBusy(true);
    setMessage(null);
    try {
      const booking = bookings.pending.find((b) => b.id === bookingId);
      const draft = booking ? draftFor(booking) : null;
      if (
        decision === "confirmed" &&
        booking &&
        draft &&
        (draft.date !== booking.date || draft.time !== booking.time)
      ) {
        const reschedule = await fetch("/api/admin/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reschedule",
            bookingId,
            date: draft.date,
            time: draft.time,
          }),
        });
        const rescheduleData = await reschedule.json();
        if (!reschedule.ok) {
          setMessage(rescheduleData.error ?? "Nie udało się zmienić terminu.");
          return;
        }
      }

      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, decision, action: "decide" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Operacja nieudana.");
      } else {
        setMessage(
          decision === "confirmed"
            ? "Termin potwierdzony — wysłano e-mail do klienta."
            : "Odrzucono — termin wrócił do wolnych.",
        );
        setEdits((prev) => {
          const next = { ...prev };
          delete next[bookingId];
          return next;
        });
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Ładowanie…
      </div>
    );
  }

  if (!authed) {
    return (
      <form
        onSubmit={login}
        className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h1 className="font-display text-2xl font-semibold text-white">
          Panel admina
        </h1>
        <p className="mt-2 text-sm text-muted">
          Zaloguj się hasłem, aby zarządzać terminami.
        </p>
        <label className="mt-6 block text-sm">
          <span className="mb-1.5 block text-muted">Hasło</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            autoComplete="current-password"
          />
        </label>
        {loginError ? (
          <p className="mt-3 text-sm text-red-400">{loginError}</p>
        ) : null}
        <Button type="submit" className="mt-5 w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zaloguj"}
        </Button>
      </form>
    );
  }

  const cells = monthMatrix(year, monthIndex);
  const monthLabel = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
  const daySlots = (slotsByDate.get(selectedDate) ?? []).sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">
            Terminy i rezerwacje
          </h1>
          <p className="mt-1 text-sm text-muted">
            Otwieraj wolne godziny i zatwierdzaj zgłoszenia klientów.
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Wyloguj
        </Button>
      </div>

      {message ? <p className="text-sm text-gold">{message}</p> : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-1 text-sm"
              onClick={() => {
                const d = new Date(Date.UTC(year, monthIndex - 1, 1));
                setYear(d.getUTCFullYear());
                setMonthIndex(d.getUTCMonth());
              }}
            >
              ←
            </button>
            <p className="font-semibold capitalize text-white">{monthLabel}</p>
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-1 text-sm"
              onClick={() => {
                const d = new Date(Date.UTC(year, monthIndex + 1, 1));
                setYear(d.getUTCFullYear());
                setMonthIndex(d.getUTCMonth());
              }}
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell.date) return <div key={`e-${i}`} className="aspect-square" />;
              const has = (slotsByDate.get(cell.date) ?? []).some(
                (s) => s.status === "open",
              );
              const selected = selectedDate === cell.date;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(cell.date!);
                    setSelectedTimes([]);
                  }}
                  className={cn(
                    "aspect-square rounded-xl text-sm",
                    selected && "bg-accent text-white",
                    !selected && has && "bg-gold/20 text-gold",
                    !selected && !has && "text-muted hover:bg-white/5",
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
          <h2 className="font-semibold text-white">
            Otwórz godziny · {selectedDate}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SLOT_HOURS.map((time) => {
              const existing = daySlots.find((s) => s.time === time);
              const selected = selectedTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  disabled={Boolean(existing)}
                  onClick={() =>
                    setSelectedTimes((prev) =>
                      prev.includes(time)
                        ? prev.filter((t) => t !== time)
                        : [...prev, time],
                    )
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    existing && "cursor-not-allowed border-white/5 text-muted/40",
                    !existing &&
                      selected &&
                      "border-accent bg-accent text-white",
                    !existing &&
                      !selected &&
                      "border-white/10 text-white hover:border-gold/40",
                  )}
                >
                  {time}
                  {existing ? ` · ${existing.status}` : ""}
                </button>
              );
            })}
          </div>
          <Button className="mt-5" onClick={openSlots} disabled={busy}>
            Udostępnij wybrane godziny
          </Button>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-white">
              Terminy tego dnia
            </h3>
            <ul className="mt-3 space-y-2">
              {daySlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <span>
                    {slot.time}{" "}
                    <span className="text-muted">({slot.status})</span>
                  </span>
                  {slot.status === "open" ? (
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeSlot(slot.id)}
                      aria-label="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </li>
              ))}
              {!daySlots.length ? (
                <li className="text-sm text-muted">Brak terminów.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Oczekujące rezerwacje
        </h2>
        <div className="mt-4 space-y-4">
          {bookings.pending.map((b) => {
            const draft = draftFor(b);
            const dirty = draft.date !== b.date || draft.time !== b.time;
            return (
              <div
                key={b.id}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="font-semibold text-white">{b.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {b.phone} · {b.email}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Zgłoszony termin: {b.date} {b.time}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-muted">Data</span>
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft(b.id, { date: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-muted">Godzina</span>
                    <select
                      value={draft.time}
                      onChange={(e) => setDraft(b.id, { time: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
                    >
                      {SLOT_HOURS.map((hour) => (
                        <option key={hour} value={hour} className="bg-surface">
                          {hour}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || !dirty}
                    onClick={() => saveSchedule(b.id)}
                  >
                    Zapisz termin
                  </Button>
                </div>

                {b.message ? (
                  <p className="mt-3 text-sm text-neutral-300">{b.message}</p>
                ) : null}
                {b.photoUrls?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.photoUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block h-20 w-20 overflow-hidden rounded-lg border border-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => decide(b.id, "confirmed")}
                  >
                    Akceptuj
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => decide(b.id, "rejected")}
                  >
                    Odrzuć
                  </Button>
                </div>
              </div>
            );
          })}
          {!bookings.pending.length ? (
            <p className="text-sm text-muted">Brak oczekujących zgłoszeń.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Potwierdzone
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {bookings.confirmed.map((b) => (
            <li key={b.id} className="text-muted">
              <span className="text-white">
                {b.date} {b.time}
              </span>{" "}
              — {b.name} ({b.phone})
            </li>
          ))}
          {!bookings.confirmed.length ? (
            <li className="text-muted">Brak potwierdzonych rezerwacji.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
