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
