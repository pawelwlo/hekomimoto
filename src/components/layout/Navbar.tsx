"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { navItems, serviceRoutes, siteConfig } from "@/content/site";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const { open } = useQuoteWidget();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <Link
          href="/"
          className="font-logo text-xl text-white md:text-2xl"
        >
          Hekomi<span className="text-accent">moto</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) =>
            item.key === "services" ? (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white"
                  aria-expanded={servicesOpen}
                >
                  {t("services")}
                </button>
                {servicesOpen ? (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="glass min-w-[240px] rounded-xl p-2 shadow-2xl">
                      {serviceRoutes.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {tServices(`${s.key}.title`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white"
              >
                {t(item.key)}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-accent"
          >
            <Phone className="h-4 w-4 text-accent" aria-hidden />
            {siteConfig.phone}
          </a>
          <Button size="sm" onClick={open}>
            {t("freeQuote")}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={siteConfig.phoneHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-accent"
            aria-label={t("callNow")}
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-white/5 bg-background lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg px-3 py-3 text-base text-white"
              onClick={() => setMobileOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="mt-2 space-y-2 border-t border-white/5 pt-4">
            {serviceRoutes.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted"
                onClick={() => setMobileOpen(false)}
              >
                {tServices(`${s.key}.title`)}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher />
            <Button
              className="flex-1"
              onClick={() => {
                setMobileOpen(false);
                open();
              }}
            >
              {t("freeQuote")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
