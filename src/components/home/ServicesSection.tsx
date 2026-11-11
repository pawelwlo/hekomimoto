import { getTranslations } from "next-intl/server";
import { CloudHail, MapPinned, ParkingSquare, ShieldAlert } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/shared/ServiceCard";

const cards = [
  { href: "/services/hail", key: "hail", icon: CloudHail },
  { href: "/services/parking-dents", key: "parking", icon: ParkingSquare },
  { href: "/services/vandalism", key: "vandalism", icon: ShieldAlert },
  { href: "/services/mobile", key: "mobile", icon: MapPinned },
] as const;

export async function ServicesSection() {
  const t = await getTranslations("services");
  const tCta = await getTranslations("cta");

  return (
    <section className="bg-grid py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ href, key, icon: Icon }) => (
            <ServiceCard
              key={key}
              href={href}
              title={t(`${key}.title`)}
              description={t(`${key}.short`)}
              ctaLabel={tCta("learnMore")}
              icon={<Icon className="h-5 w-5" />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
