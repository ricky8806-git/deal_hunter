import type { Recommendation } from "@/app/types";

// Kept for reference only — superseded by getRecommendation.ts
export function getMockRecommendation(
  _merchant: string,
  _subtotal: number
): Recommendation {
  return {
    detectedMerchant: _merchant,
    detectedCategory: "general",
    bestGuaranteedSavings: 0,
    bestGuaranteedLabel: "Venture X",
    bestLikelySavings: 0,
    bestLikelyLabel: "SAVE10 + Venture X",
    possibleExtraSavings: 0,
    topSavingsPaths: [],
    bestCard: "Venture X",
    rewardRate: "2% general",
    rewardSavings: 0,
    conversionNote: "Points valued at 1¢ each (conservative estimate)",
    promoCodes: [
      { code: "SAVE10", explanation: "10% off", savings: 0, confidence: "high" },
    ],
    merchantOffers: [],
    explanations: ["Mock data only."],
    note: "This is mock data only.",
  };
}
