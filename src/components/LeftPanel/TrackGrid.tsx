import type { TrackRecord } from '../../types';
import styles from './LeftPanel.module.css';

export default function TrackGrid({ tracks }: { tracks: TrackRecord[] }) {
  if (!tracks.length) {
    return <p className={styles.emptyState}>No track data</p>;
  }
  return (
    <div className={styles.tracksGrid} role="list">
      {tracks.map((t, i) => (
        <article
          key={`${t.name}|${t.artist}`}
          className={styles.trackCard}
          role="listitem"
          aria-label={`#${i + 1}: ${t.name} by ${t.artist}, ${t.plays} plays`}
        >
          <div className={styles.trackRankBg} aria-hidden="true">{i + 1}</div>
          <div className={styles.trackName}>{t.name}</div>
          <div className={styles.trackArtist}>{t.artist}</div>
          <div className={styles.trackPlays}>{t.plays} plays</div>
        </article>
      ))}
    </div>
  );
}
