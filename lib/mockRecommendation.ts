import { Recommendation } from "@/app/types";

// TODO: Replace with real promo code API + card rewards lookup.
// Accepts the user's card list once real logic is added.
export function getMockRecommendation(
  _merchant: string,
  _subtotal: number
): Recommendation {
  return {
    bestOverall: "Try SAVE10 + use Chase Sapphire Preferred",
    bestCard: "Venture X",
    promoCodes: ["SAVE10", "FREESHIP"],
    note: "Merchant-specific card offers are not confirmed in this version.",
  };
}
