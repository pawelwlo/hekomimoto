"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Camera, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { monthMatrix, todayWarsawDate } from "@/lib/booking/time";

type PublicSlot = {
  id: string;
  date: string;
  time: string;
  startAt: string;
  endAt: string;
};

export function BookingCalendar() {
  const t = useTranslations("bookingPage");
  const tForm = useTranslations("form");
  const locale = useLocale();
  const today = todayWarsawDate();

  const initial = useMemo(() => {
    const [y, m] = today.split("-").map(Number);
    return { year: y, monthIndex: m - 1 };
  }, [today]);

  const [year, setYear] = useState(initial.year);
  const [monthIndex, setMonthIndex] = useState(initial.monthIndex);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch("/api/booking/slots");
        const data = (await res.json()) as { slots?: PublicSlot[] };
        if (!cancelled) setSlots(data.slots ?? []);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openDates = useMemo(() => {
    const set = new Set<string>();
    for (const slot of slots) set.add(slot.date);
    return set;
  }, [slots]);

  const timesForDate = useMemo(
    () =>
      slots
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [slots, selectedDate],
  );

  const cells = monthMatrix(year, monthIndex);
  const monthLabel = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, monthIndex + delta, 1));
    setYear(d.getUTCFullYear());
    setMonthIndex(d.getUTCMonth());
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const nextPreviews = [...previews];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) continue;
      if (next.length >= 6) break;
      next.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }
    setFiles(next);
    setPreviews(nextPreviews);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]!);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedSlotId) {
      setError(t("errors.slot"));
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (files.length < 1) {
      setError(t("errors.photos"));
      return;
    }

    setStatus("sending");
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("phone", phone.trim());
      form.set("email", email.trim());
      form.set("message", message.trim());
      form.set("locale", locale);
      form.set("slotId", selectedSlotId);
      for (const file of files) form.append("files", file);

      const res = await fetch("/api/booking/request", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? t("errors.generic"));
        return;
      }

      setStatus("success");
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
      setSelectedSlotId(null);
      setFiles([]);
      setPreviews((p) => {
        p.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    } catch {
      setStatus("error");
      setError(t("errors.generic"));
    }
  }

  const weekdays =
    locale === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 hover:bg-white/5"
            onClick={() => shiftMonth(-1)}
            aria-label={t("prevMonth")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-display text-lg font-semibold capitalize text-white">
            {monthLabel}
          </p>
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 hover:bg-white/5"
            onClick={() => shiftMonth(1)}
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {weekdays.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.date) {
              return <div key={`e-${i}`} className="aspect-square" />;
            }
            const available = openDates.has(cell.date);
            const isPast = cell.date < today;
            const selected = selectedDate === cell.date;
            return (
              <button
                key={cell.date}
                type="button"
                disabled={!available || isPast}
                onClick={() => {
                  setSelectedDate(cell.date);
                  setSelectedSlotId(null);
                }}
                className={cn(
                  "aspect-square rounded-xl text-sm transition",
                  selected && "bg-accent text-white",
                  !selected && available && !isPast && "bg-gold/15 text-gold hover:bg-gold/25",
                  (!available || isPast) && "text-muted/40",
                )}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        {loadingSlots ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </p>
        ) : null}

        {selectedDate ? (
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-white">
              {t("pickTime")} · {selectedDate}
            </p>
            {timesForDate.length === 0 ? (
              <p className="text-sm text-muted">{t("noTimes")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {timesForDate.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition",
                      selectedSlotId === slot.id
                        ? "border-accent bg-accent text-white"
                        : "border-white/10 text-white hover:border-gold/50",
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">{t("pickDate")}</p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6"
      >
        <h3 className="font-display text-xl font-semibold text-white">
          {t("formTitle")}
        </h3>
        <p className="mt-2 text-sm text-muted">{t("formHint")}</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">{tForm("name")} *</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">{tForm("phone")} *</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">{tForm("email")} *</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">{tForm("message")}</span>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            />
          </label>

          <div>
            <p className="mb-1.5 text-sm text-muted">{t("photos")} *</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
              <Camera className="h-4 w-4" />
              {tForm("addPhotos")}
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted">{tForm("photosHint")}</p>
            {previews.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={src} className="relative h-20 w-20 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/70 p-0.5"
                      onClick={() => removeFile(i)}
                      aria-label={tForm("removePhoto")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        {status === "success" ? (
          <p className="mt-4 text-sm text-gold">{t("success")}</p>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tForm("sending")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </form>
    </div>
  );
}
