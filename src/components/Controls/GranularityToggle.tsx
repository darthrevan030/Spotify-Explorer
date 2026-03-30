import type { Granularity } from '../../types';
import styles from './Controls.module.css';

const GRANS: { value: Granularity; label: string }[] = [
  { value: 'year',  label: 'Year'  },
  { value: 'month', label: 'Month' },
  { value: 'week',  label: 'Week'  },
];

interface Props {
  gran:     Granularity;
  onChange: (g: Granularity) => void;
}

export default function GranularityToggle({ gran, onChange }: Props) {
  return (
    <div className={styles.granGroup} role="group" aria-label="Time granularity">
      {GRANS.map(g => (
        <button
          key={g.value}
          className={`${styles.granBtn}${gran === g.value ? ' ' + styles.granBtnActive : ''}`}
          aria-pressed={gran === g.value}
          onClick={() => onChange(g.value)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
