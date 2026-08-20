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
| 0 — Platform validation | Phone ↔ watch communication POC | Partial — watch-side BLE Central built against real APIs; mobile-side BLE peripheral not implemented (see below) |
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

**Settings page**: from the Zepp app's mini-program settings (or the Simulator's settings devtools panel), you get About, Sync, Folders, and Notes sections. "Check for updates" writes to `settingsStorage`, which `app-side/index.js` observes and pushes to the watch via `this.call()` (the only channel a Settings App has to reach the Device App), triggering the same sync the watch's own button does — the watch reports real folder/note counts back the same way. **Folders and Notes are a deliberate, temporary interim data source**: you can create/delete folders and notes and pin/unpin right there in Settings, and `PULL_SYNC` serves exactly that data to the watch instead of the old 5 hardcoded mock notes. This is standing in for the real mobile app ↔ watch connection until the Phase 0 BLE bridge exists (see below) — per SRS, note/folder management belongs in the separate `mobile/` app long-term, not here.

## Watch-Side Sync (Phase 5)

`utils/syncStore.js`, `utils/syncMerge.js`, `utils/payloadValidation.js`, `utils/syncStatus.js`, and `utils/syncClient.js` implement the watch's half of sync (SRS §39–41): pull a `PULL_SYNC` payload from `app-side`, validate its shape, and **fully replace** the watch's own `folders`/`notes` JSON files with it, then record `lastSyncedAt`/status for the home screen. This is a full replace rather than an incremental tombstone-based merge deliberately: since Settings is the single source of truth and always sends its complete current list (not a diff), anything the watch has stored that the payload doesn't mention gets dropped — not just entries explicitly flagged `deleted: true`. An earlier tombstone-only version left orphaned entries permanently stuck on the watch whenever their id just stopped being served (this happened for real: the original hardcoded mock notes stayed pinned on the watch forever after the mock data was removed from the code, since no tombstone existed for ids the payload had simply stopped mentioning). The watch pages (`page/home`, `page/folder`, `page/note-detail`) only ever read from this local store, never live from `app-side`, which is what keeps notes available after the phone disconnects.

As with the mobile sync engine (Phase 4), the real transport is still unbuilt — `app-side/index.js`'s `PULL_SYNC` handler serves the same mock catalog (`utils/constants.js`) converted into the wire format, standing in for what will eventually be the real mobile app's data once Phase 0's communication POC picks the concrete Zepp SDK APIs. Swapping that in only changes `buildSyncPayload()` in `app-side/index.js` — the validation, merge, and storage logic on the watch doesn't change.

## Device Adaptation (Phase 6)

`utils/layout.js` defines the safe-margin ratios every watch layout file shares: a wider margin on round displays (Balance 3 / Balance Ultra, 480×480), where content near the bezel corners gets visually clipped, and a tighter one on square (Bip Max, 432×514), which uses nearly its full rectangle. Each `*.page.r.layout.js` / `*.page.s.layout.js` pair computes its list/text bounds from this shared margin against its own `DEVICE_WIDTH`, rather than hard-coded pixel offsets per screen — so home, folder, and note-detail stay visually consistent, and a fourth screen added later gets the same treatment for free. This also fixed a pre-existing bug where the folder screen's pin marker was positioned against the full device width instead of the (narrower) list container, which would have clipped it on-device.

This has been verified by geometry (margins, list/text widths recomputed and checked non-negative and sane for both 480 and 432 device widths) and code review, not yet against a physical Balance 3 / Balance Ultra / Bip Max or the Zepp OS Simulator — that's the Phase 7 device-testing matrix (SRS §58).

## Phone ↔ Watch Communication POC (Phase 0)

Researched against the actual Zepp OS docs (docs.zepp.com) rather than assumed: **there is no documented channel between a separate third-party mobile app and a Zepp OS mini-program's Side Service.** The only sanctioned Side Service communication paths are Device App ↔ Side Service (Bluetooth, within the Zepp app's own process), Side Service ↔ Settings App (shared `settingsStorage`), and Side Service ↔ a remote server (`fetch`) — the last of which SRS Rule 2 excludes for this MVP. This is why `app-side/index.js` can only ever serve mock/local data, never reach the separate Notelet mobile app, no matter what's built on top of it.

The one real path found: `@zos/ble` (confirmed against the installed `@zeppos/device-types` definitions, version-tagged 3.0+) lets the watch's Device App act as a full BLE **Central** — `mstStartScan`/`mstConnect`/`mstBuildProfile`/`mstReadCharacteristic`/`mstWriteCharacteristic` — and connect to *any* BLE peripheral, completely bypassing the Zepp app.

- **`utils/ble/protocol.js`** (watch) / **`mobile/src/services/sync/ble/protocol.ts`** (mobile) — a custom GATT protocol: one service UUID, a `CONTROL` characteristic (watch writes commands) and a `DATA` characteristic (watch reads chunked responses), plus a dependency-free UTF-8 + base64 codec (not relying on `TextEncoder`/`btoa` existing in either JS engine). Verified byte-for-byte identical output between the two implementations for the same input, including emoji/non-ASCII content.
- **`utils/ble/transport.js`** (watch) — a BLE Central transport built against the real `@zos/ble` API. **Not wired into the working app** — it's a standalone module, kept separate from the mock `PULL_SYNC` flow that the rest of the watch app currently uses, specifically so this unverified code can't destabilize what's already confirmed working.
- **Mobile-side BLE peripheral: not implemented.** No currently-maintained, verified library gives React Native/Expo real BLE peripheral (GATT server) capability — `react-native-ble-peripheral`'s own description says it's *"a simulator for a BLE peripheral, to help with testing... without an actual peripheral BLE device"*, not a real implementation, and `react-native-ble-advertiser` only broadcasts advertisements, no GATT server. Building this for real means a custom native module (CoreBluetooth `CBPeripheralManager` on iOS, `BluetoothGattServer` on Android) — `expo-dev-client` is already installed so that's addable without a full eject. See the design notes and exact requirements in `mobile/src/services/sync/ble/blePeripheralServer.ts`.

**None of this has been tested against real Bluetooth hardware** — it's built against documented APIs and cross-checked for internal consistency (protocol round-trips verified with `tsx`/`node`), but real BLE stacks vary in negotiated MTU, timing, and connection behavior in ways that can't be verified without a physical device on both ends. Expect to tune `CHUNK_PAYLOAD_SIZE` and add retry/timeout handling once this runs for real.

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
