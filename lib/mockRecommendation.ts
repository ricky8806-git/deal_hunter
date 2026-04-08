import type { Recommendation } from "@/app/types";

// Kept for reference only — superseded by getRecommendation.ts
export function getMockRecommendation(
  _merchant: string,
  _subtotal: number
): Recommendation {
  return {
    detectedMerchant: _merchant,
    detectedCategory: "general",
    bestOverall: "Try SAVE10 + use Chase Sapphire Preferred",
    estimatedSavings: 0,
    bestCard: "Venture X",
    rewardRate: "2% general",
    rewardSavings: 0,
    conversionNote: "Points valued at 1¢ each (conservative estimate)",
    promoCodes: [
      { code: "SAVE10", explanation: "10% off", savings: 0, confidence: "high" },
      { code: "FREESHIP", explanation: "Free shipping", savings: 0, confidence: "medium" },
    ],
    merchantOffers: [],
    explanations: ["Mock data only."],
    note: "This is mock data only.",
  };
}
