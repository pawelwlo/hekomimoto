const WP_ORIGIN = "https://hekomimoto.com";

/** Light HTML cleanup for admin/WP content before save/display. */
export function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Prepare WP HTML for rendering on our domain:
 * - sanitize
 * - absolute-ize relative /wp-content URLs
 * - set referrerpolicy=no-referrer so host.pl hotlink protection does not 403
 */
export function prepareBlogHtml(html: string) {
  let out = sanitizeBlogHtml(html);

  out = out.replace(
    /(src|href)=(["'])\/(wp-content\/[^"']+)\2/gi,
    `$1=$2${WP_ORIGIN}/$3$2`,
  );
  out = out.replace(
    /(src|href)=(["'])https?:\/\/www\.hekomimoto\.com\//gi,
    `$1=$2${WP_ORIGIN}/`,
  );

  out = out.replace(/<img\b([^>]*?)>/gi, (_match, attrs: string) => {
    let next = attrs;
    if (!/referrerpolicy=/i.test(next)) {
      next += ' referrerpolicy="no-referrer"';
    }
    if (!/\balt=/i.test(next)) {
      next += ' alt=""';
    }
    return `<img${next}>`;
  });

  return out;
}

/** First <img src> in HTML — fallback cover when WP featured media is missing. */
export function firstImageSrc(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match?.[1]) return null;
  const src = match[1];
  if (src.startsWith("/wp-content/")) return `${WP_ORIGIN}${src}`;
  return src;
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8222;/g, "„")
    .replace(/&#8221;/g, "”")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
