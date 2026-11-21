import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { listBlogPosts } from "@/lib/blog/store";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.blog" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/blog",
    meta: { title: t("title"), description: t("description") },
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blogPage");
  let posts: Awaited<ReturnType<typeof listBlogPosts>> = [];
  try {
    posts = await listBlogPosts({ status: "published" });
  } catch (error) {
    console.error("[blog] list failed", error);
  }

  return (
    <>
      <section className="border-b border-white/5 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading title={t("title")} subtitle={t("subtitle")} />
          {posts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  readMore={t("readMore")}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">{t("empty")}</p>
          )}
        </div>
      </section>
      <CTASection />
    </>
  );
}
