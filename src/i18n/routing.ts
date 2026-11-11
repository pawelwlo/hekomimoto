import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  // Always start in Polish; don't auto-switch from browser Accept-Language
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
