import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CTASection } from "@/components/shared/CTASection";
import { workshopImage } from "@/content/gallery";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/about",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading align="left" title={t("title")} subtitle={t("subtitle")} />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <GlassPanel>
                <h2 className="font-display text-xl font-semibold text-white">
                  {t("storyTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{t("story")}</p>
              </GlassPanel>
              <GlassPanel>
                <h2 className="font-display text-xl font-semibold text-white">
                  {t("missionTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t("mission")}
                </p>
              </GlassPanel>
              <GlassPanel>
                <h2 className="font-display text-xl font-semibold text-white">
                  {t("workshopTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t("workshop")}
                </p>
              </GlassPanel>
            </div>
            <div>
              {/* CLIENT: replace workshopImage with real workshop photo */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={workshopImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
