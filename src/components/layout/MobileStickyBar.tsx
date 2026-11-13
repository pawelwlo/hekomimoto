"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { navItems, siteConfig } from "@/content/site";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { cn } from "@/lib/utils";

export function MobileStickyBar() {
  const t = useTranslations("mobileBar");
  const tNav = useTranslations("nav");
  const { open } = useQuoteWidget();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden",
          menuOpen ? "block" : "hidden",
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-16 z-50 mx-4 rounded-2xl border border-white/10 bg-surface p-4 shadow-2xl md:hidden",
          menuOpen ? "block" : "hidden",
        )}
        role="dialog"
        aria-label={t("menu")}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-logo text-lg">
            Hekomi<span className="text-accent">moto</span>
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={tNav("closeMenu")}
            className="rounded-lg p-2 hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm text-white hover:bg-white/5"
              onClick={() => setMenuOpen(false)}
            >
              {tNav(item.key)}
            </Link>
          ))}
          <button
            type="button"
            className="mt-2 rounded-lg bg-accent px-3 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setMenuOpen(false);
              open();
            }}
          >
            {tNav("freeQuote")}
          </button>
        </nav>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          <a
            href={siteConfig.phoneHref}
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium text-white hover:bg-white/5"
          >
            <Phone className="h-5 w-5 text-accent" />
            {t("call")}
          </a>
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium text-white hover:bg-white/5"
          >
            <MessageCircle className="h-5 w-5 text-accent" />
            {t("whatsapp")}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium text-white hover:bg-white/5"
          >
            <Menu className="h-5 w-5 text-accent" />
            {t("menu")}
          </button>
        </div>
      </div>
    </>
  );
}
