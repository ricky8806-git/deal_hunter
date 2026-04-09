import type { CardRule } from "./cardRules";
import type { Category } from "./merchantCategories";

const CACHE_KEY = "card_cache_v1";

export interface CachedCard {
  rawInput: string;
  normalizedInput: string;
  matchedCardName: string;
  issuer: string;
  rewardType: "cashback" | "points";
  baseEarnRate: number;
  categoryEarnRates: Partial<Record<Category, number>>;
  pointToCashValue: number;
  source: "online";
  confidence: "low";
  lastFetchedAt: string;
  timesUsed: number;
  status: "ok" | "failed";
}

type CacheStore = Record<string, CachedCard>;

function entryKey(issuer: string, cardName: string): string {
  return `${issuer.trim().toLowerCase()}__${cardName.trim().toLowerCase()}`;
}

function readStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or SSR — silently ignore
  }
}

/** Returns a CardRule from cache, incrementing timesUsed, or null if not cached. */
export function getCachedCardRule(issuer: string, cardName: string): CardRule | null {
  if (typeof window === "undefined") return null;
  const store = readStore();
  const entry = store[entryKey(issuer, cardName)];
  if (!entry || entry.status !== "ok") return null;

  entry.timesUsed++;
  writeStore(store);

  return {
    issuer: entry.issuer,
    name: entry.matchedCardName.toLowerCase(),
    rewardType: entry.rewardType,
    baseEarnRate: entry.baseEarnRate,
    categoryRates: entry.categoryEarnRates,
    pointToCashValue: entry.pointToCashValue,
    label: `${entry.matchedCardName} (cached estimate — low confidence)`,
  };
}

/** Persists a successful online lookup result to the cache. */
export function storeCachedCard(
  issuer: string,
  cardName: string,
  matchedCardName: string,
  rule: CardRule
): void {
  if (typeof window === "undefined") return;
  const store = readStore();
  const key = entryKey(issuer, cardName);
  const existing = store[key];
  store[key] = {
    rawInput: `${issuer} ${cardName}`,
    normalizedInput: entryKey(issuer, cardName),
    matchedCardName,
    issuer: rule.issuer,
    rewardType: rule.rewardType,
    baseEarnRate: rule.baseEarnRate,
    categoryEarnRates: rule.categoryRates,
    pointToCashValue: rule.pointToCashValue,
    source: "online",
    confidence: "low",
    lastFetchedAt: new Date().toISOString(),
    timesUsed: existing?.timesUsed ?? 0,
    status: "ok",
  };
  writeStore(store);
}
