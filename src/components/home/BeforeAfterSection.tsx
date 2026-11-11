import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { galleryItems } from "@/content/gallery";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

export async function BeforeAfterSection() {
  const t = await getTranslations("beforeAfter");
  const tCta = await getTranslations("cta");
  const featured = galleryItems.slice(0, 4);

  return (
    <section className="bg-surface/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <div
              key={item.id}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
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
