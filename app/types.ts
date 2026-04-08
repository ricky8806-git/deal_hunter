import type { LiveDeal } from "@/lib/dealProviders";

export type { LiveDeal };

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
}

export interface Recommendation {
  detectedMerchant: string;
  detectedCategory: string;
  bestOverall: string;
  estimatedSavings: number;
  bestCard: string;
  rewardRate: string;
  rewardSavings: number;
  conversionNote: string | null;
  promoCodes: PromoResult[];    // local fallback; empty when liveDeals is populated
  liveDeals: LiveDeal[];        // live search results; empty without BRAVE_API_KEY
  merchantOffers: MerchantOfferResult[];
  explanations: string[];
  note: string;
}
