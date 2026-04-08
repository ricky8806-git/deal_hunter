export interface MerchantOffer {
  issuer: string;                               // lowercase keyword to match card issuer
  merchantId: string;                           // canonical merchant id from merchants.ts
  description: string;
  offerType: "statement_credit" | "bonus_points";
  value: number;
  minSpend: number;
  requiresActivation: boolean;
  confirmedForUser: false;                      // always false — never guaranteed
}

// TODO: Replace with real card offer APIs (e.g. Amex Offers, Chase Offers, BofA Deals)
export const MERCHANT_OFFERS: MerchantOffer[] = [
  {
    issuer: "amex",
    merchantId: "nike",
    description: "Possible $20 back on $100+ at Nike",
    offerType: "statement_credit",
    value: 20,
    minSpend: 100,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "chase",
    merchantId: "starbucks",
    description: "Possible 10% back at Starbucks",
    offerType: "statement_credit",
    value: 10,
    minSpend: 0,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "chase",
    merchantId: "marriott",
    description: "Possible $40 back on $200+ at Marriott",
    offerType: "statement_credit",
    value: 40,
    minSpend: 200,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "amex",
    merchantId: "amazon",
    description: "Possible $15 back on $75+ at Amazon",
    offerType: "statement_credit",
    value: 15,
    minSpend: 75,
    requiresActivation: true,
    confirmedForUser: false,
  },
];

export function getMerchantOffers(issuer: string, merchantId: string | null): MerchantOffer[] {
  if (!merchantId) return [];
  const li = issuer.toLowerCase();
  return MERCHANT_OFFERS.filter(
    (o) => o.merchantId === merchantId && (li.includes(o.issuer) || o.issuer.includes(li))
  );
}
