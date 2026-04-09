"use client";

import { useState } from "react";
import type { Card, Purchase, Recommendation } from "@/app/types";
import { getRecommendation } from "@/lib/getRecommendation";
import { findCardRule } from "@/lib/cardRules";
import { fetchFallbackCardRule } from "@/lib/cardFallback";
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
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [checkError, setCheckError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  function handleAddCard(card: Omit<Card, "id">) {
    setCards((prev) => [...prev, { ...card, id: crypto.randomUUID() }]);
  }

  function handleRemoveCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function handlePurchaseChange(field: keyof Purchase, value: string) {
    setPurchase((prev) => ({ ...prev, [field]: value }));
    setRecommendation(null);
  }

  async function handleCheckDeal() {
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
    setIsChecking(true);

    // Fetch online fallback for any cards not in local rules
    const fallbackRules = new Map<string, import("@/lib/cardRules").CardRule>();
    for (const card of cards) {
      if (!findCardRule(card.issuer, card.name)) {
        const rule = await fetchFallbackCardRule(card.issuer, card.name);
        if (rule) fallbackRules.set(card.id, rule);
      }
    }

    setIsChecking(false);
    setRecommendation(getRecommendation(cards, merchant.trim(), parsed, fallbackRules));
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
        isChecking={isChecking}
      />
      <RecommendationCard recommendation={recommendation} />
    </main>
  );
}
