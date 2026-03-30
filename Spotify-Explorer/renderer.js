/**
 * renderer.js
 * Renders the left panel (hero + artists + tracks) and the right
 * panel (chart + stats) from a single DB record.
 *
 * renderPeriod(key) is the main entry point called by nav.js and app.js.
 */

import { STATE, findRecord, totalHours, setSelKey } from './store.js';
import { activateNavBtn, scrollNavTo } from './nav.js';
import { buildChart } from './chart.js';
import { esc, MONTH_NAMES } from './utils.js';

/* ── Main entry ─────────────────────────────────────────────── */

export function renderPeriod(key) {
  // Preserve scroll so tab switching doesn't jump the page
  const scrollY = window.scrollY;

  setSelKey(key);
  const d = findRecord(key);
  if (!d) return;

  activateNavBtn(key);
  _renderLeft(d);
  _renderRight(d);
  scrollNavTo(key);

  window.scrollTo({ top: scrollY, behavior: 'instant' });
}

/* ── Left panel ─────────────────────────────────────────────── */

function _renderLeft(d) {
  const panel = document.getElementById('leftPanel');
  panel.innerHTML = `
    <section class="hero panel-enter" aria-label="Period overview">
      <div class="hero-key ${_heroSizeClass()}" aria-hidden="true">${esc(_heroKeyText(d))}</div>
      <div>
        <div class="hero-lbl">hours listened</div>
        <div class="hero-hours" aria-label="${d.hours} hours">${d.hours}h</div>
        <div class="hero-sub">${_heroSubline(d)}</div>
      </div>
    </section>
    <h2 class="sec-head">Top artists</h2>
    <div class="artists" role="list">${_artistsHTML(d.topArtists)}</div>
    <h2 class="sec-head">Top tracks</h2>
    <div class="tracks-grid" role="list">${_tracksHTML(d.topTracks)}</div>
  `;
}

function _heroKeyText(d) {
  if (STATE.gran === 'year')  return d.year;
  if (STATE.gran === 'month') return MONTH_NAMES[d.month - 1];
  return `W${String(d.weekNum).padStart(2, '0')}`;
}

function _heroSizeClass() {
  return STATE.gran === 'year' ? '' : STATE.gran === 'month' ? 'sm' : 'xs';
}

function _heroSubline(d) {
  const p = (d.plays   || 0).toLocaleString();
  const a = (d.artists || 0).toLocaleString();
  const t = d.tracks ? ` &nbsp;·&nbsp; <span>${d.tracks.toLocaleString()}</span> tracks` : '';
  return `<span>${p}</span> plays &nbsp;·&nbsp; <span>${a}</span> artists${t}`;
}

function _artistsHTML(artists = []) {
  if (!artists.length) return '<p class="empty-state">No artist data</p>';
  return artists.map((a, i) => `
    <div class="artist-row" role="listitem">
      <span class="artist-rank" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <div class="artist-info">
        <div class="artist-name">${esc(a.name)}</div>
        <div class="artist-bar-wrap"
             role="progressbar"
             aria-valuenow="${a.pct}"
             aria-valuemin="0"
             aria-valuemax="100"
             aria-label="${esc(a.name)}: ${a.hours}h, ${(a.plays || 0).toLocaleString()} plays">
          <div class="artist-bar-fill" style="width:${a.pct}%"></div>
        </div>
      </div>
      <div class="artist-stats">
        <div class="artist-hours">${a.hours}h</div>
        <div class="artist-plays">${(a.plays || 0).toLocaleString()} plays</div>
      </div>
    </div>
  `).join('');
}

function _tracksHTML(tracks = []) {
  if (!tracks.length) return '<p class="empty-state">No track data</p>';
  return tracks.map((t, i) => `
    <article class="track-card" role="listitem"
             aria-label="#${i + 1}: ${esc(t.name)} by ${esc(t.artist)}, ${t.plays} plays">
      <div class="track-rank-bg" aria-hidden="true">${i + 1}</div>
      <div class="track-name">${esc(t.name)}</div>
      <div class="track-artist">${esc(t.artist)}</div>
      <div class="track-plays">${t.plays} plays</div>
    </article>
  `).join('');
}

/* ── Right panel ────────────────────────────────────────────── */

function _renderRight(d) {
  const th   = totalHours();
  const pct  = (STATE.gran === 'year' && th)
    ? ((d.hours / th) * 100).toFixed(1) + '% of lifetime'
    : '';
  const avg  = d.plays ? Math.round(d.hours * 60 / d.plays) : 0;
  const note = d.note || '';

  document.getElementById('rightPanel').innerHTML = `
    <div class="chart-sec">
      <p class="sec-head">Overview · hours</p>
      <div class="chart-wrap">
        <canvas id="sideChart" role="img"
                aria-label="Bar chart of hours listened in the current view. Selected period highlighted.">
        </canvas>
      </div>
    </div>
    ${note ? `<p class="note-blk">${esc(note)}</p>` : ''}
    <div class="mini-grid">
      <div class="mini-stat">
        <div class="mini-lbl">Shuffle</div>
        <div class="mini-val">${d.shuffle}%</div>
      </div>
      <div class="mini-stat">
        <div class="mini-lbl">Skip rate</div>
        <div class="mini-val">${d.skip}%</div>
      </div>
      <div class="mini-stat">
        <div class="mini-lbl">Peak hour</div>
        <div class="mini-val">${d.peak || '—'}</div>
      </div>
      <div class="mini-stat">
        <div class="mini-lbl">Artists</div>
        <div class="mini-val">${(d.artists || 0).toLocaleString()}</div>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-row-lbl">Hours</div>
      <div class="stat-row-val">${d.hours}h</div>
      ${pct ? `<div class="stat-row-sub">${pct}</div>` : ''}
    </div>
    <div class="stat-row">
      <div class="stat-row-lbl">Plays</div>
      <div class="stat-row-val">${(d.plays || 0).toLocaleString()}</div>
      <div class="stat-row-sub">avg ${avg} min per play</div>
    </div>
    ${d.tracks ? `
      <div class="stat-row">
        <div class="stat-row-lbl">Unique tracks</div>
        <div class="stat-row-val">${d.tracks.toLocaleString()}</div>
      </div>` : ''}
  `;

  // Build chart after DOM is ready
  buildChart();
}
