import { setRequestLocale, getTranslations } from "next-intl/server";
import { ServicePageContent } from "@/components/shared/ServicePage";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services.hail" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/services/hail",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function HailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePageContent serviceKey="hail" />;
}
