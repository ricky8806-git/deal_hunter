import type { CardRule } from "./cardRules";
import type { Category } from "./merchantCategories";

/**
 * Calls the server-side /api/card-lookup route to estimate rewards for an unknown card.
 * Returns a CardRule-shaped object with "(online estimate)" in the label, or null on failure.
 */
export async function fetchFallbackCardRule(
  issuer: string,
  cardName: string
): Promise<CardRule | null> {
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

    return {
      issuer: (data.issuer ?? issuer).toLowerCase(),
      name: (data.matchedCardName ?? cardName).toLowerCase(),
      rewardType: data.rewardType === "cashback" ? "cashback" : "points",
      baseEarnRate,
      categoryRates,
      pointToCashValue,
      label: `${data.matchedCardName ?? cardName} (online estimate — low confidence)`,
    };
  } catch {
    return null;
  }
}
