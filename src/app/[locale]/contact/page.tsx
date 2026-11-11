import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ContactForm } from "@/components/shared/ContactForm";
import { CTASection } from "@/components/shared/CTASection";
import { siteConfig } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/contact",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const tFooter = await getTranslations("footer");

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading title={t("title")} subtitle={t("subtitle")} />
          <div className="grid gap-8 lg:grid-cols-5">
            <GlassPanel className="lg:col-span-3">
              <h2 className="font-display mb-6 text-xl font-semibold text-white">
                {t("formTitle")}
              </h2>
              <ContactForm />
            </GlassPanel>

            <div className="space-y-4 lg:col-span-2">
              <GlassPanel>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <Phone className="h-4 w-4 text-accent" />
                  {t("phoneTitle")}
                </h3>
                <a
                  href={siteConfig.phoneHref}
                  className="mt-2 block text-lg text-accent hover:underline"
                >
                  {siteConfig.phone}
                </a>
              </GlassPanel>
              <GlassPanel>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <Mail className="h-4 w-4 text-accent" />
                  {t("emailTitle")}
                </h3>
                <a
                  href={siteConfig.emailHref}
                  className="mt-2 block text-accent hover:underline"
                >
                  {siteConfig.email}
                </a>
              </GlassPanel>
              <GlassPanel>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <MapPin className="h-4 w-4 text-accent" />
                  {t("addressTitle")}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {siteConfig.name}
                  <br />
                  {siteConfig.address.line1}
                  <br />
                  {siteConfig.address.line2}
                </p>
              </GlassPanel>
              <GlassPanel>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <Clock className="h-4 w-4 text-accent" />
                  {t("hoursTitle")}
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>
                    {tFooter("weekdays")}: {siteConfig.hours.weekdays}
                  </li>
                  <li>
                    {tFooter("saturday")}: {siteConfig.hours.saturday}
                  </li>
                  <li>
                    {tFooter("sunday")}: {tFooter("closed")}
                  </li>
                </ul>
              </GlassPanel>
              <GlassPanel className="border-accent/30">
                <h3 className="font-semibold text-accent">{t("emergencyTitle")}</h3>
                <p className="mt-2 text-sm text-muted">{t("emergencyText")}</p>
              </GlassPanel>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display mb-4 text-xl font-semibold text-white">
              {t("mapTitle")}
            </h2>
            {/* CLIENT: replace with branded Google Maps embed if desired */}
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <iframe
                title={t("mapTitle")}
                src={siteConfig.mapsEmbedUrl}
                className="h-72 w-full grayscale invert-[0.9] contrast-125 md:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
