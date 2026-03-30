/**
 * store.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised application state.
 *
 * DB holds the processed dataset. It is populated by processor.js
 * (or by a third-party integration that replaces it).
 *
 * STATE holds the current UI selection. Mutate via the exported
 * setters so that all modules read from a single source of truth.
 * ─────────────────────────────────────────────────────────────────
 */

/* ── Dataset ────────────────────────────────────────────────── */

/**
 * @type {{ year: YearRecord[], month: MonthRecord[], week: WeekRecord[] }}
 */
export const DB = {
  year:  [],
  month: [],
  week:  [],
};

/* ── UI State ───────────────────────────────────────────────── */

export const STATE = {
  /** Current time granularity: 'year' | 'month' | 'week' */
  gran:     'year',
  /** Currently selected year string e.g. '2024' */
  selYear:  null,
  /** Currently selected month integer 1–12 */
  selMonth: null,
  /** Key of the currently rendered period e.g. '2024-04' */
  selKey:   null,
};

/* ── Setters ────────────────────────────────────────────────── */

export function setGran(gran)     { STATE.gran     = gran; }
export function setSelYear(year)  { STATE.selYear  = year; }
export function setSelMonth(mon)  { STATE.selMonth = mon; }
export function setSelKey(key)    { STATE.selKey   = key; }

/* ── DB accessors ───────────────────────────────────────────── */

export function allYears() {
  return DB.year.map(d => d.year);
}

export function monthsInYear(year) {
  return DB.month.filter(d => d.year === year);
}

export function weeksInYearMonth(ym) {
  return DB.week.filter(d => d.yearMonth === ym);
}

export function findRecord(key) {
  const ds = STATE.gran === 'year'  ? DB.year
           : STATE.gran === 'month' ? DB.month
           : DB.week;
  return ds.find(d => d.key === key) ?? null;
}

/** All records for the current nav strip */
export function currentNavItems() {
  if (STATE.gran === 'year') return DB.year;
  if (STATE.gran === 'month') return monthsInYear(STATE.selYear);
  const ym = `${STATE.selYear}-${String(STATE.selMonth).padStart(2, '0')}`;
  return weeksInYearMonth(ym);
}

/** Total hours across all year records */
export function totalHours() {
  return DB.year.reduce((s, d) => s + d.hours, 0);
}
