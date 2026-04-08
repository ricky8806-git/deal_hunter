import { type NextRequest } from "next/server";
import type { LiveDeal } from "@/lib/dealProviders";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

const HIGH_CONFIDENCE_DOMAINS = new Set([
  "retailmenot.com",
  "coupons.com",
  "honey.com",
  "rakuten.com",
  "offers.com",
  "groupon.com",
  "dealspotr.com",
  "slickdeals.net",
]);

interface BraveResult {
  title: string;
  url: string;
  description?: string;
  age?: string;
}

interface BraveResponse {
  web?: { results?: BraveResult[] };
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function confidenceOf(domain: string): "high" | "medium" | "low" {
  if (HIGH_CONFIDENCE_DOMAINS.has(domain)) return "high";
  if (/coupon|deal|promo|sav/i.test(domain)) return "medium";
  return "low";
}

function extractCode(text: string): string | null {
  const re = /\b(?:code|coupon|promo)[:\s]+([A-Z0-9]{4,15})\b/i;
  const m = text.match(re);
  if (!m) return null;
  const c = m[1].toUpperCase();
  // Must look like a promo code: mixed alphanumeric OR fully uppercase (5+ chars)
  if (/[A-Z]/.test(c) && /[0-9]/.test(c)) return c;
  if (/^[A-Z]{5,12}$/.test(c)) return c;
  return null;
}

function extractDiscount(text: string): {
  discountType: "percent" | "fixed" | "shipping" | "sale";
  value: number;
} {
  const pct = text.match(/(\d+)\s*%\s*off/i);
  if (pct) return { discountType: "percent", value: parseInt(pct[1]) };
  const dollar = text.match(/\$\s*(\d+(?:\.\d+)?)\s*off/i);
  if (dollar) return { discountType: "fixed", value: parseFloat(dollar[1]) };
  if (/free\s*shipping/i.test(text)) return { discountType: "shipping", value: 0 };
  return { discountType: "sale", value: 0 };
}

function calcSavings(type: string, value: number, subtotal: number): number {
  if (type === "percent") return subtotal * (value / 100);
  if (type === "fixed") return Math.min(value, subtotal);
  if (type === "shipping") return 8; // conservative flat estimate
  return 0;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const merchant = searchParams.get("merchant") ?? "";
  const subtotal = parseFloat(searchParams.get("subtotal") ?? "0");

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey || !merchant.trim()) {
    return Response.json([]);
  }

  let results: BraveResult[] = [];
  try {
    const query = encodeURIComponent(`"${merchant}" coupon codes promo codes deals`);
    const res = await fetch(
      `${BRAVE_ENDPOINT}?q=${query}&count=6&search_lang=en&country=US`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      }
    );
    if (!res.ok) return Response.json([]);
    const data: BraveResponse = await res.json();
    results = data.web?.results ?? [];
  } catch {
    return Response.json([]);
  }

  const deals: LiveDeal[] = [];
  const seenCodes = new Set<string>();

  for (const r of results) {
    const combined = `${r.title} ${r.description ?? ""}`;
    const domain = domainOf(r.url);
    const { discountType, value } = extractDiscount(combined);
    const code = extractCode(combined);
    const confidence = confidenceOf(domain);

    // Skip results with no useful signal
    if (discountType === "sale" && !code && confidence === "low") continue;

    // Deduplicate by code
    if (code) {
      if (seenCodes.has(code)) continue;
      seenCodes.add(code);
    }

    deals.push({
      merchantId: null,
      dealType: code ? "coupon" : "sale",
      code,
      title: r.title.split("|")[0].split("-")[0].trim().substring(0, 80),
      description: (r.description ?? "").substring(0, 150),
      discountType,
      value,
      minSpend: 0,
      sourceName: domain,
      sourceUrl: r.url,
      confidence,
      restrictions: "",
      expiryText: r.age ?? null,
      stackabilityNote: "May stack with card rewards — not confirmed",
      estimatedSavings: calcSavings(discountType, value, subtotal),
    });

    if (deals.length >= 5) break;
  }

  // Sort: confidence first, then savings
  deals.sort((a, b) => {
    const cv: Record<string, number> = { high: 2, medium: 1, low: 0 };
    const cd = cv[b.confidence] - cv[a.confidence];
    return cd !== 0 ? cd : b.estimatedSavings - a.estimatedSavings;
  });

  return Response.json(deals.slice(0, 3));
}
