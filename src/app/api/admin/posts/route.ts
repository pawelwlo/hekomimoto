import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createBlogPost,
  deleteBlogPost,
  listBlogPosts,
  updateBlogPost,
} from "@/lib/blog/store";
import { FirebaseAdminConfigError } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await listBlogPosts({ status: "all" });
    return NextResponse.json({ posts });
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[admin] list posts failed", error);
    return NextResponse.json(
      { error: "Failed to load posts." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    contentHtml?: string;
    coverImageUrl?: string | null;
    status?: "draft" | "published";
  } | null;

  try {
    const post = await createBlogPost({
      title: String(body?.title ?? ""),
      slug: body?.slug,
      excerpt: body?.excerpt,
      contentHtml: body?.contentHtml,
      coverImageUrl: body?.coverImageUrl,
      status: body?.status,
    });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    contentHtml?: string;
    coverImageUrl?: string | null;
    status?: "draft" | "published";
  } | null;

  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    const post = await updateBlogPost(id, {
      title: String(body?.title ?? ""),
      slug: body?.slug,
      excerpt: body?.excerpt,
      contentHtml: body?.contentHtml,
      coverImageUrl: body?.coverImageUrl,
      status: body?.status,
    });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    await deleteBlogPost(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
