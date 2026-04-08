export interface MerchantOffer {
  issuer: string;                               // lowercase keyword to match card issuer
  merchantKeyword: string;                      // lowercase substring to match merchant input
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
    merchantKeyword: "nike",
    description: "Possible $20 back on $100+ at Nike",
    offerType: "statement_credit",
    value: 20,
    minSpend: 100,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "chase",
    merchantKeyword: "starbucks",
    description: "Possible 10% back at Starbucks",
    offerType: "statement_credit",
    value: 10,
    minSpend: 0,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "chase",
    merchantKeyword: "marriott",
    description: "Possible $40 back on $200+ at Marriott",
    offerType: "statement_credit",
    value: 40,
    minSpend: 200,
    requiresActivation: true,
    confirmedForUser: false,
  },
  {
    issuer: "amex",
    merchantKeyword: "amazon",
    description: "Possible $15 back on $75+ at Amazon",
    offerType: "statement_credit",
    value: 15,
    minSpend: 75,
    requiresActivation: true,
    confirmedForUser: false,
  },
];

export function getMerchantOffers(issuer: string, merchant: string): MerchantOffer[] {
  const li = issuer.toLowerCase();
  const lm = merchant.toLowerCase();
  return MERCHANT_OFFERS.filter(
    (o) =>
      (li.includes(o.issuer) || o.issuer.includes(li)) &&
      lm.includes(o.merchantKeyword)
  );
}
