export interface Card {
  id: string;        // generated with crypto.randomUUID()
  issuer: string;
  name: string;
}

export interface Purchase {
  merchant: string;
  subtotal: string;  // kept as string in form state; parsed to number on submit
}

export interface Recommendation {
  bestOverall: string;
  bestCard: string;
  promoCodes: string[];
  note: string;
}
