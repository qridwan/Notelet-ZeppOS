# Zepp App Store listing — Notelet 1.0.0

Copy-paste source for the release form at https://console.zepp.com.
Requirements follow https://docs.zepp.com/docs/distribute/.

## Before you submit

- [ ] **appId matches the console.** `app.json` has `"appId": 29054`. Open the app in the
      console and confirm it shows the same appId. If the console assigned a different
      one, put it in `app.json` and run `zeus build` again. A mismatch is rejected.
- [ ] **App name is unique** among your own apps ("Notelet").
- [ ] **Package:** `dist/<appId>-Notelet-1.0.0-<timestamp>.zab` (from `zeus build`).
- [ ] **Icon:** `docs/store/store-icon-240.png` (240×240, round, transparent).
- [ ] **Screenshots:** at least 3, see below.
- [ ] **Privacy statement:** paste the section below. Replace `<CONTACT EMAIL>` first.
- [ ] Test the exact `.zab` you upload on a real watch once (install via `zeus preview`).

## Basic info

| Field | Value |
|---|---|
| App name | Notelet |
| Category | Tools (or Efficiency, if offered) |
| Country / region | Choose where to publish (Global if available) |
| Language | English (en-US) |
| Version | 1.0.0 (read from the package) |
| Supported devices | Detected from the package: round 480 px and square 432 px screens |

## Short description (profile)

> Your notes, always within reach. Read your notes on your wrist, even offline.

## Details

> Notelet puts your short notes on your watch so they are there when your phone isn't.
>
> Write notes and organise them into folders from Notelet's settings page in the Zepp app.
> Tap Sync, and they are saved on your watch, where you can read them at any time,
> with no phone connection needed.
>
> • Folders and pinned notes for quick access
> • Works fully offline once synced
> • Adjustable text size for easy reading
> • Keep-awake mode so the screen stays on while you read
> • Long notes are split into pages you can flip through
> • No account, no ads, no tracking
>
> Great for shopping lists, gym routines, packing lists, recipes, directions, and
> anything you want to glance at quickly.

## Permissions ("Calling Permissions")

| Permission | Why |
|---|---|
| `data:os.device.info` | Reads screen size and shape to lay out the app for round and square watches. |
| `device:os.local_storage` | Stores synced notes on the watch so they are readable offline. |

No location, health, sensor, contacts, or network permissions are used.

## SDK inclusion

No third-party SDK. The app uses only Zepp's own official libraries
(`@zeppos/zml` for phone ↔ watch messaging).

## Privacy statement

> **Notelet Privacy Policy**
>
> Notelet does not collect, transmit, sell, or share any personal data with the developer
> or any third party.
>
> **What is stored and where.** The folders and notes you create are stored in the
> Notelet settings storage inside the Zepp app on your phone. They are sent over the
> Zepp app's Bluetooth connection to your watch and stored on the watch, so you can
> read them offline. Notelet also stores your reading preferences (text size,
> keep-awake) and the time of the last sync on the watch.
>
> **What is not collected.** Notelet has no account, no analytics, no advertising and no
> network access of its own. It does not access location, health, contacts or sensor
> data. Screen size information is used only on the watch to lay out the interface.
>
> **Your control.** You can delete any note or folder at any time from the settings page;
> it is removed from the watch on the next sync. Uninstalling Notelet removes its data
> from the watch.
>
> Storage and transfer through the Zepp app are governed by Zepp's own privacy policy.
>
> Contact: <CONTACT EMAIL>

## Screenshots

Format: **360×360 PNG, transparent background**, at least 3.

- Round watch: the screen capture centred on a 360×360 transparent square, no margins.
- Square watch: centred horizontally, equal left/right margins, no top/bottom margin.

Take them from the Simulator (`zeus dev`, then use the Simulator's screenshot button) with
some realistic notes synced in. Suggested set:

1. Home: Pinned, two or three folders, and the sync row.
2. A folder with several notes listed.
3. A note open with text (e.g. a shopping list).
4. A long note showing the page indicator, or keep-awake turned on.

## After submitting

Review takes 1–5 working days. If rejected, read the reason in the console, fix it, and
use **Edit** to resubmit. Later updates go through **Version Upgrade**: bump
`app.version.code` and `app.version.name` in `app.json` first.
