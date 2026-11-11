import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/content/site";

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

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 },
      );
    }

    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

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

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY is not configured. Add it to .env.local to enable quote emails.",
        },
        { status: 503 },
      );
    }

    const from =
      process.env.RESEND_FROM ?? "Hekomimoto <onboarding@resend.dev>";
    const resend = new Resend(apiKey);

    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name || "photo.jpg",
        content: Buffer.from(await file.arrayBuffer()),
      })),
    );

    const { error } = await resend.emails.send({
      from,
      to: [siteConfig.email],
      replyTo: email || undefined,
      subject: `[Wycena] ${name} · ${phone}`,
      text: [
        `Nowe zgłoszenie wyceny / New quote request`,
        ``,
        `Imię / Name: ${name}`,
        `Telefon / Phone: ${phone}`,
        `Email: ${email || "—"}`,
        `Język / Locale: ${locale}`,
        ``,
        `Wiadomość / Message:`,
        message || "—",
        ``,
        `Załączniki / Attachments: ${files.length}`,
      ].join("\n"),
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
