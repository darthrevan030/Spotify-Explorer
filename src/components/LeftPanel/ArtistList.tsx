import type { ArtistRecord } from '../../types';
import styles from './LeftPanel.module.css';

export default function ArtistList({ artists }: { artists: ArtistRecord[] }) {
  if (!artists.length) {
    return <p className={styles.emptyState}>No artist data</p>;
  }
  return (
    <div className={styles.artists} role="list">
      {artists.map((a, i) => (
        <div key={a.name} className={styles.artistRow} role="listitem">
          <span className={styles.artistRank} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <div className={styles.artistName}>{a.name}</div>
            <div
              className={styles.artistBarWrap}
              role="progressbar"
              aria-valuenow={a.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${a.name}: ${a.hours}h, ${a.plays.toLocaleString()} plays`}
            >
              <div className={styles.artistBarFill} style={{ width: `${a.pct}%` }} />
            </div>
          </div>
          <div className={styles.artistStats}>
            <div className={styles.artistHours}>{a.hours}h</div>
            <div className={styles.artistPlays}>{a.plays.toLocaleString()} plays</div>
          </div>
        </div>
      ))}
    </div>
  );
}
