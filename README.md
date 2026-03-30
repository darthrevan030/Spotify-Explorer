# Spotify History Explorer

A client-side React app that visualises your Spotify extended streaming history — by year, month, and week. All processing happens in the browser; no data ever leaves your device.

---

## Features

- **Drag-and-drop file loading** — drop all your `Streaming_History_Audio_*.json` files at once
- **Three time granularities** — Year / Month / Week with hierarchical dropdowns
- **Smart defaults** — opens on the current date (or the latest available period if today has no data)
- **Per-period stats** — top 5 artists (hours + play count), top 5 tracks, shuffle rate, skip rate, peak listening hour
- **Overview chart** — bar chart of all periods in the current view, selected period highlighted
- **Fully accessible** — WCAG AA contrast, visible focus rings, ARIA roles, keyboard navigable, `prefers-reduced-motion` respected

---

## Getting started

### 1. Get your Spotify data

1. Log in at [spotify.com](https://spotify.com)
2. Go to **Account → Privacy → Download your data**
3. Request your **Extended streaming history** (not the basic history)
4. Wait for the email (can take a few days), then download and unzip

### 2. Install and run

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173`.

### 3. Load your files

Drop all `Streaming_History_Audio_*.json` files into the upload area (or click to browse). Video history files are ignored automatically. Click **Process files** and wait a few seconds while your history is aggregated.

---

## Scripts

| Command             | Description                        |
|-------------------  |------------------------------------|
| `npm run dev`       | Start Vite dev server (HMR)        |
| `npm run build`     | Type-check + production build      |
| `npm run preview`   | Preview the production build       |
| `npm run typecheck` | Run `tsc --noEmit` only            |

---

## Project structure

``` markdown
spotify-explorer/
├── index.html                  # Vite entry point
├── vite.config.ts
├── tsconfig*.json
│
└── src/
    ├── main.tsx                # ReactDOM.createRoot + global CSS
    ├── App.tsx                 # Screen router (upload | app)
    │
    ├── types/index.ts          # All shared TypeScript interfaces
    │
    ├── lib/
    │   ├── utils.ts            # Pure helpers: dates, rounding, file reading
    │   └── processor.ts        # Reads files → aggregates streams → returns DB
    │
    ├── store/
    │   └── appContext.tsx      # Context + useReducer; accessor hooks
    │
    ├── styles/
    │   ├── tokens.css          # All design tokens (global)
    │   └── base.css            # Reset, body, focus rings, skip link (global)
    │
    └── components/
        ├── UploadScreen/       # Drag-drop, file list, progress bar
        ├── AppScreen/          # Layout shell (header + controls + panels)
        ├── Header/             # Title, meta, reload button
        ├── Controls/           # GranularityToggle, PeriodDropdowns, NavStrip
        ├── LeftPanel/          # Hero, ArtistList, TrackGrid
        ├── RightPanel/         # OverviewChart, MiniStats, StatRows
        └── shared/             # SkipLink
```

Each component folder contains a `.tsx` file and a co-located `.module.css` file.

---

## Tech stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Framework   | React 18                                |
| Build tool  | Vite 5                                  |
| Language    | TypeScript (strict)                     |
| Styling     | CSS Modules + CSS custom properties     |
| Chart       | Chart.js 4 (direct, no wrapper)         |
| State       | React Context + `useReducer`            |
| Data        | Client-side only — `FileReader` API     |

---

## Data schemas

### YearRecord

```ts
{
  key:        string;          // e.g. "2024"
  label:      string;
  year:       string;
  hours:      number;          // total hours (1dp)
  plays:      number;
  artists:    number;          // unique artist count
  tracks:     number;          // unique track count (URI-based)
  shuffle:    number;          // shuffle % (0–100)
  skip:       number;          // skip rate % (0–100)
  peak:       string;          // e.g. "7AM" (SGT), or "—"
  note:       string;          // optional editorial note
  topArtists: ArtistRecord[];
  topTracks:  TrackRecord[];
}
```

### MonthRecord

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

### WeekRecord

```ts
{
  key:        string;          // e.g. "2024-W14"
  label:      string;          // e.g. "1 Apr"
  longLabel:  string;          // e.g. "1 Apr '24"
  year:       string;
  month:      number;
  yearMonth:  string;          // e.g. "2024-04"
  weekNum:    number;          // ISO week number
  startDate:  string;          // Monday, YYYY-MM-DD
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

### ArtistRecord / TrackRecord

```ts
ArtistRecord { name: string; hours: number; plays: number; pct: number; }
TrackRecord  { name: string; artist: string; plays: number; }
```

---

## Design system

All visual tokens live in `src/styles/tokens.css`. To retheme the app, only edit the custom properties there.

| Token group | Examples                                                  |
|-------------|----------                                                 |
| Colours     | `--color-bg`, `--color-accent` (#c8f060), `--color-muted` |
| Typography  | `--font-display`, `--font-mono`, `--text-base`            |
| Spacing     | `--space-1` (4px) … `--space-12` (48px)                   |
| Radii       | `--radius`, `--radius-lg`                                 |
| Transitions | `--duration-fast` (150ms), `--ease-out`                   |

---

## Accessibility

- WCAG AA contrast on all text/background pairs
- Visible focus rings (`outline: 2px solid var(--color-accent)`)
- Skip-to-content link
- `role="tablist"` / `aria-selected` on the period nav strip
- `aria-live="polite"` on both content panels
- `prefers-reduced-motion` disables all animations globally
- Minimum 44×44px touch targets

---

## Data privacy

All processing is entirely local. Your JSON files are read by the browser's `FileReader` API and never uploaded to any server. Closing or refreshing the page discards all data — nothing is persisted.
