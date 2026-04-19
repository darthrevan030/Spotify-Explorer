import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Database, Granularity, AnyRecord, NavItem } from "../types";

/* ── State & Actions ─────────────────────────────────────────── */

interface AppState {
  db: Database | null;
  totalPlays: number;
  screen: "upload" | "app";
  gran: Granularity;
  selYear: string | null;
  selMonth: number | null;
  selKey: string | null;
}

type AppAction =
  | {
      type: "DB_READY";
      db: Database;
      totalPlays: number;
      selYear: string;
      selMonth: number;
      selKey: string;
    }
  | { type: "RESET" }
  | { type: "SET_GRAN"; gran: Granularity }
  | { type: "SET_SEL_YEAR"; year: string }
  | { type: "SET_SEL_MONTH"; month: number }
  | { type: "SET_SEL_KEY"; key: string };

const initialState: AppState = {
  db: null,
  totalPlays: 0,
  screen: "upload",
  gran: "year",
  selYear: null,
  selMonth: null,
  selKey: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "DB_READY":
      return {
        ...state,
        db: action.db,
        totalPlays: action.totalPlays,
        screen: "app",
        gran: "year",
        selYear: action.selYear,
        selMonth: action.selMonth,
        selKey: action.selKey,
      };
    case "RESET":
      return { ...initialState };
    case "SET_GRAN":
      return { ...state, gran: action.gran };
    case "SET_SEL_YEAR":
      return { ...state, selYear: action.year };
    case "SET_SEL_MONTH":
      return { ...state, selMonth: action.month };
    case "SET_SEL_KEY":
      return { ...state, selKey: action.key };
  }
}

/* ── Context ─────────────────────────────────────────────────── */

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}

/* ── Derived accessor hooks ──────────────────────────────────── */

export function useAllYears(): string[] {
  const { state } = useAppStore();
  return state.db?.year.map((d) => d.year) ?? [];
}

export function useMonthsInYear(year: string | null) {
  const { state } = useAppStore();
  if (!year || !state.db) return [];
  return state.db.month.filter((d) => d.year === year);
}

export function useWeeksInYearMonth(ym: string | null) {
  const { state } = useAppStore();
  if (!ym || !state.db) return [];
  return state.db.week.filter((d) => d.yearMonth === ym);
}

export function useCurrentNavItems(): NavItem[] {
  const { state } = useAppStore();
  if (!state.db) return [];

  if (state.gran === "year") return state.db.year;
  if (state.gran === "month") {
    return state.db.month.filter((d) => d.year === state.selYear);
  }
  const ym = `${state.selYear}-${String(state.selMonth).padStart(2, "0")}`;
  return state.db.week.filter((d) => d.yearMonth === ym);
}

export function useFindRecord(): AnyRecord | null {
  const { state } = useAppStore();
  if (!state.db || !state.selKey) return null;

  const ds =
    state.gran === "year"
      ? state.db.year
      : state.gran === "month"
        ? state.db.month
        : state.db.week;
  return ds.find((d) => d.key === state.selKey) ?? null;
}

export function useTotalHours(): number {
  const { state } = useAppStore();
  return state.db?.year.reduce((s, d) => s + d.hours, 0) ?? 0;
}
