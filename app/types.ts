export interface Card {
  id: string;        // generated with crypto.randomUUID()
  issuer: string;
  name: string;
}

export interface Purchase {
  merchant: string;
  subtotal: string;  // kept as string in form state; parsed to number on submit
}

export interface PromoResult {
  code: string;
  explanation: string;
  savings: number;
  confidence: "high" | "medium" | "low";
}

export interface MerchantOfferResult {
  description: string;
  disclaimer: string;
  estimatedSavings: number;
}

export interface SavingsPath {
  label: string;
  confidence: "high" | "medium" | "low";
  guaranteedSavings: number;  // card rewards — certain
  likelySavings: number;      // promo code — likely but unverified
  possibleSavings: number;    // merchant offer — requires activation
  stackabilityNote: string | null;
  explanations: string[];
}

export interface Recommendation {
  detectedMerchant: string;
  detectedCategory: string;
  // Tiered savings summary
  bestGuaranteedSavings: number;
  bestGuaranteedLabel: string;
  bestLikelySavings: number;
  bestLikelyLabel: string;
  possibleExtraSavings: number;
  // Ranked paths (top 2–3)
  topSavingsPaths: SavingsPath[];
  // Card detail
  bestCard: string;
  rewardRate: string;
  rewardSavings: number;
  conversionNote: string | null;
  // Local deals
  promoCodes: PromoResult[];
  merchantOffers: MerchantOfferResult[];
  explanations: string[];
  note: string;
}
