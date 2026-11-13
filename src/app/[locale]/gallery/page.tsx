import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { CTASection } from "@/components/shared/CTASection";
import { buildPageMetadata } from "@/lib/seo";
import { fetchWpGalleryItems } from "@/lib/wordpress";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.gallery" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/gallery",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("galleryPage");
  const items = await fetchWpGalleryItems();

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading title={t("title")} subtitle={t("subtitle")} />
          <GalleryGrid items={items} />
        </div>
      </section>
      <CTASection />
    </>
  );
}
