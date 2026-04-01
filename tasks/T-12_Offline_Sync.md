# T-12 — Offline Mode & Data Sync
**Sprint:** 5 | **Priority:** P1 | **Total Estimate:** 16 pts

---

## T-12-01 · Network Status Detection
**Type:** 🎨 Frontend
**Story Ref:** US-15-01, US-01-04
**Estimate:** 2 pts
**Depends on:** T-01-08

### Subtasks
- [ ] Install `@react-native-community/netinfo`
- [ ] Create `src/hooks/useNetworkStatus.ts`:
  - Subscribe to `NetInfo.addEventListener`
  - Update `uiStore.isOffline` on every change
  - On reconnect → trigger sync queue (T-12-03)
- [ ] `OfflineBanner` component (already in T-03-04): shown when `isOffline === true`
- [ ] Per-feature offline checks:
  - AI Chat send button: disabled + tooltip "محتاج إنترنت" when offline
  - PDF upload button: disabled + tooltip when offline
  - Feynman voice: disabled when offline
  - All other features: work normally

---

## T-12-02 · Offline-First Data Layer
**Type:** 🏗️ Setup
**Story Ref:** US-15-01
**Estimate:** 3 pts
**Depends on:** T-01-08

### Subtasks
- [ ] All reads go to WatermelonDB first:
  - Tasks: `src/services/taskService.ts` → reads from WatermelonDB, writes to WatermelonDB + queues server sync
  - Study sessions: same pattern
  - Flashcard reviews: same pattern
- [ ] Create `src/services/syncQueue.ts`:
  - `enqueue(entity_type, entity_id, action, payload)` → inserts into `sync_queue` WatermelonDB table
  - `getQueue()` → returns all unsynced items
  - `markSynced(id)` → removes from queue
- [ ] Verify: complete a task with airplane mode → task shows as complete locally

---

## T-12-03 · Sync Queue Processing
**Type:** 🎨 Frontend
**Story Ref:** US-15-02
**Estimate:** 5 pts
**Depends on:** T-12-01, T-12-02

### Subtasks
- [ ] Create `src/services/syncService.ts`:
  - `processSyncQueue()`:
    1. Get all items from `sync_queue`
    2. For each item, call the appropriate API endpoint
    3. On success → `markSynced(id)`
    4. On failure → increment `retry_count`; skip if `retry_count > 3`
  - Process items in order (FIFO)
  - Run in background (non-blocking)
- [ ] Trigger `processSyncQueue()` on:
  - App foreground (from background)
  - Network reconnect
  - App launch (if queue is non-empty)
- [ ] Conflict resolution:
  - Neurons balance: server wins (fetch fresh balance after sync)
  - Task completion: local wins (send completion to server)
  - Flashcard reviews: merge (send all reviews, server recalculates)
- [ ] Show "تم المزامنة ✅" toast after successful sync
- [ ] Show "X عناصر في انتظار المزامنة" badge in profile if queue is non-empty

---

## T-12-04 · Offline Flashcard Review
**Type:** 🎨 Frontend
**Story Ref:** US-15-01
**Estimate:** 3 pts
**Depends on:** T-09-03, T-12-02

### Subtasks
- [ ] Flashcard review reads due cards from WatermelonDB (already downloaded)
- [ ] SM-2 calculation runs on-device (implement `sm2_service.ts` mirror of backend logic)
- [ ] Review ratings saved to WatermelonDB immediately
- [ ] Queued for server sync via `syncQueue`
- [ ] Neurons earned offline → stored in `studyStore` → synced on reconnect
- [ ] Verify: complete a full flashcard session with airplane mode → ratings saved, Neurons awarded

---

## T-12-05 · Performance Targets Verification
**Type:** 🧪 Testing
**Story Ref:** US-15-03
**Estimate:** 3 pts
**Depends on:** All Sprint 1–4 tasks

### Subtasks
- [ ] Measure cold start time on Samsung Galaxy A32 (mid-range target device):
  - Target: < 3 seconds
  - Use `expo-splash-screen` timing logs
- [ ] Measure tab navigation transition time:
  - Target: < 300ms
  - Use React Native Performance Monitor
- [ ] Verify flashcard flip animation at 60fps:
  - Use `react-native-reanimated` (runs on UI thread)
  - Test on low-end device
- [ ] Check APK size after build:
  - Target: < 50MB
  - Use `expo build:android` + analyze bundle
- [ ] Fix any performance issues found (lazy loading, image optimization, bundle splitting)
