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

Gallery photos live in `public/images/gallery/`. Hero background: `public/images/hero/home-bg.jpg`.

## Firebase deploy (App Hosting)

This Next.js app needs **Firebase App Hosting** (SSR + `/api/quote`), which requires the **Blaze** plan.

1. Upgrade: https://console.firebase.google.com/project/hekomimoto/usage/details
2. In Firebase console → **App Hosting** → create a backend linked to GitHub repo `pawelwlo/hekomimoto` (branch `main`)
3. Optional Resend secrets:
   ```bash
   firebase apphosting:secrets:set RESEND_API_KEY --project hekomimoto
   firebase apphosting:secrets:set RESEND_FROM --project hekomimoto
   ```
   Then wire them in `apphosting.yaml`.
4. Push to `main` to roll out (or trigger a rollout in the console).

Firebase Analytics is initialized client-side via `FirebaseAnalytics`.
