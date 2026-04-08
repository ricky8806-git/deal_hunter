# DealPilot MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app where a user can add cards, enter a purchase, and see a mocked best-deal recommendation.

**Architecture:** All state lives in `app/page.tsx` and flows down to four presentational components via props. A pure function in `lib/mockRecommendation.ts` generates the mock result. CSS Modules provide scoped styles for each component.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, React `useState` only.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/types.ts` | Shared TypeScript interfaces |
| Create | `lib/mockRecommendation.ts` | Pure mock recommendation function |
| Modify | `app/layout.tsx` | Metadata and root layout |
| Modify | `app/globals.css` | CSS reset + custom properties |
| Create | `app/page.module.css` | Page-level layout |
| Modify | `app/page.tsx` | All state + handler logic, composes sections |
| Create | `app/components/Header.tsx` | App name + subtitle |
| Create | `app/components/Header.module.css` | Header styles |
| Create | `app/components/CardManager.tsx` | Add/remove cards form + list |
| Create | `app/components/CardManager.module.css` | CardManager styles |
| Create | `app/components/PurchaseChecker.tsx` | Merchant + subtotal inputs |
| Create | `app/components/PurchaseChecker.module.css` | PurchaseChecker styles |
| Create | `app/components/RecommendationCard.tsx` | Mock result display |
| Create | `app/components/RecommendationCard.module.css` | RecommendationCard styles |

---

## Task 1: Scaffold Next.js project

**Files:**
- Creates: all Next.js boilerplate in project root

- [ ] **Step 1: Run create-next-app in the project directory**

Working directory: `C:\Users\ricky\OneDrive\Documents\My_Deal_Hunter`

```bash
npx create-next-app@latest . --typescript --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*"
```

If prompted interactively, choose: TypeScript ✓, App Router ✓, no Tailwind, no ESLint, no `src/` directory, import alias `@/*`.

- [ ] **Step 2: Verify it runs**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000`, default Next.js page loads. Stop the server (`Ctrl+C`).

- [ ] **Step 3: Commit scaffold**

```bash
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

## Task 2: Add shared types

**Files:**
- Create: `app/types.ts`

- [ ] **Step 1: Create `app/types.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add app/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Create mock recommendation function

**Files:**
- Create: `lib/mockRecommendation.ts`

- [ ] **Step 1: Create `lib/mockRecommendation.ts`**

```ts
import { Recommendation } from "@/app/types";

// TODO: Replace with real promo code API + card rewards lookup.
// Accepts the user's card list once real logic is added.
export function getMockRecommendation(
  _merchant: string,
  _subtotal: number
): Recommendation {
  return {
    bestOverall: "Try SAVE10 + use Chase Sapphire Preferred",
    bestCard: "Venture X",
    promoCodes: ["SAVE10", "FREESHIP"],
    note: "Merchant-specific card offers are not confirmed in this version.",
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/mockRecommendation.ts
git commit -m "feat: add mock recommendation function"
```

---

## Task 4: Update layout, globals, and page scaffold

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `app/page.module.css`
- Modify: `app/page.tsx` (placeholder only — wired up fully in Task 8)

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealPilot",
  description: "Find the best promo code and card to use before you buy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-border: #e0e0e0;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-danger: #dc2626;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-error: #dc2626;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

- [ ] **Step 3: Create `app/page.module.css`**

```css
.main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

- [ ] **Step 4: Replace `app/page.tsx` with a placeholder**

```tsx
export default function Home() {
  return <main>Loading…</main>;
}
```

- [ ] **Step 5: Verify dev server still starts**

```bash
npm run dev
```

Expected: page loads without errors. Stop server.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.module.css app/page.tsx
git commit -m "feat: update layout, globals, and page scaffold"
```

---

## Task 5: Build Header component

**Files:**
- Create: `app/components/Header.tsx`
- Create: `app/components/Header.module.css`

- [ ] **Step 1: Create `app/components/Header.tsx`**

```tsx
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>DealPilot</h1>
      <p className={styles.subtitle}>
        Find the best promo code and card to use before you buy.
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Create `app/components/Header.module.css`**

```css
.header {
  padding: 1rem 0 0.25rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.subtitle {
  margin-top: 0.375rem;
  color: var(--color-text-muted);
  font-size: 1rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Header.tsx app/components/Header.module.css
git commit -m "feat: add Header component"
```

---

## Task 6: Build CardManager component

**Files:**
- Create: `app/components/CardManager.tsx`
- Create: `app/components/CardManager.module.css`

- [ ] **Step 1: Create `app/components/CardManager.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Card } from "@/app/types";
import styles from "./CardManager.module.css";

interface Props {
  cards: Card[];
  onAdd: (card: Omit<Card, "id">) => void;
  onRemove: (id: string) => void;
}

export default function CardManager({ cards, onAdd, onRemove }: Props) {
  const [issuer, setIssuer] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!issuer.trim() || !name.trim()) {
      setError("Both card issuer and card name are required.");
      return;
    }
    setError("");
    onAdd({ issuer: issuer.trim(), name: name.trim() });
    setIssuer("");
    setName("");
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>My Cards</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="issuer">
              Card Issuer
            </label>
            <input
              id="issuer"
              className={styles.input}
              type="text"
              placeholder="e.g. Chase"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cardName">
              Card Name
            </label>
            <input
              id="cardName"
              className={styles.input}
              type="text"
              placeholder="e.g. Sapphire Preferred"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          Add Card
        </button>
      </form>

      {cards.length > 0 && (
        <ul className={styles.list}>
          {cards.map((card) => (
            <li key={card.id} className={styles.listItem}>
              <span>
                <strong>{card.issuer}</strong> — {card.name}
              </span>
              <button
                className={styles.removeButton}
                onClick={() => onRemove(card.id)}
                aria-label={`Remove ${card.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Create `app/components/CardManager.module.css`**

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.heading {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .fields {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--color-accent);
}

.error {
  font-size: 0.875rem;
  color: var(--color-error);
}

.button {
  align-self: flex-start;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.button:hover {
  background: var(--color-accent-hover);
}

.list {
  list-style: none;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.listItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
}

.removeButton {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  color: var(--color-danger);
  cursor: pointer;
  transition: background 0.15s;
}

.removeButton:hover {
  background: #fef2f2;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/CardManager.tsx app/components/CardManager.module.css
git commit -m "feat: add CardManager component"
```

---

## Task 7: Build PurchaseChecker component

**Files:**
- Create: `app/components/PurchaseChecker.tsx`
- Create: `app/components/PurchaseChecker.module.css`

- [ ] **Step 1: Create `app/components/PurchaseChecker.tsx`**

```tsx
import type { Purchase } from "@/app/types";
import styles from "./PurchaseChecker.module.css";

interface Props {
  purchase: Purchase;
  onChange: (field: keyof Purchase, value: string) => void;
  onCheck: () => void;
  error: string;
}

export default function PurchaseChecker({
  purchase,
  onChange,
  onCheck,
  error,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCheck();
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Check a Purchase</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="merchant">
              Merchant Name or URL
            </label>
            <input
              id="merchant"
              className={styles.input}
              type="text"
              placeholder="e.g. Amazon or amazon.com"
              value={purchase.merchant}
              onChange={(e) => onChange("merchant", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="subtotal">
              Cart Subtotal ($)
            </label>
            <input
              id="subtotal"
              className={styles.input}
              type="text"
              placeholder="e.g. 89.99"
              value={purchase.subtotal}
              onChange={(e) => onChange("subtotal", e.target.value)}
            />
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          Check Best Deal
        </button>
      </form>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/components/PurchaseChecker.module.css`**

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.heading {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .fields {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--color-accent);
}

.error {
  font-size: 0.875rem;
  color: var(--color-error);
}

.button {
  align-self: flex-start;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.button:hover {
  background: var(--color-accent-hover);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/PurchaseChecker.tsx app/components/PurchaseChecker.module.css
git commit -m "feat: add PurchaseChecker component"
```

---

## Task 8: Build RecommendationCard component

**Files:**
- Create: `app/components/RecommendationCard.tsx`
- Create: `app/components/RecommendationCard.module.css`

- [ ] **Step 1: Create `app/components/RecommendationCard.tsx`**

```tsx
import type { Recommendation } from "@/app/types";
import styles from "./RecommendationCard.module.css";

interface Props {
  recommendation: Recommendation | null;
}

export default function RecommendationCard({ recommendation }: Props) {
  if (!recommendation) return null;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Recommendation</h2>
      <div className={styles.result}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Best overall</span>
          <span className={styles.rowValue}>{recommendation.bestOverall}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Best guaranteed card</span>
          <span className={styles.rowValue}>{recommendation.bestCard}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Promo codes to try</span>
          <span className={styles.rowValue}>
            {recommendation.promoCodes.join(", ")}
          </span>
        </div>
      </div>
      <p className={styles.note}>{recommendation.note}</p>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/components/RecommendationCard.module.css`**

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.heading {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.rowLabel {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rowValue {
  font-size: 0.9375rem;
  color: var(--color-text);
}

.note {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
  font-style: italic;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/RecommendationCard.tsx app/components/RecommendationCard.module.css
git commit -m "feat: add RecommendationCard component"
```

---

## Task 9: Wire up page.tsx with all state and handlers

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the full implementation**

```tsx
"use client";

import { useState } from "react";
import type { Card, Purchase, Recommendation } from "@/app/types";
import { getMockRecommendation } from "@/lib/mockRecommendation";
import Header from "@/app/components/Header";
import CardManager from "@/app/components/CardManager";
import PurchaseChecker from "@/app/components/PurchaseChecker";
import RecommendationCard from "@/app/components/RecommendationCard";
import styles from "./page.module.css";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [purchase, setPurchase] = useState<Purchase>({
    merchant: "",
    subtotal: "",
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [checkError, setCheckError] = useState("");

  function handleAddCard(card: Omit<Card, "id">) {
    setCards((prev) => [...prev, { ...card, id: crypto.randomUUID() }]);
  }

  function handleRemoveCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function handlePurchaseChange(field: keyof Purchase, value: string) {
    setPurchase((prev) => ({ ...prev, [field]: value }));
    // Clear stale recommendation when inputs change
    setRecommendation(null);
  }

  function handleCheckDeal() {
    const { merchant, subtotal } = purchase;

    if (!merchant.trim()) {
      setCheckError("Please enter a merchant name or URL.");
      return;
    }

    const parsed = parseFloat(subtotal);
    if (!subtotal.trim() || isNaN(parsed) || parsed <= 0) {
      setCheckError("Please enter a valid subtotal greater than $0.");
      return;
    }

    setCheckError("");

    // TODO: Pass `cards` array into recommendation engine when real logic is added
    setRecommendation(getMockRecommendation(merchant.trim(), parsed));
  }

  return (
    <main className={styles.main}>
      <Header />
      <CardManager
        cards={cards}
        onAdd={handleAddCard}
        onRemove={handleRemoveCard}
      />
      <PurchaseChecker
        purchase={purchase}
        onChange={handlePurchaseChange}
        onCheck={handleCheckDeal}
        error={checkError}
      />
      <RecommendationCard recommendation={recommendation} />
    </main>
  );
}
```

- [ ] **Step 2: Start the dev server and manually verify the full flow**

```bash
npm run dev
```

Walk through this checklist in the browser at `http://localhost:3000`:

1. Page loads with Header, My Cards, Check a Purchase sections visible
2. Click "Add Card" with empty fields → error message appears
3. Fill in issuer + name → card appears in list below the form; fields clear
4. Add a second card, verify both show
5. Click "Remove" on a card → it disappears
6. Click "Check Best Deal" with empty merchant → error appears
7. Fill merchant but enter `abc` for subtotal → error appears
8. Fill both fields correctly → Recommendation card appears with mock data
9. Change merchant → recommendation disappears

Stop server when done.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire up page with all state and handlers"
```

---

## Task 10: Build check and final commit

**Files:** none (verification only)

- [ ] **Step 1: Run the TypeScript compiler to catch any type errors**

```bash
npx tsc --noEmit
```

Expected: no output (exit code 0). If errors appear, fix them before continuing.

- [ ] **Step 2: Final commit**

```bash
git add -A
git status
```

Confirm only docs files are untracked (the spec and plan). Stage and commit them:

```bash
git add docs/
git commit -m "docs: add design spec and implementation plan"
```
