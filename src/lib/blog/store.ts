import { randomUUID } from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { sanitizeBlogHtml, slugify, stripHtml } from "@/lib/blog/sanitize";
import type { BlogPost, BlogPostInput, BlogPostStatus } from "@/lib/blog/types";

const POSTS = "blogPosts";

function nowIso() {
  return new Date().toISOString();
}

function asPost(id: string, data: Record<string, unknown>): BlogPost {
  return {
    id,
    slug: String(data.slug ?? ""),
    title: String(data.title ?? ""),
    excerpt: String(data.excerpt ?? ""),
    contentHtml: String(data.contentHtml ?? ""),
    coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : null,
    status: (data.status as BlogPostStatus) === "draft" ? "draft" : "published",
    publishedAt: data.publishedAt ? String(data.publishedAt) : null,
    createdAt: String(data.createdAt ?? nowIso()),
    updatedAt: String(data.updatedAt ?? nowIso()),
    wpId: typeof data.wpId === "number" ? data.wpId : null,
  };
}

async function assertUniqueSlug(slug: string, excludeId?: string) {
  const db = getAdminDb();
  const snap = await db.collection(POSTS).where("slug", "==", slug).limit(5).get();
  const conflict = snap.docs.find((doc) => doc.id !== excludeId);
  if (conflict) throw new Error("Slug already exists");
}

export async function listBlogPosts(options?: {
  status?: BlogPostStatus | "all";
}) {
  const db = getAdminDb();
  const status = options?.status ?? "published";
  const snap =
    status === "all"
      ? await db.collection(POSTS).get()
      : await db.collection(POSTS).where("status", "==", status).get();
  return snap.docs
    .map((doc) => asPost(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => {
      const aTime = a.publishedAt || a.createdAt;
      const bTime = b.publishedAt || b.createdAt;
      return bTime.localeCompare(aTime);
    });
}

export async function getBlogPostBySlug(slug: string) {
  const db = getAdminDb();
  const snap = await db.collection(POSTS).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return asPost(doc.id, doc.data() as Record<string, unknown>);
}

export async function getBlogPostById(id: string) {
  const db = getAdminDb();
  const snap = await db.collection(POSTS).doc(id).get();
  if (!snap.exists) return null;
  return asPost(snap.id, snap.data() as Record<string, unknown>);
}

export async function getBlogPostByWpId(wpId: number) {
  const db = getAdminDb();
  const snap = await db.collection(POSTS).where("wpId", "==", wpId).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return asPost(doc.id, doc.data() as Record<string, unknown>);
}

export async function createBlogPost(input: BlogPostInput & { wpId?: number | null }) {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");

  const slug = slugify(input.slug?.trim() || title);
  if (!slug) throw new Error("Invalid slug");
  await assertUniqueSlug(slug);

  const now = nowIso();
  const status: BlogPostStatus = input.status === "draft" ? "draft" : "published";
  const contentHtml = sanitizeBlogHtml(input.contentHtml ?? "");
  const excerpt =
    input.excerpt?.trim() ||
    stripHtml(contentHtml).slice(0, 220) ||
    "";

  const post: BlogPost = {
    id: randomUUID(),
    slug,
    title,
    excerpt,
    contentHtml,
    coverImageUrl: input.coverImageUrl?.trim() || null,
    status,
    publishedAt:
      status === "published"
        ? input.publishedAt || now
        : input.publishedAt ?? null,
    createdAt: now,
    updatedAt: now,
    wpId: input.wpId ?? null,
  };

  const db = getAdminDb();
  await db.collection(POSTS).doc(post.id).set(post);
  return post;
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  const existing = await getBlogPostById(id);
  if (!existing) throw new Error("Post not found");

  const title = input.title?.trim() || existing.title;
  const slug = slugify(input.slug?.trim() || existing.slug || title);
  if (!slug) throw new Error("Invalid slug");
  if (slug !== existing.slug) await assertUniqueSlug(slug, id);

  const status: BlogPostStatus =
    input.status === "draft"
      ? "draft"
      : input.status === "published"
        ? "published"
        : existing.status;

  const contentHtml =
    input.contentHtml !== undefined
      ? sanitizeBlogHtml(input.contentHtml)
      : existing.contentHtml;
  const excerpt =
    input.excerpt !== undefined
      ? input.excerpt.trim()
      : existing.excerpt || stripHtml(contentHtml).slice(0, 220);

  const now = nowIso();
  const publishedAt =
    status === "published"
      ? input.publishedAt || existing.publishedAt || now
      : existing.publishedAt;

  const updated: BlogPost = {
    ...existing,
    title,
    slug,
    excerpt,
    contentHtml,
    coverImageUrl:
      input.coverImageUrl !== undefined
        ? input.coverImageUrl?.trim() || null
        : existing.coverImageUrl,
    status,
    publishedAt,
    updatedAt: now,
  };

  const db = getAdminDb();
  await db.collection(POSTS).doc(id).set(updated);
  return updated;
}

export async function deleteBlogPost(id: string) {
  const db = getAdminDb();
  const ref = db.collection(POSTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Post not found");
  await ref.delete();
}

export async function upsertImportedPost(input: {
  wpId: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string | null;
  publishedAt: string;
}) {
  const existing = await getBlogPostByWpId(input.wpId);
  if (existing) {
    return updateBlogPost(existing.id, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      contentHtml: input.contentHtml,
      coverImageUrl: input.coverImageUrl,
      status: "published",
      publishedAt: input.publishedAt,
    });
  }

  // Prefer WP slug; if taken, append wp id.
  let slug = slugify(input.slug);
  try {
    await assertUniqueSlug(slug);
  } catch {
    slug = slugify(`${input.slug}-${input.wpId}`);
  }

  return createBlogPost({
    title: input.title,
    slug,
    excerpt: input.excerpt,
    contentHtml: input.contentHtml,
    coverImageUrl: input.coverImageUrl,
    status: "published",
    publishedAt: input.publishedAt,
    wpId: input.wpId,
  });
}
