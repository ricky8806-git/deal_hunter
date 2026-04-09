import type { Card, Recommendation, SavingsPath } from "@/app/types";
import { normalizeMerchant } from "./merchants";
import { CARD_RULES, findCardRule } from "./cardRules";
import type { CardRule } from "./cardRules";
import { getPromoCodes } from "./promoCodes";
import { getMerchantOffers } from "./merchantOffers";
import type { MerchantOffer } from "./merchantOffers";

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
  return subtotal * earnRate;
}

function cardRateLabel(rule: CardRule, category: string): string {
  const earnRate = (rule.categoryRates as Record<string, number>)[category] ?? rule.baseEarnRate;
  return `${(earnRate * 100).toFixed(0)}% on ${category}`;
}

function offerSavings(o: MerchantOffer, subtotal: number): number {
  if (o.discountType === "fixed") return o.value;
  if (o.discountType === "percent") return subtotal * (o.value / 100);
  return 0;
}

export function getRecommendation(
  cards: Card[],
  merchant: string,
  subtotal: number,
  fallbackRules: Map<string, CardRule> = new Map(),
  failedLookups: string[] = []
): Recommendation {
  const { merchantId, displayName, category } = normalizeMerchant(merchant);

  // --- Best card ---
  let bestCard: BestCard | null = null;

  let fallbackUsed = false;

  for (const card of cards) {
    const rule = findCardRule(card.issuer, card.name) ?? fallbackRules.get(card.id) ?? null;
    if (!rule) continue;
    if (fallbackRules.has(card.id) && !findCardRule(card.issuer, card.name)) fallbackUsed = true;
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

  // Fallback: suggest best known card for category
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

  // --- Local promo codes ---
  const promoCodes = getPromoCodes(merchantId)
    .filter((p) => p.minSpend === 0 || subtotal >= p.minSpend)
    .map((p) => {
      let savings = 0;
      if (p.discountType === "percent") savings = subtotal * (p.value / 100);
      else if (p.discountType === "fixed") savings = p.value;
      return { code: p.code, explanation: p.explanation, savings, confidence: p.confidence };
    });

  const topPromo = promoCodes[0] ?? null;

  // --- Merchant offers ---
  const rawOffers = cards.flatMap((card) =>
    getMerchantOffers(card.issuer, merchantId).filter(
      (o) => o.minSpend === 0 || subtotal >= o.minSpend
    )
  );

  const merchantOffers = rawOffers.map((o) => ({
    description: o.description,
    disclaimer: "Not confirmed for your account — check your card app to activate",
    estimatedSavings: offerSavings(o, subtotal),
  }));

  const possibleExtraSavings = rawOffers.reduce(
    (sum, o) => sum + offerSavings(o, subtotal),
    0
  );

  // --- Build savings paths ---
  const topSavingsPaths: SavingsPath[] = [];

  // Path 1: Card only (guaranteed)
  topSavingsPaths.push({
    label: bestCard.label,
    confidence: "high",
    guaranteedSavings: bestCard.savings,
    likelySavings: 0,
    possibleSavings: possibleExtraSavings,
    stackabilityNote:
      merchantOffers.length > 0
        ? "Merchant offer requires activation — not confirmed for your account"
        : null,
    explanations: [
      `${bestCard.rate} on ${fmt(subtotal)} → ~${fmt(bestCard.savings)} back`,
      ...(bestCard.conversionNote ? [bestCard.conversionNote] : []),
    ],
  });

  // Path 2: Top promo + card (if a promo exists)
  if (topPromo) {
    topSavingsPaths.push({
      label: `${topPromo.code} + ${bestCard.label}`,
      confidence: topPromo.confidence,
      guaranteedSavings: bestCard.savings,
      likelySavings: topPromo.savings,
      possibleSavings: possibleExtraSavings,
      stackabilityNote: "Promo and card rewards typically stack — verify before checkout",
      explanations: [
        `${topPromo.code}: ${topPromo.explanation}${topPromo.savings > 0 ? ` → ~${fmt(topPromo.savings)} off` : ""}`,
        `${bestCard.rate} → ~${fmt(bestCard.savings)} back`,
      ],
    });
  }

  // --- Tiered summary ---
  const bestGuaranteedSavings = bestCard.savings;
  const bestGuaranteedLabel = bestCard.label;

  const bestLikelySavings = topPromo
    ? bestCard.savings + topPromo.savings
    : bestCard.savings;
  const bestLikelyLabel = topPromo
    ? `${topPromo.code} + ${bestCard.label}`
    : bestCard.label;

  // --- Top-level explanations ---
  const explanations: string[] = [
    `Merchant category detected: ${category}`,
    `Best card earns ${bestCard.rate} → ~${fmt(bestCard.savings)} guaranteed back on ${fmt(subtotal)}`,
  ];
  if (topPromo) {
    explanations.push(
      `${topPromo.code} may add ~${fmt(topPromo.savings)} → ~${fmt(bestLikelySavings)} likely total`
    );
  }
  if (merchantOffers.length > 0) {
    explanations.push(
      `${merchantOffers.length} merchant offer(s) could add ~${fmt(possibleExtraSavings)} — requires activation`
    );
  }
  for (const label of failedLookups) {
    explanations.push(`${label}: online rewards lookup unavailable — card skipped`);
  }

  return {
    detectedMerchant: displayName,
    detectedCategory: category,
    bestGuaranteedSavings,
    bestGuaranteedLabel,
    bestLikelySavings,
    bestLikelyLabel,
    possibleExtraSavings,
    topSavingsPaths,
    bestCard: bestCard.label,
    rewardRate: bestCard.rate,
    rewardSavings: bestCard.savings,
    conversionNote: bestCard.conversionNote,
    promoCodes,
    merchantOffers,
    explanations,
    note: fallbackUsed
      ? "One or more cards was estimated via online lookup (low confidence) — rewards may not reflect your specific card variant. " +
        "Card rewards use conservative point valuations. Promo codes and merchant offers are not verified for your account."
      : "Card rewards are estimates using conservative point valuations. Promo codes and merchant offers are not verified for your account.",
  };
}
