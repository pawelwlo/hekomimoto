import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/shared/ServiceCard";

const cards = [
  { href: "/services/hail", key: "hail" },
  { href: "/services/parking-dents", key: "parking" },
  { href: "/services/vandalism", key: "vandalism" },
  { href: "/services/mobile", key: "mobile" },
] as const;

export async function ServicesSection() {
  const t = await getTranslations("services");
  const tCta = await getTranslations("cta");

  return (
    <section className="bg-grid py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ href, key }) => (
            <ServiceCard
              key={key}
              href={href}
              title={t(`${key}.title`)}
              description={t(`${key}.short`)}
              ctaLabel={tCta("learnMore")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
