import styles from "./RightPanel.module.css";

interface Props {
  shuffle: number;
  skip: number;
  peak: string;
  artists: number;
}

export default function MiniStats({ shuffle, skip, peak, artists }: Props) {
  return (
    <div className={styles.miniGrid}>
      <div className={styles.miniStat}>
        <div className={styles.miniLbl}>Shuffle</div>
        <div className={styles.miniVal}>{shuffle}%</div>
      </div>
      <div className={styles.miniStat}>
        <div className={styles.miniLbl}>Skip rate</div>
        <div className={styles.miniVal}>{skip}%</div>
      </div>
      <div className={styles.miniStat}>
        <div className={styles.miniLbl}>Peak hour</div>
        <div className={styles.miniVal}>{peak || "—"}</div>
      </div>
      <div className={styles.miniStat}>
        <div className={styles.miniLbl}>Artists</div>
        <div className={styles.miniVal}>{artists.toLocaleString()}</div>
      </div>
    </div>
  );
}
