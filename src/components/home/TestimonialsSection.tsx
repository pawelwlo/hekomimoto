import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/shared/TestimonialCard";

const keys = ["1", "2", "3"] as const;

export async function TestimonialsSection() {
  const t = await getTranslations("testimonials");

  return (
    <section className="bg-grid py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-5 md:grid-cols-3">
          {keys.map((key) => (
            <TestimonialCard
              key={key}
              name={t(`items.${key}.name`)}
              role={t(`items.${key}.role`)}
              text={t(`items.${key}.text`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
