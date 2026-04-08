import type { Recommendation } from "@/app/types";
import styles from "./RecommendationCard.module.css";

interface Props {
  recommendation: Recommendation | null;
  isLoading?: boolean;
}

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function RecommendationCard({ recommendation, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <section className={styles.card}>
        <p className={styles.loadingMsg}>Searching for live deals…</p>
      </section>
    );
  }

  if (!recommendation) return null;

  const { liveDeals, promoCodes } = recommendation;
  const hasLiveDeals = liveDeals.length > 0;
  const hasLocalPromos = promoCodes.length > 0;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Recommendation</h2>

      {/* Detected merchant + category */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Merchant detected</span>
        <span className={styles.rowValue}>{recommendation.detectedMerchant}</span>
        <span className={styles.meta}>Category: {recommendation.detectedCategory}</span>
      </div>

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

      {/* Live deals (preferred) */}
      {hasLiveDeals && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Live deals found</span>
          {liveDeals.map((d, i) => (
            <div key={i} className={styles.liveDealItem}>
              <div className={styles.liveDealHeader}>
                <span className={styles.dealTypeBadge}>{d.dealType}</span>
                {d.code && <code className={styles.promoCode}>{d.code}</code>}
                <span className={styles[`confidence_${d.confidence}`]}>{d.confidence} confidence</span>
              </div>
              <span className={styles.liveDealTitle}>{d.title}</span>
              {d.description && (
                <span className={styles.liveDealDesc}>{d.description}</span>
              )}
              <div className={styles.liveDealMeta}>
                {d.estimatedSavings > 0 && (
                  <span className={styles.savings}>~{fmt(d.estimatedSavings)} off</span>
                )}
                {d.estimatedSavings > 0 && d.sourceName && <span className={styles.metaSep}>·</span>}
                {d.sourceName && (
                  <a
                    className={styles.sourceLink}
                    href={d.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {d.sourceName}
                  </a>
                )}
                {d.expiryText && <span className={styles.expiry}> · {d.expiryText}</span>}
              </div>
              {d.stackabilityNote && (
                <span className={styles.stackNote}>{d.stackabilityNote}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Local promo codes fallback */}
      {!hasLiveDeals && hasLocalPromos && (
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
