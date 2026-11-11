"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const keys = ["years", "turnaround", "quality", "mobile"] as const;

export function TrustBar() {
  const t = useTranslations("trust");

  return (
    <section className="border-y border-white/5 bg-surface/80 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-6">
        {keys.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05 }}
            className="text-center md:text-left"
          >
            <p className="font-display text-2xl font-bold text-accent md:text-3xl">
              {t(`${key}.value`)}
            </p>
            <p className="mt-1 text-sm text-muted">{t(`${key}.label`)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
