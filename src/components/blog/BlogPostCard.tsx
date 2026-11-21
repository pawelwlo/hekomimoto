import { Link } from "@/i18n/navigation";
import type { BlogPost } from "@/lib/blog/types";

function formatDate(value: string | null, locale: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value.slice(0, 10);
  }
}

export function BlogPostCard({
  post,
  locale,
  readMore,
}: {
  post: BlogPost;
  locale: string;
  readMore: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-accent/40">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.coverImageUrl ? (
          <div className="aspect-[16/10] overflow-hidden bg-surface-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-surface-elevated text-sm text-muted">
            Hekomimoto
          </div>
        )}
        <div className="p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            {formatDate(post.publishedAt, locale)}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold text-white md:text-2xl">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm text-muted md:text-base">
              {post.excerpt}
            </p>
          ) : null}
          <p className="mt-4 text-sm font-semibold text-accent">{readMore} →</p>
        </div>
      </Link>
    </article>
  );
}
