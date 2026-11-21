export type BlogPostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** WordPress post id when imported */
  wpId: number | null;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  coverImageUrl?: string | null;
  status?: BlogPostStatus;
  publishedAt?: string | null;
};
