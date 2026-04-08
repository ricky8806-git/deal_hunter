export interface PromoCode {
  merchantId: string;                             // canonical merchant id from merchants.ts
  code: string;
  discountType: "percent" | "fixed" | "shipping";
  value: number;                                  // percent or dollar amount (0 for shipping)
  minSpend: number;                               // minimum subtotal required (0 = no minimum)
  confidence: "high" | "medium" | "low";
  explanation: string;
}

// TODO: Replace with real promo code API (e.g. Capital One Shopping, Honey/PayPal)
export const PROMO_CODES: PromoCode[] = [
  {
    merchantId: "nike",
    code: "SAVE10",
    discountType: "percent",
    value: 10,
    minSpend: 50,
    confidence: "high",
    explanation: "10% off your order",
  },
  {
    merchantId: "sephora",
    code: "FREESHIP",
    discountType: "shipping",
    value: 0,
    minSpend: 0,
    confidence: "medium",
    explanation: "Free shipping on your order",
  },
  {
    merchantId: "target",
    code: "TARGET5",
    discountType: "percent",
    value: 5,
    minSpend: 25,
    confidence: "medium",
    explanation: "5% off with Target Circle",
  },
];

export function getPromoCodes(merchantId: string | null): PromoCode[] {
  if (!merchantId) return [];
  return PROMO_CODES.filter((p) => p.merchantId === merchantId);
}
