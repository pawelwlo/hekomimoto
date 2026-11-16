"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { GalleryItem } from "@/content/gallery";

type FeaturedWorkGridProps = {
  items: GalleryItem[];
};

export function FeaturedWorkGrid({ items }: FeaturedWorkGridProps) {
  const t = useTranslations("galleryPage");
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-accent/40"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-12 right-0 rounded-lg p-2 text-white hover:bg-white/10"
              onClick={() => setActive(null)}
              aria-label={t("lightboxClose")}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 sm:aspect-[4/3]">
              <Image
                src={active.fullSrc ?? active.src}
                alt={active.alt}
                fill
                className="object-contain bg-black"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
