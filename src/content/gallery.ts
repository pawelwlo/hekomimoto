export type GalleryCategory = "hail" | "parking" | "vandalism" | "classic";

export type GalleryItem = {
  id: string;
  /** Optional when images come from WordPress without damage-type taxonomies */
  category?: GalleryCategory;
  src: string;
  /** Higher-res URL for lightbox; falls back to src */
  fullSrc?: string;
  /** Optional paired before image; when omitted, lightbox shows a single photo */
  beforeSrc?: string;
  afterSrc?: string;
  alt: string;
  width?: number;
  height?: number;
};

/** Hero background — keep local for LCP; Instagram https://www.instagram.com/p/Bzz_7fShY4A/ */
export const heroImage = "/images/hero/home-bg.jpg";

/** Fallback workshop visual if WordPress is unreachable */
export const workshopImageFallback = "/images/gallery/ig-07.jpg";

export const teamImages: string[] = [];
