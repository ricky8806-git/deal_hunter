export interface LiveDeal {
  merchantId: string | null;
  dealType: "coupon" | "sale";
  code: string | null;
  title: string;
  description: string;
  discountType: "percent" | "fixed" | "shipping" | "sale";
  value: number;        // percent or dollar amount; 0 if unknown
  minSpend: number;
  sourceName: string;
  sourceUrl: string;
  confidence: "high" | "medium" | "low";
  restrictions: string;
  expiryText: string | null;
  stackabilityNote: string | null;
  estimatedSavings: number; // pre-calculated from subtotal
}
