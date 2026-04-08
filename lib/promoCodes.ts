export interface PromoCode {
  merchantKeyword: string;                        // lowercase substring to match merchant input
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
    merchantKeyword: "nike",
    code: "SAVE10",
    discountType: "percent",
    value: 10,
    minSpend: 50,
    confidence: "high",
    explanation: "10% off your order",
  },
  {
    merchantKeyword: "sephora",
    code: "FREESHIP",
    discountType: "shipping",
    value: 0,
    minSpend: 0,
    confidence: "medium",
    explanation: "Free shipping on your order",
  },
  {
    merchantKeyword: "target",
    code: "TARGET5",
    discountType: "percent",
    value: 5,
    minSpend: 25,
    confidence: "medium",
    explanation: "5% off with Target Circle",
  },
];

export function getPromoCodes(merchant: string): PromoCode[] {
  const lower = merchant.toLowerCase();
  return PROMO_CODES.filter((p) => lower.includes(p.merchantKeyword));
}
