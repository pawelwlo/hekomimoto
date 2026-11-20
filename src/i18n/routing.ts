import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  // Locale is chosen by geo middleware (PL → pl, elsewhere → en), not Accept-Language
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
