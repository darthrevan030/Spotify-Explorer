import type { AnyRecord, Granularity } from '../../types';
import { MONTH_NAMES } from '../../lib/utils';
import { isWeekRecord } from '../../types';
import styles from './LeftPanel.module.css';

interface Props {
  record: AnyRecord;
  gran:   Granularity;
}

function heroKeyText(record: AnyRecord, gran: Granularity): string {
  if (gran === 'year')  return (record as { year: string }).year;
  if (gran === 'month') return MONTH_NAMES[(record as { month: number }).month - 1] ?? '';
  return `W${String((record as { weekNum: number }).weekNum).padStart(2, '0')}`;
}

function heroSizeClass(gran: Granularity): string {
  if (gran === 'year')  return styles.heroKey;
  if (gran === 'month') return `${styles.heroKey} ${styles.heroKeySm}`;
  return `${styles.heroKey} ${styles.heroKeyXs}`;
}

export default function Hero({ record, gran }: Props) {
  const keyText = heroKeyText(record, gran);
  const tracks  = 'tracks' in record ? (record as { tracks: number }).tracks : null;

  return (
    <section className={`${styles.hero} ${styles.panelEnter}`} aria-label="Period overview">
      <div className={heroSizeClass(gran)} aria-hidden="true">{keyText}</div>
      <div>
        <div className={styles.heroLbl}>hours listened</div>
        <div className={styles.heroHours} aria-label={`${record.hours} hours`}>
          {record.hours}h
        </div>
        <div className={styles.heroSub}>
          <span>{record.plays.toLocaleString()}</span> plays
          {' '}&nbsp;·&nbsp;{' '}
          <span>{record.artists.toLocaleString()}</span> artists
          {tracks !== null && (
            <>{' '}&nbsp;·&nbsp;{' '}<span>{tracks.toLocaleString()}</span> tracks</>
          )}
          {isWeekRecord(record) && record.startDate && (
            <><br />{record.startDate}</>
          )}
        </div>
      </div>
    </section>
  );
}
