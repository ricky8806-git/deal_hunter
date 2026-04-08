# DealPilot — Best Deal Before Checkout

A single-page Next.js app that recommends the best credit card, promo codes, and merchant offers before you check out.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
# or on a different port:
npm run dev -- --port 3001
```

## Deploy to Vercel

1. Push this repo to GitHub (already done at `https://github.com/ricky8806-git/deal_hunter`)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Leave all settings as defaults — Vercel detects Next.js automatically
4. Click **Deploy**

No environment variables required. No build config changes needed.

## What's intentionally local / mocked

- Card rules (reward rates, categories) — hardcoded in `lib/cardRules.ts`
- Promo codes — hardcoded in `lib/promoCodes.ts`
- Merchant offers — hardcoded in `lib/merchantOffers.ts`
- Merchant registry — hardcoded in `lib/merchants.ts`
- No backend, no auth, no database — all state is in-memory React state
