import { useRef, useEffect } from 'react';
import {
  Chart,
  BarController, BarElement,
  CategoryScale, LinearScale,
  Tooltip,
} from 'chart.js';
import type { NavItem } from '../../types';
import styles from './RightPanel.module.css';

// Register only what we use (avoids the full 'chart.js/auto' bundle)
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface Props {
  items:  NavItem[];
  selKey: string | null;
  gran:   string;
}

export default function OverviewChart({ items, selKey, gran }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    const labels = items.map(d => d.label);
    const data   = items.map(d => (d as { hours?: number }).hours ?? 0);
    const colors = items.map(d => d.key === selKey ? '#c8f060' : '#1e1e1e');
    const maxTicks = gran === 'week' ? 8 : 12;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius:    2,
          borderSkipped:   false,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend:  { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}h` } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font:          { size: 8, family: 'DM Mono' },
              color:         '#555',
              maxRotation:   45,
              autoSkip:      true,
              maxTicksLimit: maxTicks,
            },
          },
          y: { display: false },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [items, selKey, gran]);

  return (
    <div className={styles.chartWrap}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Bar chart of hours listened in the current view. Selected period highlighted."
      />
    </div>
  );
}
