import type { CardRule } from "./cardRules";
import type { Category } from "./merchantCategories";
import { getCachedCardRule, storeCachedCard } from "./cardCache";

/**
 * Match order:
 *   1. Cache hit  → return cached CardRule (increments timesUsed)
 *   2. Cache miss → call /api/card-lookup, store result, return CardRule
 * Returns null if the online lookup also fails.
 */
export async function fetchFallbackCardRule(
  issuer: string,
  cardName: string
): Promise<CardRule | null> {
  // 1. Cache hit
  const cached = getCachedCardRule(issuer, cardName);
  if (cached) return cached;

  // 2. Online lookup
  try {
    const res = await fetch("/api/card-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issuer, cardName }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;

    const baseEarnRate = typeof data.baseEarnRate === "number" ? data.baseEarnRate : 0.01;
    const pointToCashValue =
      typeof data.pointToCashValue === "number" ? data.pointToCashValue : 0.01;
    const categoryRates: Partial<Record<Category, number>> = {};
    if (data.categoryEarnRates && typeof data.categoryEarnRates === "object") {
      for (const [k, v] of Object.entries(data.categoryEarnRates)) {
        if (typeof v === "number") {
          categoryRates[k as Category] = v;
        }
      }
    }

    const matchedCardName: string = data.matchedCardName ?? cardName;
    const rule: CardRule = {
      issuer: (data.issuer ?? issuer).toLowerCase(),
      name: matchedCardName.toLowerCase(),
      rewardType: data.rewardType === "cashback" ? "cashback" : "points",
      baseEarnRate,
      categoryRates,
      pointToCashValue,
      label: `${matchedCardName} (online estimate — low confidence)`,
    };

    storeCachedCard(issuer, cardName, matchedCardName, rule);
    return rule;
  } catch {
    return null;
  }
}
