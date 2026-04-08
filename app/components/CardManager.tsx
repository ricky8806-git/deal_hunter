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
