"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LOCALE_COOKIE } from "@/lib/geo-locale";
import { cn } from "@/lib/utils";

const ALT: Record<
  Locale,
  { locale: Locale; label: string }
> = {
  pl: { locale: "en", label: "English version" },
  en: { locale: "pl", label: "Wersja polska" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const alt = ALT[locale];

  function switchLocale() {
    document.cookie = `${LOCALE_COOKIE}=${alt.locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.replace(pathname, { locale: alt.locale });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={cn(
        "text-sm text-muted transition-colors hover:text-accent",
        className,
      )}
      aria-label={alt.label}
    >
      {alt.label}
    </button>
  );
}
