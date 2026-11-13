import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { Outfit, Montserrat } from "next/font/google";
import { routing } from "@/i18n/routing";
import { QuoteWidgetProvider } from "@/components/providers/QuoteWidgetProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { FloatingQuoteWidget } from "@/components/shared/FloatingQuoteWidget";
import { FirebaseAnalytics } from "@/components/providers/FirebaseAnalytics";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { localBusinessJsonLd } from "@/lib/schema";
import { siteConfig } from "@/content/site";
import "../globals.css";

/** Usuzi italic (Isuzu-style) — Iconian Fonts; commercial use requires $20 license */
const usuzi = localFont({
  src: [
    { path: "../../fonts/usuziital.ttf", weight: "400", style: "italic" },
    { path: "../../fonts/usuziboldital.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-usuzi",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${usuzi.variable} ${outfit.variable} ${montserrat.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd()),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <QuoteWidgetProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <MobileStickyBar />
            <FloatingQuoteWidget />
            <CookieConsent />
            <FirebaseAnalytics />
            <div className="sr-only" aria-hidden>
              {siteConfig.phone} · {siteConfig.email}
            </div>
          </QuoteWidgetProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
