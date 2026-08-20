Notelet — Software Requirements Specification (SRS)

Document Version: 2.0.0
Status: Current Implementation
Product: Notelet
Target: Zepp OS Watch App (with phone-side Settings page)
Primary Goal: Offline-first text notes accessible from compatible Amazfit watches
Target Zepp OS: 5.0
Target API Level: 4.4

⸻

1. Document Purpose

This document defines the functional, technical, UX, data, synchronization, and testing requirements for Notelet as currently implemented.

It is written to be agent-friendly: an AI coding agent or development team should be able to use this document as the primary implementation reference without needing prior context.

⸻

2. Product Overview

2.1 Product Name

Notelet

2.2 Product Tagline

Your notes, always within reach.

2.3 Product Concept

Notelet is a single Zepp OS watch application with one companion surface: its own **Settings page**, which opens inside the Zepp phone app (not a separately installed mobile app).

1. A Zepp OS smartwatch application for browsing and reading notes.
2. A Settings page (part of the same Zepp OS mini-program) for creating, editing, and deleting folders and notes.
3. A synchronization channel, built into the Zepp OS platform, that carries data from the Settings page to the watch.
4. Local storage on the watch so synchronized notes remain accessible without any connectivity.

⸻

3. Product Vision

Notelet should provide the simplest possible way to keep useful information accessible from a smartwatch.

Settings page
Create
Edit
Delete
Pin
Trigger sync
        ↓
Watch
Browse
Read
Access Offline

The watch is not intended to replicate full note-management. It is a fast, offline reading companion; the Settings page is the management interface.

⸻

4. Target Devices

The MVP targets the following devices.

| Device | Zepp OS | API Level | Shape | Resolution |
|---|---|---|---|---|
| Amazfit Balance 3 | 5.0 | 4.4 | Round | 480 × 480 |
| Amazfit Balance Ultra | 5.0 | 4.4 | Round | 480 × 480 |
| Amazfit Bip Max | 5.0 | 4.4 | Square | 432 × 514 |

4.1 Compatibility Requirements

The watch application MUST:

* support Zepp OS 5.0;
* target API Level 4.4;
* support round displays;
* support square displays;
* adapt to device dimensions dynamically;
* avoid hard-coded coordinates wherever practical.

The application MUST NOT create separate application logic for each watch model. A single core (data layer, sync layer, navigation, business logic) drives a UI adaptation layer that branches only on device shape/dimensions (`utils/layout.js`, per-target `*.page.r.layout.js` / `*.page.s.layout.js` files).

⸻

5. Product Scope

5.1 MVP Includes

Settings page (phone-side)

* Folder creation
* Folder deletion (notes inside move to Uncategorized, not deleted)
* Note creation (title, description, folder assignment)
* Note deletion
* Note pin/unpin
* Manual sync trigger ("Check for updates")
* Sync status display (last checked time, folder/note counts on watch)

Watch

* Home screen (Pinned, folders, Search entry, sync status/trigger)
* Folder browsing (notes in a folder, or Pinned)
* Note detail (title + full text, paginated for long notes)
* Font size adjustment on note detail
* Keep-awake toggle on note detail
* Local offline storage (full copy of synced data)
* Sync status
* Full data replacement on each sync (see §16)

5.2 Not Currently Implemented

The following exist in the product vision but are not built:

* Folder rename (Settings page supports create/delete only)
* Note editing after creation (Settings page supports create/delete/pin only — no edit-in-place)
* Search (on watch or in Settings)
* Recent-notes view
* Selective/per-note sync (sync always replaces the full dataset)

These are natural follow-ups, not deliberately excluded — see §5.3.

5.3 Explicitly Out of Scope

The following MUST NOT be implemented unless specifically requested later:

* Rich text, images, video, audio, or file attachments
* Markdown rendering
* Note collaboration or public sharing
* Multi-user workspaces
* Cloud backend / cloud storage / user accounts
* AI features (chat, summarization, semantic search)
* Watch-side note editing
* Voice-to-text
* Web or desktop application
* A separate installed mobile application (see §8.2 for why)

⸻

6. Core Product Principles

P-001 — Offline First
Notelet MUST NOT depend on internet connectivity for core note functionality. Sync happens over the Zepp OS Bluetooth channel between the phone (Zepp app) and the watch; no server is involved.

P-002 — Settings Page as Source of Truth
The Settings page's data (persisted via `settingsStorage`) is authoritative. The watch holds a synchronized local copy.

P-003 — Watch as Companion
The watch focuses on: Browse → Open → Read → Back. It does not replicate management features.

P-004 — Text Only
A note consists of a title and a description (plain text).

P-005 — Lightweight
The watch application must minimize CPU, memory, storage, sync payload size, and battery impact.

⸻

7. System Architecture

7.1 High-Level Architecture

A Zepp OS mini-program has three parts, and Notelet uses all three:

* **Device App** (`page/`, `app.js`) — runs on the watch. UI, local storage, navigation.
* **Side Service** (`app-side/index.js`) — runs on the phone, inside the Zepp app's own process. No UI. Reads/writes `settingsStorage`, serves data to the Device App over Bluetooth via the framework's `request`/`call` primitives.
* **Settings App** (`setting/index.js`) — runs on the phone, inside the Zepp app, as a webview. UI for folder/note CRUD. Shares `settingsStorage` with the Side Service.

```
┌────────────────────────────┐        ┌────────────────────────────┐
│   Settings App (phone)     │        │   Device App (watch)       │
│   setting/index.js         │        │   page/home, folder,       │
│                             │        │   note-detail              │
│   Folder/Note CRUD UI      │        │   Local JSON storage       │
└──────────────┬──────────────┘        └──────────────┬─────────────┘
               │ settingsStorage                        │ Bluetooth
               │ (shared)                                │ (request/call)
               ▼                                         ▼
        ┌───────────────────────────────────────────────────┐
        │        Side Service (phone) — app-side/index.js    │
        │  PULL_SYNC · REPORT_SYNC_STATUS · onSettingsChange  │
        └───────────────────────────────────────────────────┘
```

7.2 Why there is no separate mobile app

An earlier design considered a separate, independently-installed mobile application as the management surface, communicating with the watch over a custom Bluetooth Low Energy link. That approach was abandoned: there is no documented channel for a separate third-party mobile app to reach a Zepp OS mini-program's Side Service (confirmed against docs.zepp.com — the only sanctioned Side Service channels are Device App via Bluetooth, Settings App via shared `settingsStorage`, and a remote server via `fetch`, the last of which is excluded by this spec's no-backend requirement). Building a custom Bluetooth bridge instead would require a from-scratch native BLE peripheral implementation on the phone side with no verified supporting library. The Settings page, by contrast, is a documented, already-working part of the Zepp OS platform itself, and satisfies the same management requirements.

⸻

8. Data Model

8.1 Folder

```
Folder
-----------------------
id            string (unique, stable across sync)
name          string
updatedAt     number (epoch ms)
```

8.2 Note

```
Note
-----------------------
id            string (unique, stable across sync)
folderId      string | null   (null = Uncategorized)
title         string
description   string (plain text)
isPinned      boolean
updatedAt     number (epoch ms)
```

8.3 Storage locations

* **Settings page**: folders/notes/deleted-id-tombstones stored as one JSON blob under a single `settingsStorage` key (`noteletData`). One write per user action — see §17 for why this matters.
* **Watch**: its own full copy of folders/notes, persisted as local JSON files (`utils/syncStore.js`), replaced wholesale on every successful sync (§16).
* **Sync status**: a small `syncStatus` `settingsStorage` entry (`lastSyncedAt`, `folderCount`, `noteCount`) written by the watch after each sync, read by the Settings page.

⸻

9. Settings Page Functional Requirements

FR-SET-001 — Create Folder
The user MUST be able to create a folder by name. Empty/whitespace-only names are rejected.

FR-SET-002 — Delete Folder
The user MUST be able to delete a folder. Notes inside it are reassigned to Uncategorized (`folderId: null`), not deleted.

FR-SET-003 — Create Note
The user MUST be able to create a note with a title, description, and folder assignment (defaulting to the first available folder). Empty titles are rejected.

FR-SET-004 — Delete Note
The user MUST be able to delete a note.

FR-SET-005 — Pin/Unpin Note
The user MUST be able to toggle a note's pinned state.

FR-SET-006 — Manual Sync Trigger
The user MUST be able to trigger a sync from the Settings page ("Check for updates"). This pushes a signal to the watch if it is currently connected/foregrounded; if not, it is a no-op (the watch still syncs on its own next launch).

FR-SET-007 — Sync Status Display
The Settings page MUST show the last-synced time and folder/note counts once the watch has reported them at least once.

⸻

10. Watch Application Requirements

10.1 Watch Responsibilities

The watch application is responsible for:

* pulling and applying synchronized data;
* storing synchronized data locally;
* displaying folders, pinned notes, and note details;
* paginating long note text;
* showing sync state and offering a manual sync trigger;
* remaining fully functional offline.

10.2 Home Screen

Shows: app title, Pinned entry, one row per folder, a Search entry (not yet functional — see §5.2), and a sync row ("🔄 Sync now" / "🔄 Last synced HH:MM", tappable to sync on demand).

10.3 Folder Screen

Lists notes in the selected folder (or Pinned). Each row shows the note title (with a pin marker if pinned). Tapping a row opens note detail.

10.4 Note Detail Screen

Shows the note's title and full description. Long notes are split into pages with Prev/Next controls and a page indicator (word-aware pagination, not truncation). Also provides:

* Font size increase/decrease (persisted as a device-wide reading preference, independent of any single note);
* A keep-awake toggle (extends the screen's bright-time while reading, via `@zos/display`'s `setPageBrightTime`).

10.5 Responsive Layout

The UI MUST support round (480×480) and square (432×514) displays without per-device forks. Round layouts use a wider safe margin (bezel content gets clipped near the edges on round displays); square layouts use a tighter margin and take advantage of the extra vertical space. Both are derived from a single shared ratio-based helper (`utils/layout.js`) rather than hard-coded per-screen offsets.

10.6 Offline Requirement

All watch reading operations (browse folders, open notes, page through long text, view pin status) MUST work with no Bluetooth/network connectivity, using the watch's local copy of the last-synced data.

⸻

11. Watch UUID / Identity Requirement

Every folder and note MUST have a stable, unique identifier that survives synchronization. The watch never generates its own IDs — it only ever stores what the Settings page created.

⸻

12. Synchronization

12.1 Model

Sync is a **full replace**, not an incremental diff:

```
Settings page (settingsStorage: current folders/notes + delete-tombstones)
        ↓ read by
Side Service (app-side/index.js) — PULL_SYNC
        ↓ requested by
Watch (page/home) — validates payload, then REPLACES its entire local
folders/notes store with what it received
```

This is deliberate. The Settings page always has and sends its complete current dataset, not a stream of changes — so the watch discards anything in its local store that the latest payload doesn't mention, not just entries explicitly flagged deleted. An earlier tombstone-only merge (remove only what's explicitly flagged deleted, keep everything else) left orphaned data permanently stuck on the watch whenever a source stopped serving certain ids at all, rather than deleting them explicitly. Full replace has no such gap.

12.2 Sync Triggers

* Automatically, when the watch app launches (`page/home`'s `build()`).
* Manually, via the watch's own "Sync now" row.
* Manually, via the Settings page's "Check for updates" (pushes to the watch if it's connected; otherwise the watch's own next-launch sync covers it).

12.3 Payload Validation

The watch MUST validate any payload before applying it (`utils/payloadValidation.js`): reject anything with the wrong protocol version or malformed folder/note entries. A rejected or failed sync MUST leave the watch's existing local data untouched.

12.4 Sync Status

The watch tracks and displays: `IDLE`, `SYNCING`, `SUCCESS`, `FAILED` (`utils/syncStatus.js`), plus last-synced timestamp and counts. After a successful sync, the watch reports counts back to the Side Service (`REPORT_SYNC_STATUS`) so the Settings page can display them too.

12.5 Protocol Versioning

The sync payload carries a `protocolVersion` field. A mismatch MUST cause the watch to reject the payload rather than attempt to interpret it.

⸻

13. Conflict Resolution

Not applicable in the current design: the watch never edits data, so there is nothing for it to conflict with. The Settings page's data always wins.

⸻

14. Error Handling

The watch MUST handle, without data loss:

* **Sync failure** — validation failure, malformed payload, or a Side Service error. Existing local data remains untouched and available.
* **Side Service unavailable to push** — a Settings-triggered "Check for updates" MUST NOT crash the Side Service if the watch isn't connected; it must fail silently and let the watch's own next sync catch up.
* **Note not found** — if a note id no longer exists locally (e.g. deleted mid-navigation), the note-detail screen shows a "Note not found" state rather than crashing.

⸻

15. Security Requirements

* Do not transmit data unnecessarily.
* Do not log full note descriptions in production logs.
* Do not expose note content in debugging output.
* Do not encourage users to store passwords or authentication secrets as ordinary notes.

⸻

16. Performance Requirements

Watch:

* Launch quickly;
* Render lists efficiently without unnecessary widget churn;
* Avoid unnecessary re-syncing.

Dataset assumption: optimized for personal note collections (folders ≤ 100, notes ≤ 1,000). Does not need to optimize for larger scale.

⸻

17. UX Requirements

General

The UI should be minimal, clean, readable, fast, and consistent. Avoid unnecessary animations, gradients, complex menus, excessive buttons, or decorative UI.

Empty States

* No folders yet → "No folders yet."
* No notes yet → "No notes yet."
* Note not found → "Note not found. It may have been removed on the last sync."

Progressive Disclosure (Settings page)

The add-folder/add-note forms are hidden by default behind a `+ Add folder` / `+ Add note` link, and revealed as a distinct step (with Add/Cancel actions) rather than shown permanently inline with the list — this was a direct fix for reported UX confusion when the form and list were both always visible at once.

⸻

18. Known Implementation Constraints

These are hard constraints of the actual Zepp OS Simulator/runtime and Settings-page framework, not stylistic choices. Any future work on this codebase MUST account for them:

* **`SCROLL_LIST` does not render** in this environment, regardless of configuration. All watch list UI (home, folder, note-detail pagination) is built from `BUTTON`/`TEXT` widgets instead.
* **A `TEXT` widget layered visually on top of a `BUTTON` silently blocks that button's taps.** Rows must be a single `BUTTON` with combined text, not a background button plus overlay text.
* **`hmApp.gotoPage` (the legacy navigation API) does not exist** in this environment — it throws `not a function`. Navigation uses `@zos/router`'s `push` instead.
* **A Side Service's `this.call()` throws if the watch app isn't currently connected/foregrounded**, and an uncaught throw there can crash the whole Side Service instance, taking the watch app down with it. Any `onSettingsChange`-triggered push must be wrapped in try/catch.
* **In the Settings App framework, mutating `this.state` alone does not redraw the page** — only an actual `settingsStorage.setItem()` write does. Any interactive control whose visible state should update immediately (a selection toggle, a form reveal/collapse) must pair its state change with a real storage write.
* **A style-only change to an otherwise-identical `Button`** (same label, different color) does not reliably re-render, in both the watch and Settings-page environments — the button's label text itself must differ for a visual change to reliably appear.
* **Multiple rapid `settingsStorage` writes from one user action can crash the Side Service's hot-reload** (`"exports is not defined"` / `"Cannot read properties of undefined (reading 'onInit')"`). Each CRUD action in the Settings page performs exactly one combined write, not several separate ones, to avoid this.

⸻

19. Testing Strategy

No automated test suite exists. Verification has been manual and continuous: the Zepp OS Simulator, the Settings page's devtools panel, and a real Amazfit Bip Max.

19.1 Manual Test Coverage To Date

* Folder/note CRUD (create, delete, pin/unpin) via the Settings page
* Watch navigation across all three screens (home → folder → note detail → back)
* Manual sync (watch button) and Settings-triggered sync (`Check for updates`)
* Font size and keep-awake controls on note detail
* Round/square layout on a real Bip Max (found and fixed a top-margin clipping bug the Simulator never surfaced)
* Full-replace sync correctness (deleting all data in Settings and confirming the watch clears to match, including previously-orphaned entries)

19.2 Critical Acceptance Test

1. Create a folder and a note in the Settings page.
2. Tap "Check for updates" (or open the watch app).
3. Confirm the note appears on the watch.
4. Disconnect the phone / close the Zepp app.
5. Reopen Notelet on the watch and confirm the note is still fully readable.

This scenario is exercisable today (unlike under the earlier separate-mobile-app design, where it depended on an unbuilt Bluetooth bridge), since the Settings page and watch are already connected through the platform's own working channel.

⸻

20. Definition of Done

A feature is Done only when it has: a working implementation, offline-safe behavior, error handling that preserves existing data on failure, and manual verification on both the Simulator and a real device where the change is device-shape-sensitive (layout, rendering).

A task MUST NOT be considered complete merely because the UI appears to work in the Simulator alone — real-hardware testing has already caught at least one bug (§18, §19.1) the Simulator did not.

⸻

21. Core Success Criterion

Create a note in Settings → sync it to your watch → disconnect everything → open Notelet on your watch → read the note.

If that experience is fast, reliable, and genuinely pleasant, Notelet has achieved its core purpose.
