"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ContactFormProps = {
  requirePhotos?: boolean;
  className?: string;
  onSuccess?: () => void;
};

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;

export function ContactForm({
  requirePhotos = false,
  className,
  onSuccess,
}: ContactFormProps) {
  const t = useTranslations("form");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const nextPreviews = [...previews];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_SIZE) continue;
      next.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }
    setFiles(next);
    setPreviews(nextPreviews);
    setFieldError(null);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((f) => f.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!name.trim() || !phone.trim()) {
      setFieldError(t("required"));
      return;
    }
    if (requirePhotos && files.length === 0) {
      setFieldError(t("photosRequired"));
      return;
    }

    setStatus("sending");
    try {
      const body = new FormData();
      body.set("name", name.trim());
      body.set("phone", phone.trim());
      if (email.trim()) body.set("email", email.trim());
      if (message.trim()) body.set("message", message.trim());
      body.set("locale", locale);
      files.forEach((file) => body.append("files", file));

      const res = await fetch("/api/quote", { method: "POST", body });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      previews.forEach((url) => URL.revokeObjectURL(url));
      setFiles([]);
      setPreviews([]);
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4", className)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">{t("name")}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">{t("phone")}</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
            autoComplete="tel"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted">{t("email")}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
          autoComplete="email"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted">{t("message")}</span>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-accent"
        />
      </label>

      <div>
        <p className="mb-1.5 text-sm text-muted">
          {t("photos")}
          {requirePhotos ? " *" : ""}
        </p>
        <p className="mb-3 text-xs text-muted/80">{t("photosHint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Camera className="h-4 w-4" />
          {t("addPhotos")}
        </button>
        {previews.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {previews.map((src, i) => (
              <li key={src} className="relative aspect-square overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1"
                  aria-label={t("removePhoto")}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {fieldError ? (
        <p className="text-sm text-red-400" role="alert">
          {fieldError}
        </p>
      ) : null}
      {status === "success" ? (
        <p className="text-sm text-emerald-400" role="status">
          {t("success")}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-400" role="alert">
          {t("error")}
        </p>
      ) : null}

      <p className="text-xs text-muted">{t("privacy")}</p>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("sending")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
