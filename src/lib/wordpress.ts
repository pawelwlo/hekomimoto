import type { GalleryItem } from "@/content/gallery";
import { firstImageSrc, stripHtml } from "@/lib/blog/sanitize";
import { getBlogPostByWpId, upsertImportedPost } from "@/lib/blog/store";

const WP_API =
  process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ??
  "https://hekomimoto.com/wp-json/wp/v2";

const WP_FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "HekomimotoSite/1.0 (+https://hekomimoto.com; blog-import)",
};

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
    headers: WP_FETCH_HEADERS,
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

type WpPost = {
  id: number;
  slug: string;
  status: string;
  date: string;
  modified: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  featured_media?: number;
};

async function fetchPostsPage(page: number): Promise<{
  items: WpPost[];
  totalPages: number;
}> {
  const url = new URL(`${WP_API}/posts`);
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", String(page));
  url.searchParams.set("status", "publish");
  url.searchParams.set(
    "_fields",
    "id,slug,status,date,modified,title,excerpt,content,featured_media",
  );

  const res = await fetch(url.toString(), {
    headers: WP_FETCH_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`WordPress posts fetch failed: ${res.status}`);
  }

  const items = (await res.json()) as WpPost[];
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
  return { items, totalPages };
}

async function fetchMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null;
  const url = new URL(`${WP_API}/media/${mediaId}`);
  url.searchParams.set("_fields", "source_url,media_details");
  const res = await fetch(url.toString(), {
    headers: WP_FETCH_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const media = (await res.json()) as WpMedia;
  return pickSrc(media, "full");
}

/** Import all published WordPress posts into Firestore (upsert by wpId). */
export async function importWpBlogPosts() {
  const first = await fetchPostsPage(1);
  const pages = [first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPostsPage(page);
    pages.push(next.items);
  }

  const posts = pages.flat().filter((p) => p.status === "publish");
  let imported = 0;
  let updated = 0;

  for (const post of posts) {
    const title = decodeHtml(post.title?.rendered ?? "").trim() || post.slug;
    const contentHtml = post.content?.rendered ?? "";
    const excerpt =
      stripHtml(post.excerpt?.rendered ?? "") ||
      stripHtml(contentHtml).slice(0, 220);
    const featuredUrl = await fetchMediaUrl(post.featured_media ?? 0);
    const coverImageUrl = featuredUrl || firstImageSrc(contentHtml);
    const existingBefore = await getBlogPostByWpId(post.id);

    await upsertImportedPost({
      wpId: post.id,
      slug: post.slug,
      title,
      excerpt,
      contentHtml,
      coverImageUrl,
      publishedAt: new Date(post.date).toISOString(),
    });

    if (existingBefore) updated += 1;
    else imported += 1;
  }

  return { total: posts.length, imported, updated };
}
