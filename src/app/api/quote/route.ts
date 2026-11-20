import { NextResponse } from "next/server";
import { MailerConfigError, sendQuoteEmails } from "@/lib/mailer";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const locale = String(form.get("locale") ?? "pl").trim();
    const messageOnly =
      form.get("messageOnly") === "true" || form.get("messageOnly") === "on";

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone and email are required." },
        { status: 400 },
      );
    }

    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length < 1 && !messageOnly) {
      return NextResponse.json(
        { error: "At least one damage photo is required." },
        { status: 400 },
      );
    }

    if (files.length < 1 && messageOnly && !message) {
      return NextResponse.json(
        { error: "A message is required when no photos are attached." },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} images allowed.` },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed." },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Each image must be 5 MB or smaller." },
          { status: 400 },
        );
      }
    }

    await sendQuoteEmails({ name, phone, email, message, locale, files });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MailerConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Quote API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error." },
      { status: 502 },
    );
  }
}
