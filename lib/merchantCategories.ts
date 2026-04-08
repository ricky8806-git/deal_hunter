export type Category = "dining" | "travel" | "retail" | "general";

const KEYWORDS: [string, Category][] = [
  ["amazon", "retail"],
  ["nike", "retail"],
  ["sephora", "retail"],
  ["target", "retail"],
  ["walmart", "retail"],
  ["bestbuy", "retail"],
  ["starbucks", "dining"],
  ["ubereats", "dining"],
  ["doordash", "dining"],
  ["chipotle", "dining"],
  ["mcdonald", "dining"],
  ["delta", "travel"],
  ["united", "travel"],
  ["marriott", "travel"],
  ["hilton", "travel"],
  ["airbnb", "travel"],
  ["expedia", "travel"],
];

// TODO: Replace with a merchant classification API for broader coverage
export function getMerchantCategory(merchant: string): Category {
  const lower = merchant.toLowerCase();
  for (const [keyword, category] of KEYWORDS) {
    if (lower.includes(keyword)) return category;
  }
  return "general";
}
