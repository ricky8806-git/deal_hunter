import type { Recommendation } from "@/app/types";
import styles from "./RecommendationCard.module.css";

interface Props {
  recommendation: Recommendation | null;
}

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function RecommendationCard({ recommendation }: Props) {
  if (!recommendation) return null;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Recommendation</h2>

      {/* Best overall */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Best overall</span>
        <span className={styles.rowValue}>{recommendation.bestOverall}</span>
        <span className={styles.savings}>~{fmt(recommendation.estimatedSavings)} estimated savings</span>
      </div>

      {/* Best guaranteed card */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Best guaranteed card</span>
        <span className={styles.rowValue}>{recommendation.bestCard}</span>
        <span className={styles.meta}>
          {recommendation.rewardRate} · ~{fmt(recommendation.rewardSavings)} back
        </span>
        {recommendation.conversionNote && (
          <span className={styles.subNote}>{recommendation.conversionNote}</span>
        )}
      </div>

      {/* Promo codes */}
      {recommendation.promoCodes.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Promo codes to try</span>
          {recommendation.promoCodes.map((p) => (
            <div key={p.code} className={styles.promoItem}>
              <code className={styles.promoCode}>{p.code}</code>
              <span className={styles.promoMeta}>
                {p.explanation}
                {p.savings > 0 && ` · ~${fmt(p.savings)} off`}
                {" · "}
                <span className={styles[`confidence_${p.confidence}`]}>{p.confidence} confidence</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Merchant offers */}
      {recommendation.merchantOffers.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Possible extra savings</span>
          {recommendation.merchantOffers.map((o, i) => (
            <div key={i} className={styles.offerItem}>
              <span className={styles.offerDescription}>{o.description}</span>
              <span className={styles.offerDisclaimer}>{o.disclaimer}</span>
            </div>
          ))}
        </div>
      )}

      {/* Why */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Why</span>
        <ul className={styles.explanationList}>
          {recommendation.explanations.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>

      <p className={styles.note}>{recommendation.note}</p>
    </section>
  );
}
