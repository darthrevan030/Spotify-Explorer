/**
 * processor.js
 * ─────────────────────────────────────────────────────────────────
 * Reads Spotify extended streaming history JSON files, aggregates
 * them, and populates the DB store.
 *
 * THIRD-PARTY INTEGRATION
 * ───────────────────────
 * To use your own data source instead of file uploads, replace or
 * supplement this module. Your replacement must call:
 *
 *   import { DB } from './store.js';
 *   import { initApp } from './app.js';
 *
 * Then populate DB.year, DB.month, DB.week with records matching
 * the schema documented in store.js, and call initApp(totalPlays).
 *
 * The schema contract:
 *
 *   YearRecord  { key, label, year, hours, plays, artists, tracks,
 *                 shuffle, skip, peak, note,
 *                 topArtists[{name,hours,plays,pct}],
 *                 topTracks[{name,artist,plays}] }
 *
 *   MonthRecord { key, label, longLabel, year, month,
 *                 hours, plays, artists, shuffle, skip, peak,
 *                 topArtists[…], topTracks[…] }
 *
 *   WeekRecord  { key, label, longLabel, year, month, yearMonth,
 *                 weekNum, startDate,
 *                 hours, plays, artists, shuffle, skip, peak,
 *                 topArtists[…], topTracks[…] }
 * ─────────────────────────────────────────────────────────────────
 */

import { DB } from './store.js';
import { initApp } from './app.js';
import {
  MONTH_NAMES, round1, pct1,
  readFileText, tick, getISOWeek, getMondayStr, peakHourSGT,
} from './utils.js';

const TOP_ARTISTS = 5;
const TOP_TRACKS  = 5;
const CHUNK_SIZE  = 5_000;

/* ── Public API ────────────────────────────────────────────── */

/**
 * Process an array of File objects.
 * Emits progress via onProgress(pct: 0–100, message: string).
 */
export async function processFiles(files, onProgress = () => {}) {
  DB.year = []; DB.month = []; DB.week = [];

  const yearAcc  = {};
  const monthAcc = {};
  const weekAcc  = {};

  // 1. Read all files
  const allRecords = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round((i / files.length) * 25), `Reading ${files[i].name}…`);
    try {
      const text = await readFileText(files[i]);
      allRecords.push(...JSON.parse(text));
    } catch (e) {
      console.error('[processor] Failed to read', files[i].name, e);
    }
  }

  onProgress(25, `Filtering ${allRecords.length.toLocaleString()} records…`);
  await tick();

  // 2. Filter to music tracks only (exclude podcasts, audiobooks, video)
  const tracks = allRecords.filter(s => s.master_metadata_track_name);
  const total  = tracks.length;

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
  DB.year  = _buildYears(yearAcc);
  DB.month = _buildMonths(monthAcc);
  DB.week  = _buildWeeks(weekAcc);

  onProgress(100, `Done — ${total.toLocaleString()} plays loaded.`);
  await tick();

  initApp(total);
}

/* ── Internal aggregation ───────────────────────────────────── */

function _processChunk(chunk, yearAcc, monthAcc, weekAcc) {
  for (const s of chunk) {
    const ts     = s.ts || '';
    const yr     = ts.slice(0, 4);
    const ym     = ts.slice(0, 7);
    const hour   = parseInt(ts.slice(11, 13)) || 0;
    const artist = s.master_metadata_album_artist_name || 'Unknown';
    const tkKey  = (s.master_metadata_track_name || '') + '|||' + artist;
    const ms     = s.ms_played || 0;
    const uri    = s.spotify_track_uri || '';
    const shuf   = s.shuffle  ? 1 : 0;
    const skip   = s.skipped  ? 1 : 0;

    // ISO week + Monday date
    const dt      = new Date(ts.replace('Z', '+00:00'));
    const iso     = getISOWeek(dt);
    const wkKey   = `${iso.year}-W${String(iso.week).padStart(2, '0')}`;
    const monday  = getMondayStr(dt);
    const wkYM    = monday.slice(0, 7);

    _acc(yearAcc,  yr,    ms, artist, tkKey, uri, shuf, skip, hour);
    _acc(monthAcc, ym,    ms, artist, tkKey, null, shuf, skip, hour, yr);
    _acc(weekAcc,  wkKey, ms, artist, tkKey, null, shuf, skip, hour, yr, wkYM, monday);
  }
}

function _acc(store, key, ms, artist, tkKey, uri, shuf, skip, hour, year, yearMonth, startDate) {
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
  const d = store[key];
  d.ms += ms;
  d.plays++;
  d.artistMs[artist]     = (d.artistMs[artist]    || 0) + ms;
  d.artistPlays[artist]  = (d.artistPlays[artist] || 0) + 1;
  d.trackPlays[tkKey]    = (d.trackPlays[tkKey]   || 0) + 1;
  d.artists.add(artist);
  if (uri) d.uris.add(uri);
  d.shuffle += shuf;
  d.skip    += skip;
  d.hourPlays[hour] = (d.hourPlays[hour] || 0) + 1;
  if (startDate && !d.startDate) d.startDate = startDate;
  if (yearMonth && !d.yearMonth) d.yearMonth = yearMonth;
}

/* ── Builders ───────────────────────────────────────────────── */

function _topArtists(artistMs, artistPlays) {
  const sorted = Object.entries(artistMs).sort((a, b) => b[1] - a[1]).slice(0, TOP_ARTISTS);
  const maxMs  = sorted[0]?.[1] || 1;
  return sorted.map(([name, ms]) => ({
    name,
    hours: round1(ms / 3_600_000),
    plays: artistPlays[name] || 0,
    pct:   Math.round((ms / maxMs) * 100),
  }));
}

function _topTracks(trackPlays) {
  return Object.entries(trackPlays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_TRACKS)
    .map(([tk, plays]) => {
      const [name, artist] = tk.split('|||');
      return { name, artist, plays };
    });
}

function _buildYears(acc) {
  return Object.keys(acc).sort().map(yr => {
    const d = acc[yr];
    return {
      key: yr, label: yr, year: yr,
      hours:   round1(d.ms / 3_600_000),
      plays:   d.plays,
      artists: d.artists.size,
      tracks:  d.uris.size,
      shuffle: pct1(d.shuffle, d.plays),
      skip:    pct1(d.skip,    d.plays),
      peak:    peakHourSGT(d.hourPlays),
      note:    '',          // callers may inject year notes after processing
      topArtists: _topArtists(d.artistMs, d.artistPlays),
      topTracks:  _topTracks(d.trackPlays),
    };
  });
}

function _buildMonths(acc) {
  return Object.keys(acc).sort().map(ym => {
    const [yr, mo] = ym.split('-');
    const d = acc[ym];
    return {
      key:       ym,
      label:     MONTH_NAMES[parseInt(mo) - 1],
      longLabel: `${MONTH_NAMES[parseInt(mo) - 1]} ${yr}`,
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

function _buildWeeks(acc) {
  return Object.keys(acc).sort().map(wk => {
    const [yrPart, wPart] = wk.split('-W');
    const d  = acc[wk];
    const sd = d.startDate || '';
    let label = wk, longLabel = wk;
    if (sd) {
      const dt  = new Date(sd + 'T00:00:00');
      label     = dt.getDate() + ' ' + MONTH_NAMES[dt.getMonth()];
      longLabel = label + ' \'' + String(dt.getFullYear()).slice(2);
    }
    const ym = d.yearMonth || (yrPart + '-01');
    return {
      key:       wk,
      label,
      longLabel,
      year:      yrPart,
      month:     parseInt((ym.split('-')[1]) || 1),
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
