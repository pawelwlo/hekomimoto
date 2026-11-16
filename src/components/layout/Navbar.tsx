"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { navItems, serviceRoutes, siteConfig } from "@/content/site";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const { open } = useQuoteWidget();
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <Link
          href="/"
          className="font-logo block w-full text-center text-[clamp(1.75rem,8vw,2.25rem)] leading-none text-white md:w-auto md:text-left md:text-2xl"
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

        <div className="hidden shrink-0 items-center gap-3 md:flex">
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
      </div>
    </header>
  );
}
