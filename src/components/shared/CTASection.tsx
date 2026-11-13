"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/content/site";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

type CTASectionProps = {
  title?: string;
  subtitle?: string;
};

export function CTASection({ title, subtitle }: CTASectionProps) {
  const t = useTranslations("finalCta");
  const tCta = useTranslations("cta");
  const { open } = useQuoteWidget();

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,38,42,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <SectionHeading title={title ?? t("title")} subtitle={subtitle ?? t("subtitle")} />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={open}>
            {tCta("sendPhotos")}
          </Button>
          <a href={siteConfig.phoneHref}>
            <Button size="lg" variant="secondary" leftIcon={<Phone className="h-4 w-4" />}>
              {tCta("callNow")}
            </Button>
          </a>
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              leftIcon={<MessageCircle className="h-4 w-4" />}
            >
              {tCta("whatsapp")}
            </Button>
          </a>
        </div>
        <p className="mt-6 text-sm text-muted">{t("emergency")}</p>
        <a
          href={siteConfig.phoneHref}
          className="mt-2 inline-block text-lg font-semibold text-accent hover:underline"
        >
          {siteConfig.phone}
        </a>
      </div>
    </section>
  );
}
