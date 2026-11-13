import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import type { Locale } from "@/i18n/routing";

type MetaMessages = {
  title: string;
  description: string;
};

export function buildPageMetadata({
  locale,
  path,
  meta,
}: {
  locale: Locale;
  path: string;
  meta: MetaMessages;
}): Metadata {
  const normalized = path === "/" ? "" : path;
  const url =
    locale === "pl"
      ? `${siteConfig.url}${normalized}`
      : `${siteConfig.url}/en${normalized}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: meta.title,
    description: meta.description,
    icons: {
      icon: [{ url: "/ikona-3.png", type: "image/png" }],
      apple: [{ url: "/ikona-3.png", type: "image/png" }],
      shortcut: ["/ikona-3.png"],
    },
    alternates: {
      canonical: url,
      languages: {
        pl: `${siteConfig.url}${normalized}`,
        en: `${siteConfig.url}/en${normalized}`,
        "x-default": `${siteConfig.url}${normalized}`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: siteConfig.name,
      locale: locale === "pl" ? "pl_PL" : "en_US",
      alternateLocale: locale === "pl" ? ["en_US"] : ["pl_PL"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}
