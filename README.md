# Notelet

Offline-first text notes, always within reach — create and organize notes on your phone, then read them on your Amazfit watch, even with no connectivity.

Full requirements: [.CLAUDE/srs.md](.CLAUDE/srs.md)

## Overview

Notelet is two applications sharing one product:

| Component | Role | Stack |
|---|---|---|
| Mobile app (`mobile/`) | Source of truth — create, edit, organize, search notes | React Native, TypeScript, Expo, SQLite |
| Watch app (root) | Offline reading companion — browse and read synced notes | Zepp OS 5.0, API 4.4 |

The watch is read-only in the MVP; it holds a synchronized local copy of whatever the mobile app sends it. All core operations on both sides work fully offline.

Target devices: Amazfit Balance 3 (round, 480×480), Amazfit Balance Ultra (round, 480×480), Amazfit Bip Max (square, 432×514).

## Project Structure

```
Notelet/
├── app.js, app.json          # Zepp OS watch app entry + manifest
├── app-side/                 # Watch-side data service (mock data for now)
├── page/                     # Watch screens: home, folder, note-detail
├── setting/                  # Watch app settings page
├── utils/                    # Shared watch-side helpers
├── assets/                   # Watch app icons (per-target: gt.r, gt.s)
└── mobile/                   # React Native (Expo) companion app
    ├── App.tsx
    └── src/
        ├── database/         # SQLite schema, migrations, repositories
        ├── services/         # Folder/note/sync service façades
        ├── navigation/        # Stack navigator + route param types
        ├── screens/           # Home, note list, search, detail, editor
        ├── components/        # Shared list rows, empty states, prompt modal
        ├── models, types/    # Domain types
        ├── hooks/, utils/, constants/
```

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 — Platform validation | Phone ↔ watch communication POC | Not started |
| 1 — Watch foundation | Home/folder/note-detail screens, mock data, offline storage | Done |
| 2 — Mobile foundation | Expo project, SQLite schema, migrations, repositories | Done |
| 3 — Mobile UI | Screens for folders, notes, search, pinned, recent, note editor | Done |
| 4 — Sync engine | Protocol, change detection, retry, error handling | Done (against a mock transport — see below) |
| 5 — Watch integration | Receive/validate/apply sync payloads, local storage, sync status | Done (against app-side's mock payload — see below) |
| 6 — Device adaptation | Round safe area, square space use, consistent margins across all watch screens | Done (verified by geometry, not yet on a physical device) |
| 7 — Testing | Unit/integration/device/E2E | Not started |

The mobile app and watch app are currently independent — there is no live sync between them yet. The watch app runs entirely on seeded mock data (`utils/constants.js`).

## Prerequisites

- Node.js 18+ and npm
- For the watch app: [Zepp OS CLI (`zeus`)](https://docs.zepp.com/docs/guides/quick-start/) and the Zepp app, paired with a supported watch (or the Zepp OS Simulator)
- For the mobile app: Xcode (iOS) and/or Android Studio, or the Expo Go app on a physical device

## Running the Watch App

```bash
npm install -g @zeppos/zeus-cli   # one-time
cd Notelet                        # project root
zeus login
zeus dev
```

Scan the QR code from `zeus dev` with the Zepp app to sideload onto a paired watch, or open the project in the Zepp OS Simulator.

**What to expect**: on first launch, Home shows an empty state briefly, then syncs in the background and shows Pinned / folders / Search plus a "🔄 Last synced HH:MM" row — tap it to sync again on demand. Tap a folder to list its notes, tap a note to read its full text with vertical scrolling. Everything you see after that first sync is read from the watch's own local storage, not fetched live — turn off Bluetooth/close the Zepp app and reopen Notelet on the watch to confirm folders and notes are still there.

## Watch-Side Sync (Phase 5)

`utils/syncStore.js`, `utils/syncMerge.js`, `utils/payloadValidation.js`, `utils/syncStatus.js`, and `utils/syncClient.js` implement the watch's half of sync (SRS §39–41): pull a `PULL_SYNC` payload from `app-side`, validate its shape, and merge it into the watch's own `folders`/`notes` JSON files — upserting changed entities and removing deleted ones — then record `lastSyncedAt`/status for the home screen. The watch pages (`page/home`, `page/folder`, `page/note-detail`) only ever read from this local store, never live from `app-side`, which is what keeps notes available after the phone disconnects.

As with the mobile sync engine (Phase 4), the real transport is still unbuilt — `app-side/index.js`'s `PULL_SYNC` handler serves the same mock catalog (`utils/constants.js`) converted into the wire format, standing in for what will eventually be the real mobile app's data once Phase 0's communication POC picks the concrete Zepp SDK APIs. Swapping that in only changes `buildSyncPayload()` in `app-side/index.js` — the validation, merge, and storage logic on the watch doesn't change.

## Device Adaptation (Phase 6)

`utils/layout.js` defines the safe-margin ratios every watch layout file shares: a wider margin on round displays (Balance 3 / Balance Ultra, 480×480), where content near the bezel corners gets visually clipped, and a tighter one on square (Bip Max, 432×514), which uses nearly its full rectangle. Each `*.page.r.layout.js` / `*.page.s.layout.js` pair computes its list/text bounds from this shared margin against its own `DEVICE_WIDTH`, rather than hard-coded pixel offsets per screen — so home, folder, and note-detail stay visually consistent, and a fourth screen added later gets the same treatment for free. This also fixed a pre-existing bug where the folder screen's pin marker was positioned against the full device width instead of the (narrower) list container, which would have clipped it on-device.

This has been verified by geometry (margins, list/text widths recomputed and checked non-negative and sane for both 480 and 432 device widths) and code review, not yet against a physical Balance 3 / Balance Ultra / Bip Max or the Zepp OS Simulator — that's the Phase 7 device-testing matrix (SRS §58).

## Running the Mobile App

```bash
cd mobile
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), `w` (web), or scan the QR code with Expo Go.

**What to expect**: a Home screen with Search / Pinned / Recent and your Folders. From there you can:

- Create/rename/delete folders (long-press a folder for rename/delete)
- Tap a folder, Pinned, or Recent to see its notes
- Tap `+` in a folder to create a note (title, description, folder, pinned toggle)
- Tap a note to view it, then Edit or Delete from there
- Use Search for a live, offline, case-insensitive search across titles/descriptions/folder names

Everything persists to the on-device SQLite database — force-quit and reopen the app to confirm it survives restarts offline (airplane mode included).

## Sync Engine

`mobile/src/services/sync/` implements the mobile side of the sync protocol (SRS §28–38): a versioned `SYNC_DATA` message built from an incremental change set (only folders/notes marked `PENDING`/`FAILED` in `sync_metadata`), sent over an abstract `SyncTransport`, with retry and failure handling that never touches the mobile database's actual notes/folders — only the sync bookkeeping.

The real phone↔watch channel is still unbuilt (Phase 0's communication POC hasn't run against Zepp OS hardware yet), so `SyncEngine` currently talks to `MockWatchTransport` — an in-memory stand-in that applies `SYNC_DATA` to its own store and acks with `SYNC_COMPLETE`, or simulates `SYNC_ERROR`/a dropped connection on demand. This lets the protocol, diffing, and retry logic be fully exercised now; swapping in a real transport later (once the POC picks the concrete Zepp SDK APIs) means implementing `SyncTransport` — `SyncEngine` itself doesn't change.

```ts
import { getDatabase } from './src/database/database';
import { SyncEngine, MockWatchTransport } from './src/services/sync';

const engine = new SyncEngine(await getDatabase(), new MockWatchTransport());
const result = await engine.sync();
// { status: 'SUCCESS', syncedFolders: 1, syncedNotes: 3, syncedAt: ... }
```

There's no "Sync to Watch" button in the UI yet — that's a Phase 3/5 follow-up once a real transport exists.

## Testing

```bash
# Mobile: type-check and Expo config sanity check
cd mobile
npx tsc --noEmit
npx expo-doctor

# Watch: syntax-check all page/app scripts
cd ..
for f in $(find . -path './node_modules' -prune -o -name '*.js' -print); do
  node --input-type=module --check < "$f"
done
```

There is no automated test suite yet (Phase 7). The sync engine's protocol/diffing/transport logic has ad-hoc smoke coverage (pure-function checks plus a full round trip against `MockWatchTransport`) but no committed test files. The critical end-to-end acceptance test — create a note on mobile, sync to a real watch, disconnect, and read it offline — can't be exercised until Phase 0 (communication POC) and Phase 5 (watch integration) are built.

## Design Principles

- **Offline-first** — no feature required for core note-taking depends on connectivity.
- **Mobile is the source of truth** — the watch holds a synced, read-only copy.
- **Text only** — no rich text, images, or attachments in the MVP.
- **One codebase, adaptive UI** — no per-device forks; layouts adapt to round vs. square screens at runtime.
