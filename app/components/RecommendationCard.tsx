import type { Recommendation, SavingsPath } from "@/app/types";
import styles from "./RecommendationCard.module.css";

interface Props {
  recommendation: Recommendation | null;
}

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

function PathCard({ path }: { path: SavingsPath }) {
  const totalLikely = path.guaranteedSavings + path.likelySavings;
  return (
    <div className={styles.pathCard}>
      <div className={styles.pathHeader}>
        <span className={styles[`confidence_${path.confidence}`]}>
          {path.confidence === "high" ? "guaranteed" : path.confidence === "medium" ? "likely" : "possible"}
        </span>
        <span className={styles.pathLabel}>{path.label}</span>
      </div>
      <div className={styles.pathSavings}>
        <span className={styles.savingsGreen}>~{fmt(totalLikely)}</span>
        {path.possibleSavings > 0 && (
          <span className={styles.savingsMuted}>
            {" "}+ up to {fmt(path.possibleSavings)} more if offer activates
          </span>
        )}
      </div>
      <ul className={styles.pathExplanations}>
        {path.explanations.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
      {path.stackabilityNote && (
        <span className={styles.stackNote}>{path.stackabilityNote}</span>
      )}
    </div>
  );
}

export default function RecommendationCard({ recommendation }: Props) {
  if (!recommendation) return null;

  const {
    detectedMerchant,
    detectedCategory,
    bestGuaranteedSavings,
    bestGuaranteedLabel,
    bestLikelySavings,
    bestLikelyLabel,
    possibleExtraSavings,
    topSavingsPaths,
    bestCard,
    rewardRate,
    rewardSavings,
    conversionNote,
    promoCodes,
    merchantOffers,
    explanations,
    note,
  } = recommendation;

  const hasPromo = bestLikelySavings > bestGuaranteedSavings;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Recommendation</h2>

      {/* Merchant detected */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Merchant detected</span>
        <span className={styles.rowValue}>{detectedMerchant}</span>
        <span className={styles.meta}>Category: {detectedCategory}</span>
      </div>

      {/* Tiered savings summary */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Savings summary</span>
        <div className={styles.tierRow}>
          <span className={styles.tierLabel}>Guaranteed</span>
          <span className={styles.savingsGreen}>~{fmt(bestGuaranteedSavings)}</span>
          <span className={styles.tierDesc}>{bestGuaranteedLabel}</span>
        </div>
        {hasPromo && (
          <div className={styles.tierRow}>
            <span className={styles.tierLabelAmber}>Likely</span>
            <span className={styles.savingsAmber}>~{fmt(bestLikelySavings)}</span>
            <span className={styles.tierDesc}>{bestLikelyLabel}</span>
          </div>
        )}
        {possibleExtraSavings > 0 && (
          <div className={styles.tierRow}>
            <span className={styles.tierLabelMuted}>Possible extra</span>
            <span className={styles.savingsMuted}>up to {fmt(possibleExtraSavings)}</span>
            <span className={styles.tierDesc}>merchant offer — requires activation</span>
          </div>
        )}
      </div>

      {/* Savings paths */}
      {topSavingsPaths.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Savings paths</span>
          {topSavingsPaths.map((p, i) => <PathCard key={i} path={p} />)}
        </div>
      )}

      {/* Card detail */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Best guaranteed card</span>
        <span className={styles.rowValue}>{bestCard}</span>
        <span className={styles.meta}>
          {rewardRate} · ~{fmt(rewardSavings)} back
        </span>
        {conversionNote && <span className={styles.subNote}>{conversionNote}</span>}
      </div>

      {/* Promo codes */}
      {promoCodes.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Promo codes to try</span>
          {promoCodes.map((p) => (
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
      {merchantOffers.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Possible extra savings</span>
          {merchantOffers.map((o, i) => (
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
          {explanations.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className={styles.note}>{note}</p>
    </section>
  );
}
