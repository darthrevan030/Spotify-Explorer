/**
 * app.js
 * Application entry point.
 *
 * Responsibilities:
 *   - Wire the upload screen (drag-drop, file picker, process button)
 *   - Drive processing progress UI
 *   - initApp(): called by processor.js (or a third-party) once DB is ready
 *   - showUploadScreen(): reset to onboarding state
 */

import { DB, STATE, setGran, setSelYear, setSelMonth, setSelKey } from './store.js';
import { processFiles } from './processor.js';
import { initGranButtons, rebuildDropdowns, rebuildNav } from './nav.js';
import { renderPeriod } from './renderer.js';
import { resolveDefaults, round1 } from './utils.js';

/* ── Upload state ───────────────────────────────────────────── */

let _pendingFiles = [];

/* ── Bootstrap ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  _setupUploadScreen();
  document.getElementById('reloadBtn').addEventListener('click', showUploadScreen);
  initGranButtons();
});

/* ── Upload screen wiring ───────────────────────────────────── */

function _setupUploadScreen() {
  const dz  = document.getElementById('dropZone');
  const fi  = document.getElementById('fileInput');
  const btn = document.getElementById('processBtn');

  fi.addEventListener('change', e => _addFiles([...e.target.files]));

  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    _addFiles([...e.dataTransfer.files]);
  });

  btn.addEventListener('click', () => {
    if (!_pendingFiles.length) return;
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.add('loading');

    const progressWrap = document.getElementById('progressWrap');
    progressWrap.style.display = 'block';

    processFiles(_pendingFiles, _onProgress);
  });
}

function _addFiles(files) {
  // Accept only audio history JSON files; skip duplicates by name
  const valid = files.filter(f =>
    f.name.endsWith('.json') &&
    f.name.toLowerCase().includes('streaming_history_audio')
  );
  valid.forEach(f => {
    if (!_pendingFiles.find(p => p.name === f.name)) _pendingFiles.push(f);
  });
  _renderFileList();
}

function _renderFileList() {
  const list = document.getElementById('fileList');
  const btn  = document.getElementById('processBtn');
  list.innerHTML = '';

  [..._pendingFiles]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(f => {
      const item = document.createElement('li');
      item.className = 'file-item';
      const kb = (f.size / 1024).toFixed(0);
      item.innerHTML = `
        <span class="file-item-name" title="${f.name}">${f.name}</span>
        <span class="file-item-size">${kb} KB</span>
        <span class="file-item-status ok" aria-label="Valid file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Valid
        </span>
      `;
      list.appendChild(item);
    });

  const hasFiles = _pendingFiles.length > 0;
  btn.style.display = hasFiles ? 'flex' : 'none';
  btn.disabled = !hasFiles;
  btn.setAttribute('aria-disabled', hasFiles ? 'false' : 'true');
}

function _onProgress(pct, message) {
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = message;
}

/* ── App init ───────────────────────────────────────────────── */

/**
 * Called by processor.js (or any third-party) once DB is populated.
 * Transitions from the upload screen to the app, resolves the best
 * default period (closest to today, fallback to latest available),
 * and renders the initial view.
 *
 * @param {number} totalPlays - total number of track play records processed
 */
export function initApp(totalPlays) {
  // Resolve defaults based on today's date
  const { selYear, selMonth, weekKey } = resolveDefaults(DB);

  setGran('year');
  setSelYear(selYear);
  setSelMonth(selMonth);
  setSelKey(selYear);   // year gran: key === year string

  // Update header meta
  const firstYear  = DB.year[0]?.year ?? '?';
  const latestYear = DB.year[DB.year.length - 1]?.year ?? '?';
  const th         = round1(DB.year.reduce((s, d) => s + d.hours, 0));

  document.getElementById('hdrMeta').innerHTML =
    `${firstYear} — ${latestYear} &nbsp;·&nbsp; ${(totalPlays || 0).toLocaleString()} plays<br>` +
    `${th.toLocaleString()}h total`;

  // Switch screens
  document.getElementById('uploadScreen').style.display  = 'none';
  document.getElementById('appScreen').style.display     = 'block';
  document.getElementById('appScreen').removeAttribute('aria-hidden');
  document.getElementById('uploadScreen').setAttribute('aria-hidden', 'true');

  // Build controls and render
  rebuildDropdowns();
  rebuildNav();
  renderPeriod(STATE.selKey);
}

/* ── Reset to upload screen ─────────────────────────────────── */

export function showUploadScreen() {
  document.getElementById('appScreen').style.display     = 'none';
  document.getElementById('appScreen').setAttribute('aria-hidden', 'true');
  document.getElementById('uploadScreen').style.display  = 'flex';
  document.getElementById('uploadScreen').removeAttribute('aria-hidden');
  document.getElementById('progressWrap').style.display  = 'none';

  const btn = document.getElementById('processBtn');
  btn.style.display = 'none';
  btn.disabled = true;
  btn.classList.remove('loading');

  _pendingFiles = [];
  document.getElementById('fileList').innerHTML  = '';
  document.getElementById('fileInput').value     = '';
}
