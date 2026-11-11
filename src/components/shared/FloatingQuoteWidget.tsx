"use client";

import { useTranslations } from "next-intl";
import { Camera, X } from "lucide-react";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { ContactForm } from "@/components/shared/ContactForm";
import { cn } from "@/lib/utils";

export function FloatingQuoteWidget() {
  const t = useTranslations("quoteWidget");
  const { isOpen, open, close } = useQuoteWidget();

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={open}
          className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover md:bottom-6 md:right-6"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">{t("open")}</span>
          <span className="sm:hidden">{t("open")}</span>
        </button>
      ) : null}

      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4",
          isOpen ? "flex" : "hidden",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-widget-title"
        onClick={close}
      >
        <div
          className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="quote-widget-title"
                className="font-display text-xl font-bold text-white"
              >
                {t("title")}
              </h2>
              <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white"
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ContactForm requirePhotos onSuccess={close} />
        </div>
      </div>
    </>
  );
}
