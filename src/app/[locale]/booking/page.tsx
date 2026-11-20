import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { CTASection } from "@/components/shared/CTASection";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.booking" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/booking",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bookingPage");

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            title={t("title")}
            subtitle={t.rich("subtitle", {
              phone: (chunks) => (
                <a
                  href={siteConfig.phoneHref}
                  className="font-medium text-white underline decoration-accent/60 underline-offset-2 transition-colors hover:text-accent"
                >
                  {chunks}
                </a>
              ),
              contact: (chunks) => (
                <Link
                  href="/contact"
                  className="font-medium text-white underline decoration-accent/60 underline-offset-2 transition-colors hover:text-accent"
                >
                  {chunks}
                </Link>
              ),
            })}
          />
          <BookingCalendar />
        </div>
      </section>
      <CTASection />
    </>
  );
}
