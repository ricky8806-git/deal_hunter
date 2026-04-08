import type { Card, Recommendation } from "@/app/types";
import { normalizeMerchant } from "./merchants";
import { CARD_RULES, findCardRule } from "./cardRules";
import type { CardRule } from "./cardRules";
import { getPromoCodes } from "./promoCodes";
import { getMerchantOffers } from "./merchantOffers";

// TODO: Replace internals with real API calls while keeping this function signature stable

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
  subtotal: number
): Recommendation {
  const { merchantId, displayName, category } = normalizeMerchant(merchant);

  // --- Find best card from user's saved cards ---
  let bestCard: BestCard | null = null;

  for (const card of cards) {
    const rule = findCardRule(card.issuer, card.name);
    if (!rule) continue; // card not in known rules — skip gracefully

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

  // --- Fallback: suggest best known card for category if none of user's cards matched ---
  if (!bestCard) {
    // TODO: Rank fallback suggestions by user demographics or opt-in card data
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

  // Shouldn't happen since CARD_RULES is non-empty, but satisfies TypeScript
  if (!bestCard) {
    bestCard = { label: "No card data available", savings: 0, rate: "N/A", conversionNote: null };
  }

  // --- Promo codes ---
  const rawPromos = getPromoCodes(merchantId);
  const promoCodes = rawPromos
    .filter((p) => p.minSpend === 0 || subtotal >= p.minSpend)
    .map((p) => {
      let savings = 0;
      if (p.discountType === "percent") savings = subtotal * (p.value / 100);
      else if (p.discountType === "fixed") savings = p.value;
      // shipping = no dollar estimate
      return { code: p.code, explanation: p.explanation, savings, confidence: p.confidence };
    });

  const promoSavings = promoCodes.reduce((sum, p) => sum + p.savings, 0);

  // --- Merchant-specific card offers for user's cards ---
  const merchantOffers = cards.flatMap((card) =>
    getMerchantOffers(card.issuer, merchantId)
      .filter((o) => o.minSpend === 0 || subtotal >= o.minSpend)
      .map((o) => ({
        description: o.description,
        disclaimer: "Not confirmed for your account — check your card app to activate",
      }))
  );

  // --- Build result ---
  const estimatedSavings = bestCard.savings + promoSavings;
  const bestOverall =
    promoCodes.length > 0
      ? `${promoCodes[0].code} + ${bestCard.label}`
      : bestCard.label;

  const explanations: string[] = [
    `Merchant category detected: ${category}`,
    `Best card earns ${bestCard.rate} → ~${fmt(bestCard.savings)} back on ${fmt(subtotal)}`,
  ];
  if (promoCodes.length > 0) {
    explanations.push(
      `${promoCodes.length} promo code(s) found — adds ~${fmt(promoSavings)} in savings`
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
    merchantOffers,
    explanations,
    note: "Card reward estimates use conservative point valuations. Merchant offers are not confirmed for your account.",
  };
}
