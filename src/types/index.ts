export type Granularity = "year" | "month" | "week";

export interface ArtistRecord {
  name: string;
  hours: number;
  plays: number;
  pct: number;
}

export interface TrackRecord {
  name: string;
  artist: string;
  plays: number;
}

export interface YearRecord {
  key: string;
  label: string;
  year: string;
  hours: number;
  plays: number;
  artists: number;
  tracks: number;
  shuffle: number;
  skip: number;
  peak: string;
  note: string;
  topArtists: ArtistRecord[];
  topTracks: TrackRecord[];
}

export interface MonthRecord {
  key: string;
  label: string;
  longLabel: string;
  year: string;
  month: number;
  hours: number;
  plays: number;
  artists: number;
  shuffle: number;
  skip: number;
  peak: string;
  topArtists: ArtistRecord[];
  topTracks: TrackRecord[];
}

export interface WeekRecord {
  key: string;
  label: string;
  longLabel: string;
  year: string;
  month: number;
  yearMonth: string;
  weekNum: number;
  startDate: string;
  hours: number;
  plays: number;
  artists: number;
  shuffle: number;
  skip: number;
  peak: string;
  topArtists: ArtistRecord[];
  topTracks: TrackRecord[];
}

export type AnyRecord = YearRecord | MonthRecord | WeekRecord;

export interface Database {
  year: YearRecord[];
  month: MonthRecord[];
  week: WeekRecord[];
}

export interface ResolvedDefaults {
  selYear: string;
  selMonth: number;
  weekKey: string | null;
}

export type NavItem = { key: string; label: string; longLabel?: string };

// Type guards
export function isYearRecord(r: AnyRecord): r is YearRecord {
  return "tracks" in r && !("month" in r);
}

export function isWeekRecord(r: AnyRecord): r is WeekRecord {
  return "weekNum" in r;
}
