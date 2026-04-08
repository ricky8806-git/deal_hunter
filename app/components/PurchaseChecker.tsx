"use client";

import type { Purchase } from "@/app/types";
import styles from "./PurchaseChecker.module.css";

interface Props {
  purchase: Purchase;
  onChange: (field: keyof Purchase, value: string) => void;
  onCheck: () => void;
  error: string;
  isLoading?: boolean;
}

export default function PurchaseChecker({
  purchase,
  onChange,
  onCheck,
  error,
  isLoading = false,
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
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "Searching deals…" : "Check Best Deal"}
        </button>
      </form>
    </section>
  );
}
