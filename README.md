# Notelet

Offline-first text notes, always within reach on your Amazfit watch.

Full requirements: [docs/architecture.md](docs/architecture.md) (see §7.2 for why this is a single watch app, not a watch + separate mobile app).

## Overview

Notelet is a single Zepp OS watch app with one companion surface: the app's own **Settings page**, which opens inside the Zepp phone app. There is no separate mobile app.

| Component | Role | Stack |
|---|---|---|
| Watch app (root: `page/`, `app-side/`, `utils/`) | Browse and read notes, offline | Zepp OS 5.0, API 4.4 |
| Settings page (`setting/`) | Create/edit/delete folders and notes, trigger sync | Zepp OS Settings App (phone-side webview) |

The watch itself is still read-only — all note/folder management happens in the Settings page, which writes to `settingsStorage`. The watch's own `app-side` Side Service reads from there and serves it to the Device App over the Zepp OS-provided Bluetooth channel, and the watch keeps its own local offline copy. Everything works fully offline once synced.

Target devices: Amazfit Balance 3 (round, 480×480), Amazfit Balance Ultra (round, 480×480), Amazfit Bip Max (square, 432×514).

## Project Structure

```text
Notelet/
├── app.js, app.json    # Zepp OS watch app entry + manifest
├── app-side/           # Side Service: reads Settings-managed data, serves PULL_SYNC
├── page/                # Watch screens: home, folder, note-detail
├── setting/             # Settings page: folder/note CRUD, sync trigger, sync status
├── utils/               # Shared watch-side helpers (storage, sync, layout)
└── assets/              # Watch app icons (per-target: gt.r, gt.s)
```

## Status

| Phase | Scope | Status |
|---|---|---|
| Platform validation | Phone ↔ watch communication | Resolved — the Settings page's `settingsStorage` ↔ Side Service ↔ Device App channel *is* the real, working architecture (docs/architecture.md §7) |
| Watch foundation | Home/folder/note-detail screens, offline local storage | Done |
| Settings CRUD | Folder/note create/delete/pin, sync trigger, sync status | Done — this is the permanent management surface, not a stand-in |
| Watch sync | Pull, validate, and fully replace local data from Settings | Done |
| Device adaptation | Round safe area, square space use, consistent margins | Done — verified by geometry **and** on a real Amazfit Bip Max (fixed a real top-clipping bug the Simulator never showed) |
| Testing | Unit/integration/device/E2E | No automated suite; extensive manual testing throughout (Simulator + real Bip Max) |

All hardcoded mock/seed data has been removed — an untouched install starts genuinely empty on both the watch and in Settings.

See [docs/architecture.md](docs/architecture.md) §12 (sync model), §18 (implementation constraints), and §19 (test coverage) for detail.

## Prerequisites

- Node.js 18+ and npm
- [Zepp OS CLI (`zeus`)](https://docs.zepp.com/docs/guides/quick-start/) and the Zepp app, paired with a supported watch (or the Zepp OS Simulator)

## Running the App

```bash
npm install -g @zeppos/zeus-cli   # one-time
cd Notelet                        # project root
zeus login
zeus dev                          # Simulator
# or, for a real paired watch:
zeus preview
```

`zeus dev` connects to the Zepp OS Simulator if one is running; `zeus preview` generates a QR code to scan with the Zepp app's Developer Mode to sideload onto a real watch instead.

**Watch app**: on first launch, Home shows an empty state briefly, then syncs in the background and shows Pinned / folders / Search plus a "🔄 Last synced HH:MM" row — tap it to sync again on demand. Tap a folder to list its notes, tap a note to read its full text (with font size +/- and a keep-awake toggle). Everything you see after that first sync is read from the watch's own local storage, not fetched live — close the Zepp app and reopen Notelet on the watch to confirm folders and notes are still there.

**Settings page**: open it from the Zepp app's mini-program settings (or the Simulator's settings devtools panel). It has About, Sync, Folders, and Notes sections:
- **Folders/Notes** — create, delete, and pin/unpin right here. This is the real, permanent way to manage your data.
- **Check for updates** — writes to `settingsStorage`, which `app-side/index.js` observes and pushes to the watch via `this.call()` (the only channel a Settings App has to reach the Device App), triggering the same sync as the watch's own button. The watch reports real folder/note counts back the same way.

## Watch-Side Sync

`utils/syncStore.js`, `utils/syncMerge.js`, `utils/payloadValidation.js`, `utils/syncStatus.js`, and `utils/syncClient.js` implement the watch's sync (docs/architecture.md §12): pull a `PULL_SYNC` payload from `app-side`, validate its shape, and **fully replace** the watch's own `folders`/`notes` JSON files with it, then record `lastSyncedAt`/status for the home screen.

This is a full replace rather than an incremental tombstone-based merge deliberately: `app-side` always serves the complete current list from Settings (not a diff), so anything the watch has stored that the payload doesn't mention gets dropped — not just entries explicitly flagged `deleted: true`. An earlier tombstone-only version left orphaned entries permanently stuck on the watch whenever their id just stopped being served (this happened for real: the original hardcoded mock notes stayed pinned on the watch forever after the mock data was removed from the code, since no tombstone existed for ids the payload had simply stopped mentioning).

The watch pages (`page/home`, `page/folder`, `page/note-detail`) only ever read from this local store, never live from `app-side`, which is what keeps notes available after the phone disconnects.

## Testing

```bash
# Syntax-check all page/app scripts
for f in $(find . -path './node_modules' -prune -o -name '*.js' -print); do
  node --input-type=module --check < "$f"
done
```

There is no automated test suite (unit/integration/E2E). What exists instead is real, continuous manual testing throughout development — including on a physical Amazfit Bip Max, which is how the top-clipping layout bug (docs/architecture.md §18) was actually found, and how several environment-specific bugs were caught along the way:

- `SCROLL_LIST` doesn't render at all in this environment — all lists are built from `BUTTON`/`TEXT` widgets instead
- The legacy `hmApp.gotoPage` API doesn't exist — navigation uses `@zos/router`'s `push`
- An unguarded Side Service `this.call()` can crash the whole Side Service (and take the watch app down with it) if the Device App isn't connected
- In the Settings page, mutating state alone never redraws the page — only an actual `settingsStorage` write does

Full details in [docs/architecture.md §18](docs/architecture.md).

The critical end-to-end acceptance test (docs/architecture.md §19.2) — create a note, sync it, disconnect, read it offline on the watch — **can** be exercised today, since Settings and the watch are already connected through a real, working channel.

## Design Principles

- **Offline-first** — no feature required for core note-taking depends on connectivity.
- **Settings page is the source of truth** — the watch holds a synced, read-only copy.
- **Text only** — no rich text, images, or attachments in the MVP.
- **One codebase, adaptive UI** — no per-device forks; layouts adapt to round vs. square screens at runtime.
