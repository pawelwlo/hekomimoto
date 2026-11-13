"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { heroImage } from "@/content/gallery";
import { siteConfig } from "@/content/site";
import { useQuoteWidget } from "@/components/providers/QuoteWidgetProvider";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("hero");
  const tCta = useTranslations("cta");
  const { open } = useQuoteWidget();

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* CLIENT: replace heroImage with final automotive photo or muted video poster */}
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:px-6 md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-accent"
        >
          {t("badge")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-montserrat max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t("headline")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-5 max-w-2xl text-base text-neutral-300 md:text-lg"
        >
          {t("subheadline")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={open}>
            {tCta("sendPhotos")}
          </Button>
          <a href={siteConfig.phoneHref}>
            <Button
              size="lg"
              variant="secondary"
              leftIcon={<Phone className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {tCta("callNow")}
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
