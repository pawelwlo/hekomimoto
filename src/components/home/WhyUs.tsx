import { getTranslations } from "next-intl/server";
import { BadgeCheck, Gauge, PiggyBank, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";

const items = [
  { key: "paint", icon: Sparkles },
  { key: "fast", icon: Gauge },
  { key: "cost", icon: PiggyBank },
  { key: "value", icon: BadgeCheck },
] as const;

export async function WhyUs() {
  const t = await getTranslations("whyUs");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, icon: Icon }) => (
            <GlassPanel key={key}>
              <Icon className="mb-4 h-6 w-6 text-accent" />
              <h3 className="font-display text-lg font-semibold text-white">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted">{t(`items.${key}.text`)}</p>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
