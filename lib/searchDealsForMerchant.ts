import type { LiveDeal } from "./dealProviders";

export async function fetchLiveDeals(
  merchant: string,
  subtotal: number
): Promise<LiveDeal[]> {
  try {
    const params = new URLSearchParams({ merchant, subtotal: String(subtotal) });
    const res = await fetch(`/api/deals?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
