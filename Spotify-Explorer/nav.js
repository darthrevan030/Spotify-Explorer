/**
 * nav.js
 * Controls bar: granularity toggle, contextual dropdowns, period strip.
 * Calls renderPeriod() on selection change (imported from renderer.js).
 */

import {
  STATE, DB,
  setGran, setSelYear, setSelMonth, setSelKey,
  allYears, monthsInYear, weeksInYearMonth, currentNavItems,
} from './store.js';
import { renderPeriod } from './renderer.js';
import { el, MONTH_NAMES } from './utils.js';

/* ── Granularity buttons ────────────────────────────────────── */

export function initGranButtons() {
  document.querySelectorAll('.gran-btn').forEach(btn => {
    btn.addEventListener('click', () => switchGran(btn.dataset.gran));
  });
}

export function switchGran(newGran) {
  setGran(newGran);

  // Update button states
  document.querySelectorAll('.gran-btn').forEach(b => {
    const active = b.dataset.gran === newGran;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  // Auto-select a sensible key for the new granularity
  if (newGran === 'year') {
    setSelKey(STATE.selYear);
  } else if (newGran === 'month') {
    const ms  = monthsInYear(STATE.selYear);
    const rec = ms[ms.length - 1];
    if (rec) { setSelMonth(rec.month); setSelKey(rec.key); }
  } else {
    const ym = `${STATE.selYear}-${String(STATE.selMonth).padStart(2, '0')}`;
    const ws = weeksInYearMonth(ym);
    const rec = ws[ws.length - 1];
    if (rec) setSelKey(rec.key);
  }

  rebuildDropdowns();
  rebuildNav();
  renderPeriod(STATE.selKey);
}

/* ── Contextual dropdowns ───────────────────────────────────── */

export function rebuildDropdowns() {
  const grp = document.getElementById('ddGroup');
  grp.innerHTML = '';
  if (STATE.gran === 'year') return;

  // Year dropdown — always shown for month + week
  _appendDropdown(grp, 'Year', 'ddYear', allYears(), STATE.selYear, yr => {
    setSelYear(yr);
    _autoSelectMonthWeek();
    rebuildDropdowns();
    rebuildNav();
    renderPeriod(STATE.selKey);
  });

  // Month dropdown — only for week granularity
  if (STATE.gran === 'week') {
    const months = monthsInYear(STATE.selYear);
    _appendDropdown(
      grp, 'Month', 'ddMonth',
      months.map(m => m.month),
      STATE.selMonth,
      mon => {
        setSelMonth(parseInt(mon));
        const ym = `${STATE.selYear}-${String(STATE.selMonth).padStart(2, '0')}`;
        const ws = weeksInYearMonth(ym);
        if (ws.length) setSelKey(ws[ws.length - 1].key);
        rebuildDropdowns();
        rebuildNav();
        renderPeriod(STATE.selKey);
      },
      mon => MONTH_NAMES[parseInt(mon) - 1]   // label formatter
    );
  }
}

function _appendDropdown(parent, labelText, id, values, selectedValue, onChange, labelFmt) {
  const lbl = el('span', 'dd-label', labelText);
  lbl.setAttribute('for', id);       // accessibility association

  const sel = document.createElement('select');
  sel.className = 'dd';
  sel.id = id;
  sel.setAttribute('aria-label', `Select ${labelText.toLowerCase()}`);

  values.forEach(v => {
    const o = document.createElement('option');
    o.value       = v;
    o.textContent = labelFmt ? labelFmt(v) : v;
    if (String(v) === String(selectedValue)) o.selected = true;
    sel.appendChild(o);
  });

  sel.addEventListener('change', e => onChange(e.target.value));
  parent.appendChild(lbl);
  parent.appendChild(sel);
}

function _autoSelectMonthWeek() {
  const ms  = monthsInYear(STATE.selYear);
  if (!ms.length) return;
  const rec = ms[ms.length - 1];
  setSelMonth(rec.month);

  if (STATE.gran === 'month') {
    setSelKey(rec.key);
  } else {
    const ym = `${STATE.selYear}-${String(STATE.selMonth).padStart(2, '0')}`;
    const ws = weeksInYearMonth(ym);
    if (ws.length) setSelKey(ws[ws.length - 1].key);
  }
}

/* ── Period nav strip ───────────────────────────────────────── */

export function rebuildNav() {
  const strip = document.getElementById('navStrip');
  strip.innerHTML = '';

  currentNavItems().forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'period-btn';
    btn.textContent = d.label;
    btn.dataset.key = d.key;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', d.key === STATE.selKey ? 'true' : 'false');
    btn.setAttribute('title', d.longLabel || d.label);

    btn.addEventListener('click', () => {
      setSelKey(d.key);
      if (STATE.gran === 'month') setSelMonth(d.month);
      if (STATE.gran === 'week')  setSelMonth(d.month);
      activateNavBtn(d.key);
      renderPeriod(d.key);
    });

    strip.appendChild(btn);
  });

  scrollNavTo(STATE.selKey);
}

export function activateNavBtn(key) {
  document.querySelectorAll('.period-btn').forEach(b =>
    b.setAttribute('aria-selected', b.dataset.key === key ? 'true' : 'false')
  );
}

export function scrollNavTo(key) {
  const strip = document.getElementById('navStrip');
  const btn   = strip.querySelector(`[data-key="${key}"]`);
  if (!btn) return;
  const target = btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2;
  strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
}
