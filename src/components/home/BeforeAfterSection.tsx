import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { FeaturedWorkGrid } from "@/components/home/FeaturedWorkGrid";
import { fetchWpGalleryItems } from "@/lib/wordpress";

export async function BeforeAfterSection() {
  const t = await getTranslations("beforeAfter");
  const tCta = await getTranslations("cta");
  const galleryItems = await fetchWpGalleryItems();
  const featured = galleryItems.slice(0, 4);

  return (
    <section className="bg-surface/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <FeaturedWorkGrid items={featured} />
        <div className="mt-8 text-center">
          <Link
            href="/gallery"
            className="text-sm font-semibold text-accent hover:underline"
          >
            {tCta("viewGallery")}
          </Link>
        </div>
      </div>
    </section>
  );
}
