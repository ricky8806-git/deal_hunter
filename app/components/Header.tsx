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
