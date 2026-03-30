import type { Granularity, MonthRecord } from '../../types';
import { MONTH_NAMES } from '../../lib/utils';
import styles from './Controls.module.css';

interface Props {
  gran:          Granularity;
  selYear:       string | null;
  selMonth:      number | null;
  years:         string[];
  monthsInYear:  MonthRecord[];
  onYearChange:  (year: string) => void;
  onMonthChange: (month: number) => void;
}

export default function PeriodDropdowns({
  gran, selYear, selMonth,
  years, monthsInYear,
  onYearChange, onMonthChange,
}: Props) {
  if (gran === 'year') return null;

  return (
    <div className={styles.ddGroup}>
      {/* Year dropdown — always visible for month + week */}
      <label className={styles.ddLabel} htmlFor="ddYear">Year</label>
      <select
        id="ddYear"
        className={styles.dd}
        value={selYear ?? ''}
        onChange={e => onYearChange(e.target.value)}
        aria-label="Select year"
      >
        {years.map(yr => (
          <option key={yr} value={yr}>{yr}</option>
        ))}
      </select>

      {/* Month dropdown — week gran only */}
      {gran === 'week' && (
        <>
          <label className={styles.ddLabel} htmlFor="ddMonth">Month</label>
          <select
            id="ddMonth"
            className={styles.dd}
            value={selMonth ?? ''}
            onChange={e => onMonthChange(parseInt(e.target.value))}
            aria-label="Select month"
          >
            {monthsInYear.map(m => (
              <option key={m.month} value={m.month}>
                {MONTH_NAMES[m.month - 1] ?? m.month}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
