import styles from "./FeaturesSection.module.css";

const features = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    headline: "Every year, month & week",
    body: "Navigate your full history, not just an annual snapshot. Drill into any period and see what you were actually listening to.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    headline: "When you actually listen",
    body: "Peak hours, skip rates, and shuffle habits — the patterns Spotify Wrapped never shows you.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    headline: "How your taste changed",
    body: "Top artists and tracks for any period you choose — not just December. Watch your music evolve year by year.",
  },
];

export default function FeaturesSection() {
  return (
    <section className={styles.features} aria-label="What you'll discover">
      <div className={styles.container}>
        <h2 className={styles.sectionLabel}>What you'll discover</h2>
        <div className={styles.grid}>
          {features.map((f) => (
            <div key={f.headline} className={styles.card}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardHeadline}>{f.headline}</h3>
              <p className={styles.cardBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
