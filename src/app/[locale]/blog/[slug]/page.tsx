import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CTASection } from "@/components/shared/CTASection";
import { getBlogPostBySlug, listBlogPosts } from "@/lib/blog/store";
import { prepareBlogHtml } from "@/lib/blog/sanitize";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateStaticParams() {
  try {
    const posts = await listBlogPosts({ status: "published" });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") {
    const t = await getTranslations({ locale, namespace: "meta.blog" });
    return buildPageMetadata({
      locale: locale as Locale,
      path: `/blog/${slug}`,
      meta: { title: t("title"), description: t("description") },
    });
  }
  return buildPageMetadata({
    locale: locale as Locale,
    path: `/blog/${post.slug}`,
    meta: {
      title: `${post.title} | Hekomimoto`,
      description: post.excerpt || post.title,
    },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blogPage");
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const dateLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <>
      <article className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Link
            href="/blog"
            className="text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            ← {t("back")}
          </Link>
          {dateLabel ? (
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              {dateLabel}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
          ) : null}
          {post.coverImageUrl ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full object-cover"
              />
            </div>
          ) : null}
          <div
            className="blog-content mt-10"
            dangerouslySetInnerHTML={{
              __html: prepareBlogHtml(post.contentHtml),
            }}
          />
        </div>
      </article>
      <CTASection />
    </>
  );
}
