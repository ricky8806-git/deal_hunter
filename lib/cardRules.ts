import type { Category } from "./merchantCategories";

export interface CardRule {
  issuer: string;                               // lowercase keyword to match against user input
  name: string;                                 // lowercase keywords to match against user input
  rewardType: "cashback" | "points";
  baseEarnRate: number;                         // fraction of spend earned (0.01 = 1%)
  categoryRates: Partial<Record<Category, number>>;
  pointToCashValue: number;                     // conservative dollars-per-point (0.01 = 1¢)
  label: string;                                // display name
}

// TODO: Replace with real card data API or user-linked card account
export const CARD_RULES: CardRule[] = [
  {
    issuer: "chase",
    name: "sapphire preferred",
    rewardType: "points",
    baseEarnRate: 0.01,
    categoryRates: { dining: 0.03, travel: 0.02 },
    pointToCashValue: 0.01,
    label: "Chase Sapphire Preferred",
  },
  {
    issuer: "capital one",
    name: "venture x",
    rewardType: "points",
    baseEarnRate: 0.02,
    categoryRates: { travel: 0.05 },
    pointToCashValue: 0.01,
    label: "Capital One Venture X",
  },
  {
    issuer: "amex",
    name: "gold",
    rewardType: "points",
    baseEarnRate: 0.01,
    categoryRates: { dining: 0.04, retail: 0.02 },
    pointToCashValue: 0.01,
    label: "AMEX Gold",
  },
];

/**
 * Matches a user-entered card (issuer + name) against known card rules.
 * Matching is loose: issuer keyword must appear in user input AND
 * at least one significant name keyword (>3 chars) must match.
 * Returns null if the card is not in the known rules dataset.
 */
export function findCardRule(issuer: string, name: string): CardRule | null {
  const combined = `${issuer} ${name}`.toLowerCase();
  for (const rule of CARD_RULES) {
    const issuerMatch = combined.includes(rule.issuer);
    const nameKeywords = rule.name.split(" ").filter((w) => w.length > 3);
    const nameMatch = nameKeywords.some((w) => combined.includes(w));
    if (issuerMatch && nameMatch) return rule;
  }
  return null;
}
