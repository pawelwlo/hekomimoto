# Hekomimoto

Premium bilingual (PL/EN) website for Hekomimoto — Paintless Dent Repair (PDR) and hail damage repair in Poznań.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- next-intl
- Framer Motion
- Lucide React
- Resend (quote form emails)

## Getting started

```bash
npm install
cp .env.example .env.local
# Add RESEND_API_KEY (and optional RESEND_FROM)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (Polish default) or [http://localhost:3000/en](http://localhost:3000/en).

## Contact (single source of truth)

Edit `src/content/site.ts` for phone, WhatsApp, email, address, and hours.

## Quote photos

The floating “Send photos” widget and contact form POST to `/api/quote`, which emails `kontakt@hekomimoto.com` via Resend with image attachments.

## Images

Placeholder Unsplash URLs are defined in `src/content/gallery.ts`. Replace with client photos under `public/images/` (see README there).
