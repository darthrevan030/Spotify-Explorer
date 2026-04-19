import type { Granularity, NavItem } from "../../types";
import {
  useAppStore,
  useAllYears,
  useMonthsInYear,
  useWeeksInYearMonth,
  useCurrentNavItems,
} from "../../store/appContext";
import GranularityToggle from "./GranularityToggle";
import PeriodDropdowns from "./PeriodDropdowns";
import NavStrip from "./NavStrip";
import styles from "./Controls.module.css";

export default function Controls() {
  const { state, dispatch } = useAppStore();
  const allYears = useAllYears();
  const monthsInYr = useMonthsInYear(state.selYear);
  const navItems = useCurrentNavItems();

  /* ── Granularity change ─────────────────────────────────── */

  const handleGranChange = (newGran: Granularity) => {
    if (!state.db) return;

    let newSelKey = state.selKey;
    let newSelMonth = state.selMonth;

    if (newGran === "year") {
      newSelKey = state.selYear;
    } else if (newGran === "month") {
      const ms = state.db.month.filter((d) => d.year === state.selYear);
      const rec = ms[ms.length - 1];
      if (rec) {
        newSelMonth = rec.month;
        newSelKey = rec.key;
      }
    } else {
      const ym = `${state.selYear}-${String(state.selMonth).padStart(2, "0")}`;
      const ws = state.db.week.filter((d) => d.yearMonth === ym);
      const rec = ws[ws.length - 1];
      if (rec) newSelKey = rec.key;
    }

    dispatch({ type: "SET_GRAN", gran: newGran });
    if (newSelMonth !== state.selMonth && newSelMonth !== null) {
      dispatch({ type: "SET_SEL_MONTH", month: newSelMonth });
    }
    if (newSelKey !== null) {
      dispatch({ type: "SET_SEL_KEY", key: newSelKey });
    }
  };

  /* ── Year dropdown change ───────────────────────────────── */

  const handleYearChange = (year: string) => {
    if (!state.db) return;
    const ms = state.db.month.filter((d) => d.year === year);
    const rec = ms[ms.length - 1];
    if (!rec) return;

    dispatch({ type: "SET_SEL_YEAR", year });
    dispatch({ type: "SET_SEL_MONTH", month: rec.month });

    if (state.gran === "month") {
      dispatch({ type: "SET_SEL_KEY", key: rec.key });
    } else {
      const ym = `${year}-${String(rec.month).padStart(2, "0")}`;
      const ws = state.db.week.filter((d) => d.yearMonth === ym);
      const wr = ws[ws.length - 1];
      if (wr) dispatch({ type: "SET_SEL_KEY", key: wr.key });
    }
  };

  /* ── Month dropdown change ──────────────────────────────── */

  const handleMonthChange = (month: number) => {
    if (!state.db || !state.selYear) return;
    const ym = `${state.selYear}-${String(month).padStart(2, "0")}`;
    const ws = state.db.week.filter((d) => d.yearMonth === ym);
    const rec = ws[ws.length - 1];

    dispatch({ type: "SET_SEL_MONTH", month });
    if (rec) dispatch({ type: "SET_SEL_KEY", key: rec.key });
  };

  /* ── Nav strip selection ────────────────────────────────── */

  const handleNavSelect = (item: NavItem) => {
    dispatch({ type: "SET_SEL_KEY", key: item.key });

    // Keep selMonth in sync when navigating months or weeks
    if (state.gran === "month" && state.db) {
      const rec = state.db.month.find((d) => d.key === item.key);
      if (rec) dispatch({ type: "SET_SEL_MONTH", month: rec.month });
    } else if (state.gran === "week" && state.db) {
      const rec = state.db.week.find((d) => d.key === item.key);
      if (rec) dispatch({ type: "SET_SEL_MONTH", month: rec.month });
    }
  };

  /* ── Render ─────────────────────────────────────────────── */

  const ym =
    state.selYear && state.selMonth
      ? `${state.selYear}-${String(state.selMonth).padStart(2, "0")}`
      : null;
  const monthsForDropdown = useWeeksInYearMonth(ym); // just for type resolution below
  void monthsForDropdown; // we use monthsInYr directly

  return (
    <nav className={styles.controls} aria-label="Time controls">
      <div className={styles.ctrlRow1}>
        <GranularityToggle gran={state.gran} onChange={handleGranChange} />
        <PeriodDropdowns
          gran={state.gran}
          selYear={state.selYear}
          selMonth={state.selMonth}
          years={allYears}
          monthsInYear={monthsInYr}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
        />
      </div>
      <NavStrip
        items={navItems}
        selKey={state.selKey}
        onSelect={handleNavSelect}
      />
    </nav>
  );
}
