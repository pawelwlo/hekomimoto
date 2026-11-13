import type { GalleryItem } from "@/content/gallery";

const WP_API =
  process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ??
  "https://hekomimoto.com/wp-json/wp/v2";

const SKIP_NAME = /logo|icon|favicon|cropped|avatar|widget|button/i;
const MIN_EDGE = 400;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type WpMediaSize = {
  source_url: string;
  width: number;
  height: number;
};

type WpMedia = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  alt_text?: string;
  source_url: string;
  mime_type?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, WpMediaSize>;
  };
};

function decodeHtml(value: string) {
  return value
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickSrc(media: WpMedia, prefer: "grid" | "full") {
  const sizes = media.media_details?.sizes ?? {};
  if (prefer === "grid") {
    for (const key of ["large", "medium_large", "medium"] as const) {
      const size = sizes[key];
      if (size?.source_url) return size.source_url;
    }
  }
  return sizes.full?.source_url ?? media.source_url;
}

function isGalleryCandidate(media: WpMedia) {
  if (!ALLOWED_MIME.has(media.mime_type ?? "")) return false;
  const width = media.media_details?.width ?? 0;
  const height = media.media_details?.height ?? 0;
  if (width < MIN_EDGE && height < MIN_EDGE) return false;
  const label = `${media.slug} ${media.title?.rendered ?? ""} ${media.source_url}`;
  if (SKIP_NAME.test(label)) return false;
  return true;
}

function toGalleryItem(media: WpMedia): GalleryItem {
  const title = decodeHtml(media.title?.rendered ?? "").trim();
  const alt = (media.alt_text?.trim() || title || "Hekomimoto PDR").trim();
  return {
    id: String(media.id),
    src: pickSrc(media, "grid"),
    fullSrc: pickSrc(media, "full"),
    alt,
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

async function fetchMediaPage(page: number): Promise<{
  items: WpMedia[];
  totalPages: number;
}> {
  const url = new URL(`${WP_API}/media`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page", String(page));
  url.searchParams.set(
    "_fields",
    "id,slug,title,alt_text,source_url,mime_type,media_details",
  );

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600, tags: ["wordpress-media"] },
  });

  if (!res.ok) {
    throw new Error(`WordPress media fetch failed: ${res.status}`);
  }

  const items = (await res.json()) as WpMedia[];
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
  return { items, totalPages };
}

/** Live gallery images from WordPress media library (hourly revalidate). */
export async function fetchWpGalleryItems(): Promise<GalleryItem[]> {
  try {
    const first = await fetchMediaPage(1);
    const pages = [first.items];
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await fetchMediaPage(page);
      pages.push(next.items);
    }

    return pages
      .flat()
      .filter(isGalleryCandidate)
      .map(toGalleryItem);
  } catch (error) {
    console.error("[wordpress] gallery fetch failed", error);
    return [];
  }
}
