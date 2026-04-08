import type { Category } from "./merchantCategories";

export interface MerchantInfo {
  merchantId: string;
  displayName: string;
  category: Category;
  keywords: string[]; // lowercase substrings to match against cleaned input
}

export const MERCHANTS: MerchantInfo[] = [
  { merchantId: "amazon",    displayName: "Amazon",    category: "retail",  keywords: ["amazon"] },
  { merchantId: "nike",      displayName: "Nike",      category: "retail",  keywords: ["nike"] },
  { merchantId: "sephora",   displayName: "Sephora",   category: "retail",  keywords: ["sephora"] },
  { merchantId: "target",    displayName: "Target",    category: "retail",  keywords: ["target"] },
  { merchantId: "starbucks", displayName: "Starbucks", category: "dining",  keywords: ["starbucks"] },
  { merchantId: "ubereats",  displayName: "Uber Eats", category: "dining",  keywords: ["ubereats", "uber eats"] },
  { merchantId: "doordash",  displayName: "DoorDash",  category: "dining",  keywords: ["doordash"] },
  { merchantId: "delta",     displayName: "Delta",     category: "travel",  keywords: ["delta"] },
  { merchantId: "united",    displayName: "United",    category: "travel",  keywords: ["united"] },
  { merchantId: "marriott",  displayName: "Marriott",  category: "travel",  keywords: ["marriott"] },
];

/** Strip protocol + www, lowercase, trim */
function cleanInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "") // drop path
    .trim();
}

export interface NormalizedMerchant {
  merchantId: string | null; // null = unknown
  displayName: string;
  category: Category;
}

export function normalizeMerchant(raw: string): NormalizedMerchant {
  const cleaned = cleanInput(raw);

  for (const m of MERCHANTS) {
    for (const kw of m.keywords) {
      if (cleaned.includes(kw)) {
        return { merchantId: m.merchantId, displayName: m.displayName, category: m.category };
      }
    }
  }

  // Unknown merchant — use cleaned input as display, general category
  return { merchantId: null, displayName: raw.trim(), category: "general" };
}
