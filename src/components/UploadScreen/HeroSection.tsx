import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.heroContent}>
        <div className={styles.badge}>
          Your data. Your device. Your history.
        </div>
        <h1 className={styles.headline}>
          Your Spotify history,
          <br />
          <em>fully uncovered.</em>
        </h1>
        <p className={styles.subheadline}>
          Not just a year-end recap. Explore every week, month, and year of your
          listening history — peak hours, skip rates, how your taste evolved.
        </p>
        <div className={styles.ctaRow}>
          <button className={styles.ctaBtn} onClick={onGetStarted}>
            Get started
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
          <p className={styles.privacyNote}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Processed entirely on your device. Nothing is ever uploaded.
          </p>
        </div>
      </div>

      {/* App preview mockup */}
      <div className={styles.mockup} aria-hidden="true">
        <div className={styles.mockupHeader}>
          <span className={styles.mockupTitle}>
            Spotify <em>history</em>
          </span>
          <div className={styles.mockupMeta}>
            <span>2019 – 2024</span>
            <span>·</span>
            <span>14,832 plays</span>
            <span>·</span>
            <span>1,204 hrs</span>
          </div>
        </div>
        <div className={styles.mockupBody}>
          <div className={styles.mockupLeft}>
            <div className={styles.mockupHero}>
              <div className={styles.mockupPeriod}>2024</div>
              <div className={styles.mockupHours}>312 hrs</div>
              <div className={styles.mockupStats}>
                <span>2,841 plays</span>
                <span>·</span>
                <span>87 artists</span>
              </div>
            </div>
            <div className={styles.mockupList}>
              {[
                { rank: 1, name: "Radiohead", hrs: "48 hrs" },
                { rank: 2, name: "Bon Iver", hrs: "31 hrs" },
                { rank: 3, name: "Bicep", hrs: "24 hrs" },
              ].map((a) => (
                <div key={a.rank} className={styles.mockupListItem}>
                  <span className={styles.mockupRank}>{a.rank}</span>
                  <span className={styles.mockupName}>{a.name}</span>
                  <span className={styles.mockupHrs}>{a.hrs}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.mockupRight}>
            <div className={styles.mockupChart}>
              {[40, 65, 55, 80, 45, 90, 75, 60, 85, 70, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className={styles.mockupBar}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className={styles.mockupMiniStats}>
              <div className={styles.mockupMiniStat}>
                <span className={styles.mockupMiniVal}>11 pm</span>
                <span className={styles.mockupMiniLabel}>peak hour</span>
              </div>
              <div className={styles.mockupMiniStat}>
                <span className={styles.mockupMiniVal}>18%</span>
                <span className={styles.mockupMiniLabel}>skip rate</span>
              </div>
              <div className={styles.mockupMiniStat}>
                <span className={styles.mockupMiniVal}>34%</span>
                <span className={styles.mockupMiniLabel}>shuffle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
