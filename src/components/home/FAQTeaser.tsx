import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { Link } from "@/i18n/navigation";

export async function FAQTeaser() {
  const t = await getTranslations("faq");
  const tNav = await getTranslations("nav");
  const items = (["1", "2", "3"] as const).map((key) => ({
    q: t(`items.${key}.q`),
    a: t(`items.${key}.a`),
  }));

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <FAQAccordion items={items} />
        <div className="mt-8 text-center">
          <Link href="/faq" className="text-sm font-semibold text-accent hover:underline">
            {tNav("faq")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
