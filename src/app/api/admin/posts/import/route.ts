import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { FirebaseAdminConfigError } from "@/lib/firebase-admin";
import { importWpBlogPosts } from "@/lib/wordpress";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await importWpBlogPosts();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[admin] WP blog import failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Import from WordPress failed.",
      },
      { status: 500 },
    );
  }
}
