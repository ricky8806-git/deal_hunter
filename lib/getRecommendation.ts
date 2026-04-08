import type { Card, Recommendation } from "@/app/types";
import type { LiveDeal } from "./dealProviders";
import { normalizeMerchant } from "./merchants";
import { CARD_RULES, findCardRule } from "./cardRules";
import type { CardRule } from "./cardRules";
import { getPromoCodes } from "./promoCodes";
import { getMerchantOffers } from "./merchantOffers";

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

interface BestCard {
  label: string;
  savings: number;
  rate: string;
  conversionNote: string | null;
}

function cardSavings(rule: CardRule, category: string, subtotal: number): number {
  const earnRate = (rule.categoryRates as Record<string, number>)[category] ?? rule.baseEarnRate;
  return subtotal * earnRate * rule.pointToCashValue;
}

function cardRateLabel(rule: CardRule, category: string): string {
  const earnRate = (rule.categoryRates as Record<string, number>)[category] ?? rule.baseEarnRate;
  return `${(earnRate * 100).toFixed(0)}% on ${category}`;
}

export function getRecommendation(
  cards: Card[],
  merchant: string,
  subtotal: number,
  liveDeals: LiveDeal[] = []
): Recommendation {
  const { merchantId, displayName, category } = normalizeMerchant(merchant);

  // --- Find best card from user's saved cards ---
  let bestCard: BestCard | null = null;

  for (const card of cards) {
    const rule = findCardRule(card.issuer, card.name);
    if (!rule) continue;

    const savings = cardSavings(rule, category, subtotal);
    if (!bestCard || savings > bestCard.savings) {
      bestCard = {
        label: rule.label,
        savings,
        rate: cardRateLabel(rule, category),
        conversionNote:
          rule.rewardType === "points"
            ? `Points valued at ${(rule.pointToCashValue * 100).toFixed(0)}¢ each (conservative estimate)`
            : null,
      };
    }
  }

  // --- Fallback: suggest best known card for category ---
  if (!bestCard) {
    const fallback = CARD_RULES.reduce<{ rule: CardRule; savings: number } | null>(
      (best, rule) => {
        const s = cardSavings(rule, category, subtotal);
        return !best || s > best.savings ? { rule, savings: s } : best;
      },
      null
    );
    if (fallback) {
      bestCard = {
        label: `${fallback.rule.label} (suggested — not in your wallet)`,
        savings: fallback.savings,
        rate: cardRateLabel(fallback.rule, category),
        conversionNote: `Points valued at ${(fallback.rule.pointToCashValue * 100).toFixed(0)}¢ each (conservative estimate)`,
      };
    }
  }

  if (!bestCard) {
    bestCard = { label: "No card data available", savings: 0, rate: "N/A", conversionNote: null };
  }

  // --- Deal sources: live (preferred) or local fallback ---
  const hasLiveDeals = liveDeals.length > 0;

  // Local promo codes (only used when no live deals)
  const promoCodes = hasLiveDeals
    ? []
    : getPromoCodes(merchantId)
        .filter((p) => p.minSpend === 0 || subtotal >= p.minSpend)
        .map((p) => {
          let savings = 0;
          if (p.discountType === "percent") savings = subtotal * (p.value / 100);
          else if (p.discountType === "fixed") savings = p.value;
          return { code: p.code, explanation: p.explanation, savings, confidence: p.confidence };
        });

  // Top deal savings (from live deals or local promos)
  const topDealSavings = hasLiveDeals
    ? (liveDeals[0].estimatedSavings ?? 0)
    : promoCodes.reduce((sum, p) => sum + p.savings, 0);

  // --- Merchant-specific card offers ---
  const merchantOffers = cards.flatMap((card) =>
    getMerchantOffers(card.issuer, merchantId)
      .filter((o) => o.minSpend === 0 || subtotal >= o.minSpend)
      .map((o) => ({
        description: o.description,
        disclaimer: "Not confirmed for your account — check your card app to activate",
      }))
  );

  // --- Build bestOverall ---
  const topDealLabel = hasLiveDeals
    ? (liveDeals[0].code ?? liveDeals[0].title)
    : promoCodes.length > 0
    ? promoCodes[0].code
    : null;

  const bestOverall = topDealLabel
    ? `${topDealLabel} + ${bestCard.label}`
    : bestCard.label;

  const estimatedSavings = bestCard.savings + topDealSavings;

  // --- Explanations ---
  const explanations: string[] = [
    `Merchant category detected: ${category}`,
    `Best card earns ${bestCard.rate} → ~${fmt(bestCard.savings)} back on ${fmt(subtotal)}`,
  ];
  if (hasLiveDeals) {
    explanations.push(
      `${liveDeals.length} live deal(s) found — top deal ~${fmt(topDealSavings)} savings`
    );
  } else if (promoCodes.length > 0) {
    explanations.push(
      `${promoCodes.length} local promo code(s) — adds ~${fmt(topDealSavings)} in savings`
    );
  }
  if (merchantOffers.length > 0) {
    explanations.push(`${merchantOffers.length} possible merchant offer(s) to check`);
  }

  return {
    detectedMerchant: displayName,
    detectedCategory: category,
    bestOverall,
    estimatedSavings,
    bestCard: bestCard.label,
    rewardRate: bestCard.rate,
    rewardSavings: bestCard.savings,
    conversionNote: bestCard.conversionNote,
    promoCodes,
    liveDeals,
    merchantOffers,
    explanations,
    note: "Card reward estimates use conservative point valuations. Live deals parsed from search — verify before checkout.",
  };
}
