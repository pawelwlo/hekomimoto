"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  type GalleryCategory,
  type GalleryItem,
} from "@/content/gallery";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { cn } from "@/lib/utils";

const filters: Array<GalleryCategory | "all"> = [
  "all",
  "hail",
  "parking",
  "vandalism",
  "classic",
];

function hasPair(item: GalleryItem) {
  return Boolean(item.beforeSrc && item.afterSrc);
}

type GalleryGridProps = {
  items: GalleryItem[];
};

export function GalleryGrid({ items: allItems }: GalleryGridProps) {
  const t = useTranslations("galleryPage");
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const hasCategories = useMemo(
    () => allItems.some((item) => Boolean(item.category)),
    [allItems],
  );

  const items = useMemo(() => {
    if (!hasCategories || filter === "all") return allItems;
    return allItems.filter((i) => i.category === filter);
  }, [allItems, filter, hasCategories]);

  return (
    <div>
      {hasCategories ? (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-accent text-white"
                  : "border border-white/10 text-muted hover:text-white",
              )}
            >
              {f === "all" ? t("all") : t(`filters.${f}`)}
            </button>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-accent/40"
              onClick={() => setActive(item)}
            >
              <div
                className={cn(
                  "relative w-full",
                  index % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]",
                )}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>
            </button>
          ))}
        </div>
      )}

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
            {hasPair(active) ? (
              <BeforeAfterSlider
                beforeSrc={active.beforeSrc!}
                afterSrc={active.afterSrc!}
              />
            ) : (
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
