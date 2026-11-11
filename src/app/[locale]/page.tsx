import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyUs } from "@/components/home/WhyUs";
import { BeforeAfterSection } from "@/components/home/BeforeAfterSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQTeaser } from "@/components/home/FAQTeaser";
import { CTASection } from "@/components/shared/CTASection";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ServicesSection />
      <WhyUs />
      <BeforeAfterSection />
      <ProcessSection />
      <TestimonialsSection />
      <FAQTeaser />
      <CTASection />
    </>
  );
}
