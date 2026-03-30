import type { Database, YearRecord, MonthRecord, WeekRecord, ArtistRecord, TrackRecord } from '../types';
import {
  MONTH_NAMES, round1, pct1,
  readFileText, tick, getISOWeek, getMondayStr, peakHourSGT,
} from './utils';

const TOP_ARTISTS = 5;
const TOP_TRACKS  = 5;
const CHUNK_SIZE  = 5_000;

interface PeriodAcc {
  ms:          number;
  plays:       number;
  artistMs:    Record<string, number>;
  artistPlays: Record<string, number>;
  trackPlays:  Record<string, number>;
  artists:     Set<string>;
  uris:        Set<string>;
  shuffle:     number;
  skip:        number;
  hourPlays:   Record<number, number>;
  year?:       string;
  yearMonth?:  string;
  startDate?:  string;
}

/**
 * Process an array of File objects.
 * Emits progress via onProgress(pct: 0–100, message: string).
 * Returns the populated database and total play count.
 */
export async function processFiles(
  files: File[],
  onProgress: (pct: number, message: string) => void = () => {},
): Promise<{ db: Database; totalPlays: number }> {
  const yearAcc:  Record<string, PeriodAcc> = {};
  const monthAcc: Record<string, PeriodAcc> = {};
  const weekAcc:  Record<string, PeriodAcc> = {};

  // 1. Read all files
  const allRecords: unknown[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round((i / files.length) * 25), `Reading ${files[i].name}…`);
    try {
      const text = await readFileText(files[i]);
      const parsed = JSON.parse(text) as unknown[];
      allRecords.push(...parsed);
    } catch (e) {
      console.error('[processor] Failed to read', files[i].name, e);
    }
  }

  onProgress(25, `Filtering ${allRecords.length.toLocaleString()} records…`);
  await tick();

  // 2. Filter to music tracks only (exclude podcasts, audiobooks, video)
  const tracks = (allRecords as Record<string, unknown>[]).filter(
    s => s.master_metadata_track_name
  );
  const total = tracks.length;

  onProgress(30, `Aggregating ${total.toLocaleString()} plays…`);
  await tick();

  // 3. Aggregate in chunks to keep UI responsive
  for (let i = 0; i < tracks.length; i += CHUNK_SIZE) {
    _processChunk(tracks.slice(i, i + CHUNK_SIZE), yearAcc, monthAcc, weekAcc);
    const pct = 30 + Math.round((Math.min(i + CHUNK_SIZE, total) / total) * 58);
    onProgress(pct, `Aggregating… ${Math.min(i + CHUNK_SIZE, total).toLocaleString()} / ${total.toLocaleString()}`);
    await tick();
  }

  onProgress(90, 'Building dataset…');
  await tick();

  // 4. Build typed DB arrays from accumulators
  const db: Database = {
    year:  _buildYears(yearAcc),
    month: _buildMonths(monthAcc),
    week:  _buildWeeks(weekAcc),
  };

  onProgress(100, `Done — ${total.toLocaleString()} plays loaded.`);
  await tick();

  return { db, totalPlays: total };
}

/* ── Internal aggregation ───────────────────────────────────── */

function _processChunk(
  chunk: Record<string, unknown>[],
  yearAcc: Record<string, PeriodAcc>,
  monthAcc: Record<string, PeriodAcc>,
  weekAcc: Record<string, PeriodAcc>,
) {
  for (const s of chunk) {
    const ts     = (s.ts as string) || '';
    const yr     = ts.slice(0, 4);
    const ym     = ts.slice(0, 7);
    const hour   = parseInt(ts.slice(11, 13)) || 0;
    const artist = (s.master_metadata_album_artist_name as string) || 'Unknown';
    const tkKey  = ((s.master_metadata_track_name as string) || '') + '|||' + artist;
    const ms     = (s.ms_played as number) || 0;
    const uri    = (s.spotify_track_uri as string) || '';
    const shuf   = s.shuffle  ? 1 : 0;
    const skip   = s.skipped  ? 1 : 0;

    // ISO week + Monday date
    const dt      = new Date(ts.replace('Z', '+00:00'));
    const iso     = getISOWeek(dt);
    const wkKey   = `${iso.year}-W${String(iso.week).padStart(2, '0')}`;
    const monday  = getMondayStr(dt);
    const wkYM    = monday.slice(0, 7);

    _acc(yearAcc,  yr,    ms, artist, tkKey, uri,  shuf, skip, hour);
    _acc(monthAcc, ym,    ms, artist, tkKey, null, shuf, skip, hour, yr);
    _acc(weekAcc,  wkKey, ms, artist, tkKey, null, shuf, skip, hour, yr, wkYM, monday);
  }
}

function _acc(
  store: Record<string, PeriodAcc>,
  key: string,
  ms: number,
  artist: string,
  tkKey: string,
  uri: string | null,
  shuf: number,
  skip: number,
  hour: number,
  year?: string,
  yearMonth?: string,
  startDate?: string,
) {
  if (!store[key]) {
    store[key] = {
      ms: 0, plays: 0,
      artistMs: {}, artistPlays: {},
      trackPlays: {},
      artists: new Set(), uris: new Set(),
      shuffle: 0, skip: 0,
      hourPlays: {},
      year, yearMonth, startDate,
    };
  }
  const d = store[key]!;
  d.ms += ms;
  d.plays++;
  d.artistMs[artist]    = (d.artistMs[artist]    ?? 0) + ms;
  d.artistPlays[artist] = (d.artistPlays[artist] ?? 0) + 1;
  d.trackPlays[tkKey]   = (d.trackPlays[tkKey]   ?? 0) + 1;
  d.artists.add(artist);
  if (uri) d.uris.add(uri);
  d.shuffle += shuf;
  d.skip    += skip;
  d.hourPlays[hour] = (d.hourPlays[hour] ?? 0) + 1;
  if (startDate && !d.startDate) d.startDate = startDate;
  if (yearMonth && !d.yearMonth) d.yearMonth = yearMonth;
}

/* ── Builders ───────────────────────────────────────────────── */

function _topArtists(artistMs: Record<string, number>, artistPlays: Record<string, number>): ArtistRecord[] {
  const sorted = Object.entries(artistMs).sort((a, b) => b[1] - a[1]).slice(0, TOP_ARTISTS);
  const maxMs  = sorted[0]?.[1] ?? 1;
  return sorted.map(([name, ms]) => ({
    name,
    hours: round1(ms / 3_600_000),
    plays: artistPlays[name] ?? 0,
    pct:   Math.round((ms / maxMs) * 100),
  }));
}

function _topTracks(trackPlays: Record<string, number>): TrackRecord[] {
  return Object.entries(trackPlays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_TRACKS)
    .map(([tk, plays]) => {
      const [name, artist] = tk.split('|||') as [string, string];
      return { name, artist, plays };
    });
}

function _buildYears(acc: Record<string, PeriodAcc>): YearRecord[] {
  return Object.keys(acc).sort().map(yr => {
    const d = acc[yr]!;
    return {
      key: yr, label: yr, year: yr,
      hours:   round1(d.ms / 3_600_000),
      plays:   d.plays,
      artists: d.artists.size,
      tracks:  d.uris.size,
      shuffle: pct1(d.shuffle, d.plays),
      skip:    pct1(d.skip,    d.plays),
      peak:    peakHourSGT(d.hourPlays),
      note:    '',
      topArtists: _topArtists(d.artistMs, d.artistPlays),
      topTracks:  _topTracks(d.trackPlays),
    };
  });
}

function _buildMonths(acc: Record<string, PeriodAcc>): MonthRecord[] {
  return Object.keys(acc).sort().map(ym => {
    const [yr, mo] = ym.split('-') as [string, string];
    const d = acc[ym]!;
    return {
      key:       ym,
      label:     MONTH_NAMES[parseInt(mo) - 1] ?? ym,
      longLabel: `${MONTH_NAMES[parseInt(mo) - 1] ?? ym} ${yr}`,
      year:      yr,
      month:     parseInt(mo),
      hours:     round1(d.ms / 3_600_000),
      plays:     d.plays,
      artists:   d.artists.size,
      shuffle:   pct1(d.shuffle, d.plays),
      skip:      pct1(d.skip,    d.plays),
      peak:      peakHourSGT(d.hourPlays),
      topArtists: _topArtists(d.artistMs, d.artistPlays),
      topTracks:  _topTracks(d.trackPlays),
    };
  });
}

function _buildWeeks(acc: Record<string, PeriodAcc>): WeekRecord[] {
  return Object.keys(acc).sort().map(wk => {
    const [yrPart, wPart] = wk.split('-W') as [string, string];
    const d  = acc[wk]!;
    const sd = d.startDate ?? '';
    let label = wk, longLabel = wk;
    if (sd) {
      const dt  = new Date(sd + 'T00:00:00');
      label     = dt.getDate() + ' ' + MONTH_NAMES[dt.getMonth()];
      longLabel = label + ' \'' + String(dt.getFullYear()).slice(2);
    }
    const ym = d.yearMonth ?? (yrPart + '-01');
    return {
      key:       wk,
      label,
      longLabel,
      year:      yrPart,
      month:     parseInt((ym.split('-')[1]) ?? '1'),
      yearMonth: ym,
      weekNum:   parseInt(wPart),
      startDate: sd,
      hours:     round1(d.ms / 3_600_000),
      plays:     d.plays,
      artists:   d.artists.size,
      shuffle:   pct1(d.shuffle, d.plays),
      skip:      pct1(d.skip,    d.plays),
      peak:      peakHourSGT(d.hourPlays),
      topArtists: _topArtists(d.artistMs, d.artistPlays),
      topTracks:  _topTracks(d.trackPlays),
    };
  });
}
