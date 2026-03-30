import { useAppStore, useTotalHours } from '../../store/appContext';
import styles from './Header.module.css';

export default function Header() {
  const { state, dispatch } = useAppStore();
  const totalHours = useTotalHours();

  const db = state.db;
  const firstYear  = db?.year[0]?.year ?? '?';
  const latestYear = db?.year[db.year.length - 1]?.year ?? '?';

  return (
    <header className={styles.hdr}>
      <div className={styles.hdrLeft}>
        <h1 className={styles.hdrTitle}>
          Spotify <em>history</em>
        </h1>
        <button
          className={styles.reloadBtn}
          onClick={() => dispatch({ type: 'RESET' })}
          aria-label="Upload new files"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reload
        </button>
      </div>
      <p className={styles.hdrMeta}>
        {firstYear} — {latestYear} &nbsp;·&nbsp; {(state.totalPlays).toLocaleString()} plays<br />
        {totalHours.toLocaleString()}h total
      </p>
    </header>
  );
}
