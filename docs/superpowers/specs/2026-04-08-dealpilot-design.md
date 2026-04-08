# DealPilot MVP — Design Spec

**Date:** 2026-04-08  
**Status:** Approved

---

## Overview

A single-page Next.js app that lets a user add their credit/debit cards, enter a merchant and cart subtotal, and receive a mocked "best deal" recommendation. No backend, no persistence, no authentication. The goal is a clickable UI skeleton that demonstrates the core flow: add cards → enter purchase → see recommendation.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules (built into Next.js, no extra dependency)
- **State:** React `useState` only — no context, no external store
- **Dependencies:** Minimal — only what `create-next-app` installs by default

---

## File Structure

```
app/
  layout.tsx                    # Root layout — sets metadata and global font
  page.tsx                      # Owns all app state, composes sections
  globals.css                   # CSS reset + CSS custom properties
  page.module.css               # Page-level layout styles

  components/
    Header.tsx                  # App name + subtitle
    Header.module.css
    CardManager.tsx             # Add/remove cards form + card list
    CardManager.module.css
    PurchaseChecker.tsx         # Merchant + subtotal inputs + "Check Best Deal" button
    PurchaseChecker.module.css
    RecommendationCard.tsx      # Displays mock recommendation result (or nothing)
    RecommendationCard.module.css

  types.ts                      # Shared TypeScript types

lib/
  mockRecommendation.ts         # Pure function: (merchant, subtotal) → Recommendation
                                # Future: replace with real API call here
```

---

## Shared Types (`app/types.ts`)

```ts
export interface Card {
  id: string;        // generated with crypto.randomUUID()
  issuer: string;
  name: string;
}

export interface Purchase {
  merchant: string;
  subtotal: string;  // kept as string in form state; parsed on submit
}

export interface Recommendation {
  bestOverall: string;
  bestCard: string;
  promoCodes: string[];
  note: string;
}
```

---

## State (all in `page.tsx`)

| State var | Type | Description |
|---|---|---|
| `cards` | `Card[]` | All user-added cards |
| `purchase` | `Purchase` | Current merchant + subtotal form values |
| `recommendation` | `Recommendation \| null` | Null until user clicks "Check Best Deal" |

### Handlers defined in `page.tsx`

- `handleAddCard(card: Omit<Card, 'id'>)` — appends a new card with a generated ID
- `handleRemoveCard(id: string)` — filters card out of list
- `handlePurchaseChange(field: keyof Purchase, value: string)` — updates purchase field
- `handleCheckDeal()` — validates merchant and subtotal (non-empty, subtotal parses to a positive number), then calls `getMockRecommendation()` and sets result

---

## Components

### `Header`
- Props: none
- Renders the app name "DealPilot" and subtitle "Find the best promo code and card to use before you buy."

### `CardManager`
- Props: `cards: Card[]`, `onAdd: (card: Omit<Card, 'id'>) => void`, `onRemove: (id: string) => void`
- Internal state: `issuer: string`, `name: string` (local form fields, cleared on submit)
- Validation: both fields must be non-empty before calling `onAdd`
- Renders: two text inputs, "Add Card" button, list of added cards each with a "Remove" button

### `PurchaseChecker`
- Props: `purchase: Purchase`, `onChange: (field: keyof Purchase, value: string) => void`, `onCheck: () => void`
- Renders: merchant input, subtotal input, "Check Best Deal" button
- Validation lives in `handleCheckDeal()` in `page.tsx`; this component just calls `onCheck`

### `RecommendationCard`
- Props: `recommendation: Recommendation | null`
- Renders nothing when `recommendation` is null
- When set, displays: best overall deal, best card, promo codes, and disclaimer note

---

## Mock Recommendation Logic (`lib/mockRecommendation.ts`)

Pure function — no side effects. Accepts merchant (string) and subtotal (number, already parsed by caller).

Returns hardcoded `Recommendation`:

```ts
{
  bestOverall: "Try SAVE10 + use Chase Sapphire Preferred",
  bestCard: "Venture X",
  promoCodes: ["SAVE10", "FREESHIP"],
  note: "Merchant-specific card offers are not confirmed in this version."
}
```

**Comment in file:** `// TODO: Replace with real promo code API + card rewards lookup`

---

## Validation Rules

| Field | Rule |
|---|---|
| Card issuer | Non-empty string |
| Card name | Non-empty string |
| Merchant | Non-empty string |
| Subtotal | Non-empty string that parses to a positive number (`parseFloat > 0`) |

Errors are shown inline near the relevant form. No toast libraries — simple `<p className={styles.error}>` elements.

---

## UI / Visual Design

- Clean white card-based layout, centered on the page, max-width ~700px
- Sections separated by visible card borders with subtle box-shadow
- Neutral color palette (white, light gray, one accent color for buttons)
- All done via CSS Modules — no Tailwind, no component library

---

## Explicit Out of Scope

- No scraping or external APIs
- No credit card rewards logic
- No persistence (localStorage, database)
- No authentication
- No browser extension
- No tests
- No CI/CD

---

## Future Integration Points

Comments in code mark where real logic would plug in:

- `lib/mockRecommendation.ts` — replace with real API call
- `CardManager.tsx` — replace local state with persisted card store (localStorage or DB)
- `page.tsx handleCheckDeal()` — pass real `cards` array into recommendation engine
