"use client";

import { useState } from "react";
import type { Card, Purchase, Recommendation } from "@/app/types";
import { getRecommendation } from "@/lib/getRecommendation";
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

    setRecommendation(getRecommendation(cards, merchant.trim(), parsed));
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
