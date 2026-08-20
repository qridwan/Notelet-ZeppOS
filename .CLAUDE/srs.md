Notelet — Software Requirements Specification (SRS)

Document Version: 1.0.0
Status: Development Specification
Product: Notelet
Target: Mobile Companion App + Zepp OS Watch App
Primary Goal: Offline-first text notes accessible from compatible Amazfit watches
Target Zepp OS: 5.0
Target API Level: 4.4

⸻

1. Document Purpose

This document defines the complete functional, technical, UX, data, synchronization, and testing requirements for Notelet.

It is written to be agent-friendly, meaning an AI coding agent or development team should be able to use this document as the primary implementation reference.

The implementation should follow this SRS unless a requirement is explicitly changed.

⸻

2. Product Overview

2.1 Product Name

Notelet

2.2 Product Tagline

Your notes, always within reach.

2.3 Product Concept

Notelet is an offline-first, text-only notes application consisting of:

1. A mobile application for creating and managing notes.
2. A Zepp OS smartwatch application for accessing synchronized notes.
3. A synchronization layer that transfers selected notes from the mobile application to the smartwatch.
4. Local storage on both mobile and watch so synchronized notes remain accessible without internet connectivity.

⸻

3. Product Vision

Notelet should provide the simplest possible way to keep useful information accessible from a smartwatch.

The product philosophy is:

Mobile
Create
Edit
Organize
Search
Sync
        ↓
Watch
Browse
Read
Search
Access Offline

The watch is not intended to replicate the mobile application.

The mobile application is the primary management interface.

The watch is primarily a fast offline reading companion.

⸻

4. Target Devices

The MVP targets the following devices.

Device	Zepp OS	API Level	Shape	Resolution
Amazfit Balance 3	5.0	4.4	Round	480 × 480
Amazfit Balance Ultra	5.0	4.4	Round	480 × 480
Amazfit Bip Max	5.0	4.4	Square	432 × 514

4.1 Compatibility Requirements

The watch application MUST:

* support Zepp OS 5.0;
* target API Level 4.4;
* support round displays;
* support square displays;
* adapt to device dimensions dynamically;
* avoid hard-coded coordinates wherever practical.

The application MUST NOT create separate application logic for each watch model.

Instead:

Notelet Core
    │
    ├── Data Layer
    ├── Sync Layer
    ├── Navigation
    └── Business Logic
            │
            ▼
       UI Adaptation
          /       \
      Round      Square

⸻

5. Product Scope

5.1 MVP Includes

Mobile

* Folder creation
* Folder editing
* Folder deletion
* Note creation
* Note editing
* Note deletion
* Note viewing
* Text search
* Pinned notes
* Recent notes
* Offline storage
* Watch note selection
* Manual synchronization
* Sync status
* Sync history/status information

Watch

* Home screen
* Pinned notes
* Folder browsing
* Note browsing
* Note detail
* Long-text scrolling
* Basic note search
* Local offline storage
* Sync status
* Synchronized note deletion/replacement

Synchronization

* New notes
* Updated notes
* Deleted notes
* Folder changes
* Incremental synchronization
* Sync retry
* Sync failure handling
* Data integrity protection

⸻

6. Explicitly Out of Scope for MVP

The following MUST NOT be implemented in V1 unless specifically requested later:

* Rich text
* Images
* Video
* Audio attachments
* File attachments
* Markdown rendering
* Note collaboration
* Public note sharing
* Multi-user workspaces
* Cloud storage
* User accounts
* AI chat
* AI summarization
* AI semantic search
* Watch-side note editing
* Voice-to-text
* Web application
* Desktop application
* Complex conflict resolution
* End-to-end cloud synchronization

The architecture SHOULD allow these features to be added later without major restructuring.

⸻

7. Core Product Principles

P-001 — Offline First

Notelet MUST NOT depend on internet connectivity for core note functionality.

P-002 — Mobile as Source of Truth

For MVP:

The mobile database is the authoritative data source.

The watch contains a synchronized local copy.

P-003 — Watch as Companion

The watch should focus on:

Browse → Open → Read → Back

P-004 — Text Only

All note content is plain text.

A note consists of:

Title
Description

P-005 — Lightweight

The watch application must minimize:

* CPU usage
* memory usage
* storage
* synchronization payload size
* battery impact

⸻

8. System Architecture

8.1 High-Level Architecture

┌──────────────────────────────────────────┐
│                NOTELET                   │
│                                          │
│  ┌─────────────────┐                     │
│  │   Mobile App    │                     │
│  │                 │                     │
│  │ UI              │                     │
│  │ Note Manager    │                     │
│  │ Search          │                     │
│  │ Sync Manager    │                     │
│  │                 │                     │
│  │ Local Database  │                     │
│  └────────┬────────┘                     │
│           │                              │
│           │ Phone ↔ Watch Communication  │
│           │                              │
│           ▼                              │
│  ┌─────────────────┐                     │
│  │   Zepp Layer    │                     │
│  └────────┬────────┘                     │
│           │                              │
│           ▼                              │
│  ┌─────────────────┐                     │
│  │   Watch App     │                     │
│  │                 │                     │
│  │ UI              │                     │
│  │ Local Storage   │                     │
│  │ Sync Receiver   │                     │
│  └─────────────────┘                     │
└──────────────────────────────────────────┘

⸻

9. Architecture Constraint: Communication POC

Before implementing the complete synchronization system, the development agent MUST verify the actual supported phone/watch communication mechanism for the target Zepp OS 5.0/API 4.4 devices using the official Zepp OS SDK/API documentation.

This is a blocking technical validation task.

The first prototype MUST prove:

Mobile
   ↓
Send "Hello Notelet"
   ↓
Zepp communication layer
   ↓
Watch
   ↓
Display text
   ↓
Store locally
   ↓
Disconnect phone
   ↓
Read text

Do not implement the full synchronization architecture until this proof of concept succeeds.

⸻

10. Mobile Application

10.1 Recommended Technology

Preferred stack:

React Native
TypeScript
Expo
SQLite

If Zepp communication requires native functionality unavailable through Expo, the implementation MAY use React Native native modules or a suitable alternative.

The development agent MUST verify the communication requirement before locking the final mobile build configuration.

⸻

11. Mobile Application Navigation

Recommended structure:

Home
├── Search
├── Pinned
├── Recent
└── Folders
      │
      ├── Work
      ├── Personal
      ├── Ideas
      └── Other

Suggested screens:

HomeScreen
FolderScreen
NoteListScreen
NoteDetailScreen
NoteEditorScreen
SearchScreen
PinnedScreen
SettingsScreen
WatchSyncScreen

⸻

12. Mobile Functional Requirements

FR-MOB-001 — Create Folder

The user MUST be able to create a folder.

Input:

Folder Name

Validation:

* Required
* Cannot be empty
* Leading/trailing whitespace should be removed
* Maximum length should be enforced

⸻

FR-MOB-002 — Rename Folder

The user MUST be able to rename an existing folder.

⸻

FR-MOB-003 — Delete Folder

The user MUST be able to delete a folder.

The application MUST display a confirmation dialog.

If the folder contains notes, the application MUST clearly communicate the consequence.

Recommended behavior:

Delete folder?
Notes inside this folder will be moved to Uncategorized.

⸻

FR-MOB-004 — Create Note

A note MUST contain:

title
description
folderId

Optional:

isPinned

⸻

FR-MOB-005 — Edit Note

The user MUST be able to modify:

* title
* description
* folder
* pinned status

Changes MUST be persisted locally immediately after successful save.

⸻

FR-MOB-006 — Delete Note

The user MUST be able to delete a note.

The application SHOULD use a confirmation dialog.

⸻

FR-MOB-007 — View Note

The note detail screen MUST display:

Title
Description
Folder
Last Updated

⸻

FR-MOB-008 — Search

Search MUST support:

* title
* description
* folder name

Search should be case-insensitive.

Search should work completely offline.

⸻

FR-MOB-009 — Pin Note

Users MUST be able to pin/unpin notes.

Pinned notes MUST be accessible from a dedicated Pinned section.

⸻

FR-MOB-010 — Recent Notes

The application SHOULD provide a Recent section.

Default sorting:

updatedAt DESC

⸻

13. Mobile Offline Requirements

The mobile application MUST function without:

* Wi-Fi
* mobile data
* internet access

The following MUST work offline:

Create note
Edit note
Delete note
Create folder
Edit folder
Delete folder
Search
View notes
Pin/unpin
Browse folders

The application MUST NOT display an internet-required error for these operations.

⸻

14. Database Specification

14.1 Folder Entity

Folder
-----------------------
id
name
createdAt
updatedAt

Field requirements

Field	Type	Required
id	UUID/String	Yes
name	String	Yes
createdAt	Timestamp	Yes
updatedAt	Timestamp	Yes

⸻

15. Note Entity

Note
-----------------------
id
folderId
title
description
isPinned
createdAt
updatedAt
deletedAt

Field	Type	Required
id	UUID/String	Yes
folderId	UUID/String/Nullable	Yes
title	String	Yes
description	Text	Yes
isPinned	Boolean	Yes
createdAt	Timestamp	Yes
updatedAt	Timestamp	Yes
deletedAt	Timestamp/Nullable	No

⸻

16. Sync Metadata

The application SHOULD maintain synchronization metadata separately from business data.

SyncMetadata
-----------------------
entityId
entityType
version
lastSyncedAt
syncStatus

Possible status values:

PENDING
SYNCING
SYNCED
FAILED

⸻

17. UUID Requirement

Every folder and note MUST have a unique identifier.

Recommended:

UUID v4

IDs MUST remain stable across synchronization.

The watch MUST NOT generate a new ID for a mobile-created note.

⸻

18. Watch Application

18.1 Watch Responsibilities

The watch application is responsible for:

* receiving synchronized data;
* storing synchronized data locally;
* displaying folders;
* displaying notes;
* displaying pinned notes;
* displaying note descriptions;
* scrolling long text;
* providing basic search;
* showing sync state;
* remaining functional offline.

⸻

19. Watch Home Screen

The home screen SHOULD contain:

NOTELET
⭐ Pinned
📁 Work
📁 Personal
📁 Ideas
🔍 Search

The UI MUST remain readable on both round and square displays.

⸻

20. Watch Folder Screen

Example:

WORK
API Architecture
Meeting Notes
Deployment
Database Notes

The user MUST be able to select a note.

⸻

21. Watch Note Detail

Example:

API Architecture
Use Redis for frequently
accessed API responses.
Consider cache invalidation
for frequently changing
resources.

Requirements:

* Vertical scrolling
* Clear title
* Readable description
* Back navigation
* No requirement for internet connectivity

⸻

22. Watch Pinned Notes

Pinned notes MUST be accessible directly from the watch home screen.

Example:

⭐ PINNED
Current Project
API Architecture
Meeting Notes

⸻

23. Watch Search

MVP watch search SHOULD prioritize note titles.

If the target Zepp device’s input capabilities make free-text search inconvenient, the implementation MAY initially provide title filtering or another lightweight search mechanism.

The architecture MUST allow improved search later.

⸻

24. Long Text Handling

Notes may contain long descriptions.

The watch MUST:

* support vertical scrolling;
* prevent text from overflowing the screen;
* preserve readable line spacing;
* avoid truncating the actual note content on the detail screen.

The list view MAY truncate descriptions.

Example:

API Architecture
Use Redis for frequently...

⸻

25. Responsive Watch Layout

The watch UI MUST support:

Round

480 × 480

Square

432 × 514

The UI MUST NOT depend on one fixed screen resolution.

Use dynamic dimensions wherever practical.

⸻

26. Round Screen Safe Area

For round displays:

Amazfit Balance 3
Amazfit Balance Ultra

important content SHOULD remain within a safe central region.

Avoid placing:

* critical text
* buttons
* navigation controls

too close to display corners.

⸻

27. Square Screen Layout

For:

Amazfit Bip Max

the application MAY use the additional vertical/horizontal space for:

* larger note lists;
* larger text areas;
* more visible navigation options.

However, visual hierarchy SHOULD remain consistent with the round layout.

⸻

28. Synchronization

28.1 Synchronization Model

MVP synchronization:

Mobile
   ↓
Sync Manager
   ↓
Phone/Zepp Communication
   ↓
Watch Sync Receiver
   ↓
Watch Local Database

The watch MUST NOT be treated as the authoritative source.

⸻

29. Manual Sync

The MVP MUST support manual synchronization.

Example:

Watch
Last synced:
Today 7:30 PM
        [Sync]

or from the mobile application:

Selected Notes: 12
       [Sync to Watch]

⸻

30. Selective Sync

The user SHOULD be able to choose which notes are synchronized.

Example:

Work
☑ API Architecture
☑ Meeting Notes
☐ Deployment
☐ Database Design
        Sync 2 Notes

⸻

31. Folder-Level Sync

The architecture SHOULD support folder-level synchronization.

Example:

Work
    [Sync Folder]

When selected, all eligible notes inside the folder are synchronized.

⸻

32. Sync Operations

The synchronization system MUST support:

CREATE
UPDATE
DELETE

for notes.

It SHOULD support the same operations for folders.

⸻

33. Incremental Synchronization

The system MUST avoid sending all notes during every synchronization.

Example:

Watch:
100 notes
Mobile:
1 changed note
Sync:
1 note

Synchronization should be based on:

updatedAt
version
or equivalent change tracking

⸻

34. Deletion Synchronization

A deleted mobile note MUST eventually be removed from the watch.

Recommended flow:

Mobile
   ↓
deletedAt = timestamp
   ↓
Sync
   ↓
Watch removes note
   ↓
Sync confirmed
   ↓
Mobile can permanently clean record

⸻

35. Sync Payload

The synchronization protocol MUST be versioned.

Example request:

{
  "type": "SYNC_REQUEST",
  "protocolVersion": 1
}

Example data:

{
  "type": "SYNC_DATA",
  "protocolVersion": 1,
  "notes": [
    {
      "id": "note-001",
      "folderId": "folder-work",
      "title": "API Architecture",
      "description": "Use Redis for caching...",
      "isPinned": true,
      "updatedAt": 1750000000000
    }
  ]
}

Completion:

{
  "type": "SYNC_COMPLETE",
  "protocolVersion": 1
}

The actual transport mechanism MUST be determined from the supported Zepp OS APIs during the communication POC.

⸻

36. Sync Integrity

Synchronization MUST be atomic from the user’s perspective.

The system MUST avoid a state where:

Half of the notes updated
Half of the notes corrupted

If a synchronization operation fails:

Previous valid watch state
        ↓
Sync failure
        ↓
Previous valid watch state remains

The application SHOULD use temporary staging data before replacing the active dataset where necessary.

⸻

37. Sync Retry

If synchronization fails:

Sync Failed
Reason:
Connection interrupted
        [Retry]

The mobile database MUST remain unchanged.

Existing watch data MUST remain available.

⸻

38. Sync Status

Possible states:

IDLE
CONNECTING
SYNCING
SUCCESS
FAILED
DISCONNECTED

The mobile application SHOULD show:

Watch Connected
Last synced:
Today 7:42 PM

⸻

39. Watch Storage

The watch MUST maintain its own local copy of synchronized notes.

Example:

Watch Storage
│
├── folders
│
└── notes

After synchronization:

Phone disconnected
        ↓
Open Notelet
        ↓
Notes still available

This is a core acceptance requirement.

⸻

40. Watch Storage Limit

The implementation MUST account for constrained watch storage.

The application SHOULD expose storage information such as:

Watch Notes
37 notes
28 KB used

If a configured storage threshold is reached:

Watch storage is almost full.
Remove some notes before syncing more.

Exact limits should be determined empirically for the supported devices rather than hardcoded from assumptions.

⸻

41. Conflict Resolution

MVP policy:

Mobile wins.

The watch is read-only.

Therefore, conflicting watch-side edits do not exist in the MVP.

This eliminates the need for complex conflict resolution.

⸻

42. Watch-Side Editing

Watch-side editing is explicitly excluded from MVP.

Reason:

* smartwatch typing is inconvenient;
* it complicates synchronization;
* it creates conflict resolution requirements;
* the primary use case is quick information access.

⸻

43. Error Handling

The application MUST handle:

Communication failure

Unable to connect to watch.

Sync failure

Sync failed.
Your existing notes are safe.

Storage failure

Unable to save notes on watch.

Invalid payload

Unable to synchronize this note.

Unsupported device

This device is not currently supported.

⸻

44. Security Requirements

For MVP:

* Do not transmit data unnecessarily.
* Do not log full note descriptions in production logs.
* Do not expose note content in debugging output.
* Protect local storage according to platform capabilities.
* Do not encourage users to store passwords or authentication secrets as ordinary notes.

Future cloud synchronization MUST use authenticated encrypted communication.

⸻

45. Performance Requirements

Mobile

Local operations SHOULD feel instantaneous.

Target:

Create note: <100 ms
Open note: <100 ms
Search: <200 ms

These are targets under normal dataset sizes, not hard guarantees.

Watch

The watch should:

* launch quickly;
* render lists efficiently;
* avoid unnecessary animations;
* avoid repeated database queries;
* avoid unnecessary synchronization.

⸻

46. Dataset Assumptions

MVP should be optimized for relatively small personal note collections.

Initial target:

Folders: <= 100
Notes: <= 1,000

The application SHOULD remain functional beyond these numbers but does not need to optimize aggressively for enterprise-scale datasets.

⸻

47. UX Requirements

General

The UI should be:

* minimal;
* clean;
* readable;
* fast;
* accessible;
* consistent.

Avoid unnecessary:

* animations;
* gradients;
* complex menus;
* excessive buttons;
* decorative UI.

⸻

48. Mobile Design Language

Suggested structure:

Home
────────────────
Search
⭐ Pinned
Recent
Folders

Primary actions should be obvious.

Creating a note should require minimal steps.

⸻

49. Watch Design Language

The watch should prioritize:

Readability
     ↓
Navigation
     ↓
Speed
     ↓
Information density

Not:

Visual decoration

⸻

50. Empty States

The application MUST provide meaningful empty states.

No folders

No folders yet.
Create your first folder.

No notes

No notes yet.
Create your first note.

No pinned notes

No pinned notes.

Watch has no synchronized notes

No notes on watch.
Sync notes from your phone.

⸻

51. Loading States

The application SHOULD display loading indicators for:

* initial database loading;
* synchronization;
* watch connection;
* large note operations.

The watch should avoid unnecessarily long loading screens for local operations.

⸻

52. Project Structure

Recommended conceptual mobile structure:

src/
├── components/
├── screens/
├── navigation/
├── database/
│   ├── schema/
│   ├── migrations/
│   ├── repositories/
│   └── database.ts
├── models/
├── services/
│   ├── notes/
│   ├── folders/
│   └── sync/
├── hooks/
├── utils/
├── constants/
└── types/

Watch:

watch/
├── app/
├── pages/
│   ├── home/
│   ├── folders/
│   ├── notes/
│   ├── note-detail/
│   ├── search/
│   └── pinned/
├── components/
├── services/
│   ├── storage/
│   └── sync/
├── models/
├── utils/
└── constants/

The exact Zepp project structure MUST follow the current official SDK requirements.

⸻

53. Code Quality Requirements

The implementation MUST:

* use TypeScript where supported;
* avoid any;
* use strongly typed domain models;
* separate UI from business logic;
* separate database operations from UI;
* separate synchronization logic from UI;
* use reusable components;
* avoid duplicated business logic;
* use constants/enums for status values;
* validate external synchronization payloads.

⸻

54. Domain Types

Conceptually:

type Folder = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};
type Note = {
  id: string;
  folderId: string | null;
  title: string;
  description: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

The actual implementation may adjust types according to the selected database and Zepp SDK.

⸻

55. Testing Strategy

Testing MUST cover four areas:

Unit
Integration
Device
End-to-End

⸻

56. Unit Tests

Test:

* note validation;
* folder validation;
* search;
* sorting;
* pinning;
* synchronization diff calculation;
* payload serialization;
* payload validation;
* deletion handling.

Example:

Given:
100 local notes
99 synchronized notes
When:
1 note changes
Then:
Sync engine returns exactly 1 update.

⸻

57. Integration Tests

Test:

Create note
    ↓
SQLite
    ↓
Sync Manager
    ↓
Payload

And:

Payload
    ↓
Watch receiver
    ↓
Watch storage
    ↓
UI

⸻

58. Device Testing Matrix

Every release candidate MUST be tested on:

Balance 3

Round
480 × 480
Zepp OS 5.0
API 4.4

Balance Ultra

Round
480 × 480
Zepp OS 5.0
API 4.4

Bip Max

Square
432 × 514
Zepp OS 5.0
API 4.4

⸻

59. Offline Test Cases

The following MUST pass:

OFFLINE-001
Create note without internet
OFFLINE-002
Edit note without internet
OFFLINE-003
Delete note without internet
OFFLINE-004
Search notes without internet
OFFLINE-005
Restart application while offline
OFFLINE-006
Read synchronized watch notes while phone is disconnected

⸻

60. Synchronization Test Cases

SYNC-001
Sync one new note
SYNC-002
Sync 10 new notes
SYNC-003
Update synchronized note
SYNC-004
Delete synchronized note
SYNC-005
Sync pinned status change
SYNC-006
Sync folder change
SYNC-007
Retry failed sync
SYNC-008
Disconnect during sync
SYNC-009
Repeat same sync
SYNC-010
Verify no duplicate notes

⸻

61. Critical End-to-End Test

The following scenario MUST pass before MVP release:

1. Create a folder on mobile.
2. Create a note.
3. Save the note.
4. Select the note for synchronization.
5. Synchronize with watch.
6. Open the note on watch.
7. Disconnect phone.
8. Disable internet.
9. Close Notelet.
10. Reopen Notelet on watch.
11. Open the same note.
12. Verify the complete text is still available.

Expected result:

The note remains fully accessible offline.

⸻

62. Communication Proof-of-Concept

Before full development, implement:

POC-001
Mobile → Watch "Hello Notelet"
POC-002
Watch stores payload
POC-003
Phone disconnected
POC-004
Watch displays stored payload
POC-005
Application restarted
POC-006
Payload remains available

If any of these fail, stop and resolve the communication/storage architecture before implementing the complete application.

⸻

63. Development Phases

Phase 0 — Platform Validation

Tasks:

- Verify Zepp OS SDK version
- Verify API 4.4 compatibility
- Verify target devices
- Verify communication APIs
- Verify watch local storage

Deliverable:

Working Phone → Watch text POC.

⸻

Phase 1 — Watch Foundation

Tasks:

- Create Zepp project
- Implement device detection/layout
- Implement home screen
- Implement folders
- Implement notes
- Implement note detail
- Implement scrolling
- Implement local storage

Deliverable:

Standalone offline watch note reader using mock data.

⸻

Phase 2 — Mobile Foundation

Tasks:

- Create React Native project
- Configure TypeScript
- Configure SQLite
- Create database schema
- Implement migrations
- Implement repositories

Deliverable:

Offline mobile database.

⸻

Phase 3 — Mobile UI

Tasks:

- Home
- Folders
- Notes
- Note editor
- Search
- Pinned
- Recent

Deliverable:

Fully functional offline Notes app.

⸻

Phase 4 — Sync Engine

Tasks:

- Sync models
- Sync protocol
- Change detection
- Create synchronization
- Update synchronization
- Delete synchronization
- Error handling
- Retry

Deliverable:

Reliable manual synchronization.

⸻

Phase 5 — Watch Integration

Tasks:

- Receive payload
- Validate payload
- Store notes
- Update existing notes
- Remove deleted notes
- Display sync status

Deliverable:

Mobile → Watch synchronized notes.

⸻

Phase 6 — Device Adaptation

Tasks:

- Round layout
- Square layout
- Safe areas
- Text sizing
- Scrolling
- Navigation

Deliverable:

Consistent experience on all three target devices.

⸻

Phase 7 — Testing

Tasks:

- Unit tests
- Integration tests
- Sync tests
- Offline tests
- Device tests
- Performance tests

Deliverable:

MVP release candidate.

⸻

64. MVP Acceptance Criteria

The MVP is considered complete only when all of the following are true:

Mobile

* User can create folders.
* User can edit folders.
* User can delete folders.
* User can create notes.
* User can edit notes.
* User can delete notes.
* User can search notes.
* User can pin notes.
* User can use all core features offline.

Watch

* Watch app launches successfully.
* Folders are displayed.
* Notes are displayed.
* Notes can be opened.
* Long notes can be scrolled.
* Pinned notes are accessible.
* Notes remain available offline.

Synchronization

* New notes sync.
* Updated notes sync.
* Deleted notes sync.
* Duplicate notes are prevented.
* Failed synchronization can be retried.
* Existing data survives failed synchronization.
* Incremental synchronization works.

Devices

* Balance 3 tested.
* Balance Ultra tested.
* Bip Max tested.
* Round layout tested.
* Square layout tested.

⸻

65. Future Architecture

The system SHOULD be designed so that future versions can introduce:

                 Notelet
                    │
        ┌───────────┼────────────┐
        │           │            │
      Mobile       Watch       Cloud
        │                        │
        │                     Backup
        │                     Sync
        │                        │
        └────────────┬───────────┘
                     │
                    AI
                     │
          ┌──────────┼──────────┐
          │          │          │
       Semantic    Summary    Related
        Search      Notes      Notes

Potential future features:

V1.1

* Automatic sync
* Recently viewed notes
* Better watch search
* Storage management
* Sorting

V2

* Cloud backup
* User accounts
* Multi-device synchronization
* Restore

V3

* AI semantic search
* AI summaries
* Automatic categorization
* Related notes
* Natural-language note discovery

⸻

66. Important Agent Instructions

An AI development agent implementing Notelet MUST follow these rules:

Rule 1

Do not start by building the entire application.

First validate Zepp phone/watch communication.

Rule 2

Do not add a backend for MVP.

The application must be local/offline-first.

Rule 3

Do not implement watch-side editing.

The watch is read-only in MVP.

Rule 4

Do not implement AI features in MVP.

Keep the architecture extensible, but focus on core functionality.

Rule 5

Do not hardcode one screen size.

Support:

480 × 480 round
432 × 514 square

Rule 6

Do not duplicate business logic for each watch model.

Use device-adaptive UI.

Rule 7

Mobile is the source of truth.

Watch data is a synchronized cache/local copy.

Rule 8

Never lose existing data because synchronization failed.

Synchronization must be recoverable.

Rule 9

Use strongly typed models.

Avoid any.

Rule 10

Keep the watch application lightweight.

Avoid unnecessary libraries, animations, network dependencies, and large payloads.

⸻

67. Recommended Implementation Order

The development agent should execute the work in this exact order:

1. Platform validation
        ↓
2. Zepp communication POC
        ↓
3. Watch local-storage POC
        ↓
4. Watch mock-data UI
        ↓
5. Mobile project setup
        ↓
6. Mobile SQLite
        ↓
7. Folder CRUD
        ↓
8. Note CRUD
        ↓
9. Search + Pin
        ↓
10. Mobile offline testing
        ↓
11. Sync protocol
        ↓
12. Mobile → Watch sync
        ↓
13. Incremental sync
        ↓
14. Delete sync
        ↓
15. Sync error recovery
        ↓
16. Round UI optimization
        ↓
17. Square UI optimization
        ↓
18. Device testing
        ↓
19. Performance testing
        ↓
20. MVP release

⸻

68. Definition of Done

A feature is Done only when:

Implementation
      +
Type safety
      +
Error handling
      +
Offline behavior
      +
Unit/integration tests where applicable
      +
UI validation
      +
Target-device validation where applicable

A task MUST NOT be considered complete merely because the UI appears to work.

⸻

69. Final Product Architecture

The intended MVP should ultimately look like:

                         NOTELET
                            │
              ┌─────────────┴─────────────┐
              │                           │
         MOBILE APP                  ZEPP WATCH APP
              │                           │
       ┌──────┴──────┐             ┌─────┴──────┐
       │             │             │            │
    Note UI       SQLite       Watch UI     Local DB
       │             │             │            │
       └──────┬──────┘             └─────┬──────┘
              │                          │
              │      Sync Manager        │
              └────────────┬─────────────┘
                           │
                    Zepp Communication
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      Balance 3      Balance Ultra      Bip Max
      480×480          480×480          432×514
       Round             Round            Square

Core success criterion

The entire product ultimately needs to deliver one simple experience:

Create a note on your phone → sync it to your watch → disconnect everything → open Notelet on your watch → read the note.

If that experience is fast, reliable, and genuinely pleasant, Notelet has achieved its core purpose.