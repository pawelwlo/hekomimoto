import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = ["1", "2", "3", "4"] as const;

export async function ProcessSection() {
  const t = await getTranslations("process");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step}
              className="relative rounded-2xl border border-white/10 bg-surface p-6"
            >
              <span className="font-display text-4xl font-bold text-accent/40">
                {step.padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted">{t(`steps.${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
