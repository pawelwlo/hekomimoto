import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Image from "next/image";
import { fetchWpGalleryItems } from "@/lib/wordpress";
import type { ServiceKey } from "@/types";

const benefitKeys = ["paint", "fast", "cost", "value"] as const;

type ServicePageProps = {
  serviceKey: ServiceKey;
};

export async function ServicePageContent({ serviceKey }: ServicePageProps) {
  const t = await getTranslations("services");
  const tWhy = await getTranslations("whyUs");
  const tProcess = await getTranslations("process");
  const tPages = await getTranslations("servicePages");
  const galleryItems = await fetchWpGalleryItems();
  const sample = galleryItems[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5 bg-surface py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(227,38,42,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Hekomimoto
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            {t(`${serviceKey}.title`)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            {t(`${serviceKey}.description`)}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <SectionHeading
              align="left"
              title={t("benefitsTitle")}
              className="mb-6"
            />
            <ul className="space-y-4">
              {benefitKeys.map((key) => (
                <li key={key} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-white">
                      {tWhy(`items.${key}.title`)}
                    </p>
                    <p className="text-sm text-muted">
                      {tWhy(`items.${key}.text`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {sample ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={sample.src}
                alt={sample.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-grid py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading title={t("processTitle")} />
          <div className="grid gap-4 md:grid-cols-4">
            {(["1", "2", "3", "4"] as const).map((step) => (
              <GlassPanel key={step}>
                <p className="text-accent font-display text-2xl font-bold">
                  {step}
                </p>
                <h3 className="mt-2 font-semibold text-white">
                  {tProcess(`steps.${step}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {tProcess(`steps.${step}.text`)}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <CTASection title={tPages("ctaTitle")} subtitle={tPages("ctaSubtitle")} />
    </>
  );
}
