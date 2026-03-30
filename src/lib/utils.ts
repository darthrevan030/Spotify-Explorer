import type { Database, ResolvedDefaults } from '../types';

export const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

/** Round to 1 decimal place */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Percentage to 1dp */
export function pct1(count: number, total: number): number {
  return total ? Math.round((count / total) * 1000) / 10 : 0;
}

/** Escape HTML — useful for aria-label strings */
export function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Read a File object as text (Promise) */
export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/** Yield to the browser event loop (keeps UI responsive during heavy work) */
export function tick(): Promise<void> {
  return new Promise(r => setTimeout(r, 0));
}

/** Get ISO year + week number from a Date */
export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    year: d.getUTCFullYear(),
    week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7),
  };
}

/** Get the Monday of the week containing `date` as a YYYY-MM-DD string */
export function getMondayStr(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

/** Convert peak UTC hour to a human-readable SGT string e.g. "7AM" */
export function peakHourSGT(hourPlays: Record<number, number>): string {
  const entries = Object.entries(hourPlays);
  if (!entries.length) return '—';
  const utcHour = parseInt(entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]);
  const sgt = (utcHour + 8) % 24;
  const h   = sgt % 12 || 12;
  return h + (sgt < 12 ? 'AM' : 'PM');
}

/**
 * Given a target date and DB arrays, determine the best default selKey
 * for each granularity. Falls back to latest available if target not found.
 */
export function resolveDefaults(DB: Database, now: Date = new Date()): ResolvedDefaults {
  const todayYear  = String(now.getFullYear());
  const todayMonth = now.getMonth() + 1;

  const yearRec = DB.year.find(d => d.year === todayYear) ?? DB.year[DB.year.length - 1];
  const selYear = yearRec?.year ?? todayYear;

  const monthsInYear = DB.month.filter(d => d.year === selYear);
  const monthRec = monthsInYear.find(d => d.month === todayMonth) ?? monthsInYear[monthsInYear.length - 1];
  const selMonth = monthRec?.month ?? todayMonth;

  const ym = `${selYear}-${String(selMonth).padStart(2, '0')}`;
  const weeksInMonth = DB.week.filter(d => d.yearMonth === ym);
  const weekRec = weeksInMonth[weeksInMonth.length - 1] ?? DB.week[DB.week.length - 1];

  return { selYear, selMonth, weekKey: weekRec?.key ?? null };
}
