"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { navItems, serviceRoutes, siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const tBar = useTranslations("mobileBar");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [tabletServicesOpen, setTabletServicesOpen] = useState(false);
  const menuId = useId();
  const servicesId = useId();
  const tabletServicesId = useId();
  const tabletWrapRef = useRef<HTMLDivElement>(null);
  const tabletTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!tabletOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (tabletWrapRef.current?.contains(target)) return;
      setTabletOpen(false);
      setTabletServicesOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setTabletOpen(false);
      setTabletServicesOpen(false);
      tabletTriggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tabletOpen]);

  const closeTabletMenu = () => {
    setTabletOpen(false);
    setTabletServicesOpen(false);
  };

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
                  aria-controls={servicesId}
                >
                  {t("services")}
                </button>
                {servicesOpen ? (
                  <div className="absolute left-0 top-full pt-2">
                    <div
                      id={servicesId}
                      className="glass min-w-[240px] rounded-xl p-2 shadow-2xl"
                    >
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
          <div ref={tabletWrapRef} className="relative lg:hidden">
            <button
              ref={tabletTriggerRef}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              aria-expanded={tabletOpen}
              aria-controls={menuId}
              onClick={() =>
                setTabletOpen((value) => {
                  if (value) setTabletServicesOpen(false);
                  return !value;
                })
              }
            >
              <Menu className="h-4 w-4 text-accent" aria-hidden />
              {tBar("menu")}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted transition-transform duration-150",
                  tabletOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {tabletOpen ? (
              <div
                id={menuId}
                className="glass absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70dvh,28rem)] w-72 overflow-y-auto rounded-xl p-2 shadow-2xl"
              >
                <nav className="flex flex-col gap-0.5" aria-label="Main">
                  {navItems.map((item) =>
                    item.key === "services" ? (
                      <div key={item.key}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/5"
                          aria-expanded={tabletServicesOpen}
                          aria-controls={tabletServicesId}
                          onClick={() => setTabletServicesOpen((v) => !v)}
                        >
                          {t("services")}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted transition-transform duration-150",
                              tabletServicesOpen && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                        <div
                          id={tabletServicesId}
                          hidden={!tabletServicesOpen}
                          className="ml-2 border-l border-white/10 pl-2"
                        >
                          {serviceRoutes.map((s) => (
                            <Link
                              key={s.href}
                              href={s.href}
                              className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
                              onClick={closeTabletMenu}
                            >
                              {tServices(`${s.key}.title`)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/5"
                        onClick={closeTabletMenu}
                      >
                        {t(item.key)}
                      </Link>
                    ),
                  )}
                </nav>
              </div>
            ) : null}
          </div>

          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-accent"
          >
            <Phone className="h-4 w-4 text-accent" aria-hidden />
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
