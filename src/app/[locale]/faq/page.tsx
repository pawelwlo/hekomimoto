import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { CTASection } from "@/components/shared/CTASection";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.faq" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/faq",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = (["1", "2", "3", "4", "5", "6"] as const).map((key) => ({
    q: t(`items.${key}.q`),
    a: t(`items.${key}.a`),
  }));

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading title={t("title")} subtitle={t("subtitle")} />
          <FAQAccordion items={items} />
        </div>
      </section>
      <CTASection />
    </>
  );
}
