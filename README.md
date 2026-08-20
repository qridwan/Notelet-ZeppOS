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
        ├── models, types/    # Domain types
        ├── hooks/, utils/, constants/
```

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 — Platform validation | Phone ↔ watch communication POC | Not started |
| 1 — Watch foundation | Home/folder/note-detail screens, mock data, offline storage | Done |
| 2 — Mobile foundation | Expo project, SQLite schema, migrations, repositories | Done |
| 3 — Mobile UI | Screens for folders, notes, search, pinned | Not started |
| 4 — Sync engine | Protocol, change detection, retry, error handling | Not started |
| 5 — Watch integration | Receive/apply real sync payloads | Not started |
| 6 — Device adaptation | Round/square layout polish | Partial (base layouts adapt by device width) |
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

**What to expect**: Home screen (Pinned / folders / Search) → tap a folder to list its notes → tap a note to read its full text with vertical scrolling. All data is local mock data; no phone connection is required.

## Running the Mobile App

```bash
cd mobile
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), `w` (web), or scan the QR code with Expo Go.

**What to expect**: a minimal status screen confirming the SQLite database opened and ran its migrations (`N folders, N notes on device`). There is no CRUD UI yet — that's Phase 3. To exercise the data layer directly, use the services in code, e.g.:

```ts
import { folderService } from './src/services/folders/folderService';
import { noteService } from './src/services/notes/noteService';

const folder = await folderService.create({ name: 'Work' });
await noteService.create({ title: 'Test', description: 'Hello', folderId: folder.id });
await noteService.search('hello');
```

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

There is no automated test suite yet (Phase 7). The critical end-to-end acceptance test — create a note on mobile, sync to watch, disconnect, and read it offline — can't be exercised until Phase 0 (communication POC) and Phase 4/5 (sync engine) are built.

## Design Principles

- **Offline-first** — no feature required for core note-taking depends on connectivity.
- **Mobile is the source of truth** — the watch holds a synced, read-only copy.
- **Text only** — no rich text, images, or attachments in the MVP.
- **One codebase, adaptive UI** — no per-device forks; layouts adapt to round vs. square screens at runtime.
