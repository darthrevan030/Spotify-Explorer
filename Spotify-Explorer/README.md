# Spotify History Explorer

A zero-dependency, client-side web app that visualises your Spotify extended streaming history — by year, month, and week. All processing happens in the browser; no data ever leaves your device.

---

## Features

- **Drag-and-drop file loading** — drop all your `Streaming_History_Audio_*.json` files at once
- **Three time granularities** — Year / Month / Week with hierarchical dropdowns
- **Smart defaults** — opens on the current date (or the latest available period if today has no data)
- **Per-period stats** — top 5 artists (hours + play count), top 5 tracks, shuffle rate, skip rate, peak listening hour
- **Overview chart** — bar chart of all periods in the current view, selected period highlighted
- **Fully accessible** — WCAG AA contrast, visible focus rings, ARIA roles, keyboard navigable, `prefers-reduced-motion` respected
- **Third-party integration** — replace `processor.js` with your own data source; the rest of the app drives itself from the DB schema

---

## Getting started

### 1. Get your Spotify data

1. Log in at [spotify.com](https://spotify.com)
2. Go to **Account → Privacy → Download your data**
3. Request your **Extended streaming history** (not the basic history)
4. Wait for the email (can take a few days), then download and unzip

### 2. Run the app

The app is a plain HTML/CSS/JS project — no build step required.

**Option A — open directly**
```
open index.html
```
> Some browsers restrict `file://` imports. If modules fail to load, use Option B.

**Option B — local server (recommended)**
```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code
# Install the "Live Server" extension, then right-click index.html → Open with Live Server
```
Then visit `http://localhost:8080`.

### 3. Load your files

Drop all `Streaming_History_Audio_*.json` files into the upload area (or click to browse). Video history files are ignored automatically. Click **Process files** and wait a few seconds while your history is aggregated.

---

## Project structure

```
spotify-explorer/
├── index.html              # Entry point — HTML shell only, no inline JS/CSS
│
├── css/
│   ├── tokens.css          # All design tokens (colours, spacing, typography, z-index)
│   ├── base.css            # Reset, body, focus rings, skip link, reduced-motion
│   ├── upload.css          # Upload / onboarding screen styles
│   ├── app.css             # App shell: header, controls bar, main grid layout
│   └── components.css      # Reusable UI: hero, artist list, track grid, right-panel stats
│
└── js/
    ├── utils.js            # Pure helpers (no DOM, no state): dates, escaping, file reading
    ├── processor.js        # Reads files → aggregates raw streams → populates DB
    ├── store.js            # Centralised DB + UI state; accessor functions
    ├── nav.js              # Granularity buttons, contextual dropdowns, period strip
    ├── renderer.js         # Renders left panel (hero/artists/tracks) + right panel (stats)
    ├── chart.js            # Chart.js overview bar chart
    └── app.js              # Entry point: upload wiring, initApp(), showUploadScreen()
```

### Module dependency graph

```
app.js
 ├── processor.js  →  store.js, utils.js
 ├── nav.js        →  store.js, renderer.js, utils.js
 ├── renderer.js   →  store.js, nav.js, chart.js, utils.js
 ├── chart.js      →  store.js
 └── store.js      (no imports — leaf module)
```

---

## Third-party integration

The app is designed to be data-source agnostic. To use your own data instead of (or alongside) Spotify file uploads:

### 1. Populate the DB

```js
import { DB } from './js/store.js';
import { initApp } from './js/app.js';

// Populate DB arrays before calling initApp
DB.year  = [ /* YearRecord[] */  ];
DB.month = [ /* MonthRecord[] */ ];
DB.week  = [ /* WeekRecord[] */  ];

initApp(totalPlayCount);
```

### 2. Record schemas

**YearRecord**
```ts
{
  key:        string;          // e.g. "2024"
  label:      string;          // display label, same as key for years
  year:       string;
  hours:      number;          // total hours (1 decimal place)
  plays:      number;          // total play count
  artists:    number;          // unique artist count
  tracks:     number;          // unique track count (URI-based)
  shuffle:    number;          // shuffle % (0–100, 1dp)
  skip:       number;          // skip rate % (0–100, 1dp)
  peak:       string;          // e.g. "7AM" (SGT), or "—"
  note:       string;          // optional editorial note shown in right panel
  topArtists: ArtistRecord[];
  topTracks:  TrackRecord[];
}
```

**MonthRecord**
```ts
{
  key:        string;          // e.g. "2024-04"
  label:      string;          // e.g. "Apr"
  longLabel:  string;          // e.g. "Apr 2024"
  year:       string;
  month:      number;          // 1–12
  hours:      number;
  plays:      number;
  artists:    number;
  shuffle:    number;
  skip:       number;
  peak:       string;
  topArtists: ArtistRecord[];
  topTracks:  TrackRecord[];
}
```

**WeekRecord**
```ts
{
  key:        string;          // e.g. "2024-W14"
  label:      string;          // e.g. "1 Apr"
  longLabel:  string;          // e.g. "1 Apr '24"
  year:       string;
  month:      number;          // 1–12, month the week starts in
  yearMonth:  string;          // e.g. "2024-04"
  weekNum:    number;          // ISO week number
  startDate:  string;          // Monday date, YYYY-MM-DD
  hours:      number;
  plays:      number;
  artists:    number;
  shuffle:    number;
  skip:       number;
  peak:       string;
  topArtists: ArtistRecord[];
  topTracks:  TrackRecord[];
}
```

**ArtistRecord**
```ts
{
  name:   string;
  hours:  number;   // listening hours (1dp)
  plays:  number;   // play count
  pct:    number;   // 0–100, relative to #1 artist in this period
}
```

**TrackRecord**
```ts
{
  name:   string;
  artist: string;
  plays:  number;
}
```

### 3. Custom data source example

Replace the upload screen entirely and call `initApp()` directly:

```js
// my-integration.js
import { DB } from './js/store.js';
import { initApp } from './js/app.js';

async function loadFromAPI() {
  const res  = await fetch('/api/listening-history');
  const data = await res.json();

  DB.year  = data.years;
  DB.month = data.months;
  DB.week  = data.weeks;

  initApp(data.totalPlays);
}

loadFromAPI();
```

---

## Design system

All visual decisions live in `css/tokens.css`. To retheme the app, only edit the custom properties there — no other file needs touching.

| Token group     | Examples                                            |
|-----------------|-----------------------------------------------------|
| Colours         | `--color-bg`, `--color-accent`, `--color-muted`     |
| Typography      | `--font-display`, `--font-mono`, `--text-base`      |
| Spacing         | `--space-1` (4px) … `--space-12` (48px)            |
| Radii           | `--radius`, `--radius-lg`                           |
| Z-index         | `--z-nav` (30), `--z-modal` (100), `--z-toast` (1000) |
| Transitions     | `--duration-fast` (150ms), `--ease-out`             |

---

## Accessibility

- WCAG AA contrast on all text/background pairs
- All interactive elements have visible focus rings (`outline: 2px solid var(--color-accent)`)
- Skip-to-content link at the top of the page
- `role="tablist"` / `role="tab"` / `aria-selected` on the period nav strip
- `aria-live="polite"` on both left and right panels for screen-reader announcements
- `aria-label` on all icon-only buttons and SVG icons
- `prefers-reduced-motion` disables all animations globally
- `<label for>` associations on all form inputs
- Minimum 44×44px touch targets on all interactive elements

---

## Browser support

Any modern browser with ES module support (Chrome 61+, Firefox 60+, Safari 10.1+, Edge 16+). No transpilation or bundling required.

---

## Data privacy

All processing is entirely local. Your JSON files are read by the browser's `FileReader` API and never uploaded to any server. Closing or refreshing the page discards all data — nothing is persisted to `localStorage` or any other storage.
