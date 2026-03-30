/**
 * chart.js
 * Manages the Chart.js overview bar chart in the right panel.
 * Reads current state from store.js to know which items + key to highlight.
 */

import { STATE, currentNavItems } from './store.js';

let _instance = null;

/**
 * Build (or rebuild) the overview bar chart.
 * Must be called after the right panel HTML has been inserted into the DOM
 * so that #sideChart exists.
 */
export function buildChart() {
  const canvas = document.getElementById('sideChart');
  if (!canvas) return;

  if (_instance) {
    _instance.destroy();
    _instance = null;
  }

  const items  = currentNavItems();
  const labels = items.map(d => d.label);
  const data   = items.map(d => d.hours);
  const colors = items.map(d => d.key === STATE.selKey ? '#c8f060' : '#1e1e1e');

  // Cap visible tick labels so they don't overlap on small charts
  const maxTicks = STATE.gran === 'week' ? 8 : 12;

  _instance = new Chart(canvas, {
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
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y}h`,
          },
        },
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
}

/** Update bar colours without rebuilding the whole chart */
export function updateChartColors() {
  if (!_instance) return;
  const items = currentNavItems();
  _instance.data.datasets[0].backgroundColor =
    items.map(d => d.key === STATE.selKey ? '#c8f060' : '#1e1e1e');
  _instance.update('none');
}
