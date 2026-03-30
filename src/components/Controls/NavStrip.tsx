import { useRef, useEffect } from 'react';
import type { NavItem } from '../../types';
import styles from './Controls.module.css';

interface Props {
  items:    NavItem[];
  selKey:   string | null;
  onSelect: (item: NavItem) => void;
}

export default function NavStrip({ items, selKey, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Scroll active button into view
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !selKey) return;
    const btn = strip.querySelector<HTMLElement>(`[data-key="${CSS.escape(selKey)}"]`);
    if (!btn) return;
    const target = btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [selKey, items]);

  return (
    <div
      ref={stripRef}
      className={styles.ctrlRow2}
      role="tablist"
      aria-label="Time periods"
    >
      {items.map(item => (
        <button
          key={item.key}
          data-key={item.key}
          className={`${styles.periodBtn}${item.key === selKey ? ' ' + styles.periodBtnActive : ''}`}
          role="tab"
          aria-selected={item.key === selKey}
          title={item.longLabel ?? item.label}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
