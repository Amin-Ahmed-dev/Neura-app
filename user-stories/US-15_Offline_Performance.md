# US-15 — Offline Mode & Performance

---

## US-15-01 · Core Features Work Offline
**As a** Student with no internet,
**I want to** use the Pomodoro timer, view tasks, and review flashcards,
**so that** a bad connection doesn't stop my study session.

### Acceptance Criteria
- [ ] Pomodoro timer: fully offline ✅
- [ ] Task list (view, add, complete): fully offline ✅
- [ ] Flashcard review (pre-downloaded decks): fully offline ✅
- [ ] Sleep tracking: fully offline ✅
- [ ] AI chat: requires internet — shows clear message when offline
- [ ] PDF upload: requires internet — shows clear message when offline
- [ ] Offline banner shown at top of screen (non-blocking)

**Priority:** P1

---

## US-15-02 · Offline Data Sync on Reconnect
**As a** Student,
**I want to** have my offline actions automatically synced when I reconnect,
**so that** I don't lose any progress earned without internet.

### Acceptance Criteria
- [ ] Completed sessions, tasks, and Neurons earned offline are queued locally
- [ ] On reconnect → sync queue is processed in background
- [ ] Student sees a brief "تم المزامنة ✅" confirmation
- [ ] No duplicate data created on sync
- [ ] Conflict resolution: server data wins for Neurons balance; local data wins for task completion

**Priority:** P1

---

## US-15-03 · App Performance
**As a** Student on a mid-range Android device,
**I want to** experience smooth navigation and fast load times,
**so that** the app doesn't frustrate me.

### Acceptance Criteria
- [ ] App cold start < 3 seconds on a mid-range device (e.g., Samsung A-series)
- [ ] Tab navigation transitions < 300ms
- [ ] Flashcard flip animation runs at 60fps
- [ ] No janky scrolling in task list or chat history
- [ ] APK size < 50MB

**Priority:** P1
