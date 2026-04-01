# T-18 — App State, Background & Recovery
**Sprint:** 5 | **Priority:** P1/P2 | **Total Estimate:** 16 pts

---

## T-18-01 · Last Active Screen Persistence
**Type:** 🎨 Frontend
**Story Ref:** US-17-02
**Estimate:** 3 pts
**Depends on:** T-05-02, T-09-03, T-07-03

### Subtasks
- [ ] Create `src/hooks/useLastActiveScreen.ts`:
  - On every screen focus → save screen name + relevant state to AsyncStorage:
    - Focus screen: `{ screen: 'focus', timerState: { timeLeft, phase, isRunning } }`
    - Flashcard review: `{ screen: 'flashcards', cardId: currentCardId, deckId }`
    - Chat: `{ screen: 'chat', subject }`
  - Key: `last_active_screen`
- [ ] In `app/index.tsx` (root redirect):
  - After auth check, read `last_active_screen`
  - If active Pomodoro session → redirect to `/(tabs)/focus`
  - If flashcard review in progress → redirect to `app/flashcards/review`
  - Otherwise → redirect to `/(tabs)/home`
- [ ] Clear `last_active_screen` when user manually navigates away (not on background)

---

## T-18-02 · Android Back Button During Active Session
**Type:** 🎨 Frontend
**Story Ref:** US-17-03
**Estimate:** 2 pts
**Depends on:** T-05-02, T-01-10

### Subtasks
- [ ] In `app/(tabs)/focus.tsx`, use `useBackHandler` from `react-native-back-handler`:
  - If timer is running → intercept back button
  - Show `ConfirmDialog`: "جلستك شغالة! لو خرجت هتخسر النيورونز. متأكد؟"
  - "استمر في الدراسة" → dismiss dialog, stay on screen
  - "اخرج وخسر الجلسة" → log abandoned session → navigate back
- [ ] If timer is NOT running → allow normal back navigation

---

## T-18-03 · Session State Crash Recovery
**Type:** 🎨 Frontend
**Story Ref:** US-17-05
**Estimate:** 5 pts
**Depends on:** T-05-02

### Subtasks
- [ ] In `usePomodoroTimer.ts`, persist session state to AsyncStorage every 30 seconds:
  ```json
  {
    "sessionStartTime": 1234567890,
    "elapsedSeconds": 450,
    "subject": "رياضيات",
    "phase": "work",
    "isRunning": true
  }
  ```
  Key: `active_session`
- [ ] On app launch (in `app/_layout.tsx`):
  - Read `active_session` from AsyncStorage
  - If found and `isRunning === true`:
    - Calculate actual elapsed time: `actualElapsed = (Date.now() - sessionStartTime) / 1000`
    - If `actualElapsed < WORK_DURATION` → session may still be valid
    - Show recovery dialog: "لقينا جلسة ناقصة من قبل، تحسبها؟"
    - "أيوه" → award proportional Neurons + log session + clear `active_session`
    - "لا" → clear `active_session` without awarding
  - Recovery dialog shown only once (clear `active_session` after showing)
- [ ] Clear `active_session` on:
  - Normal session completion
  - Session abandonment (user confirms reset)
  - Logout

---

## T-18-04 · App Foreground/Background State Management
**Type:** 🎨 Frontend
**Story Ref:** US-17-01
**Estimate:** 3 pts
**Depends on:** T-05-04, T-12-01

### Subtasks
- [ ] Create `src/hooks/useAppState.ts`:
  - Subscribe to `AppState.addEventListener('change')`
  - On `background`:
    - Record `backgroundedAt = Date.now()` in AsyncStorage
    - If timer running → schedule end notification (T-05-04)
    - Pause sync queue processing
  - On `active` (foreground):
    - Read `backgroundedAt`
    - If timer was running → adjust `timeLeft` by elapsed time
    - Cancel scheduled notification if session not yet complete
    - Trigger sync queue processing (T-12-03)
    - Check for re-engagement (T-13-06)
- [ ] Apply `useAppState` in root `_layout.tsx`

---

## T-18-05 · Deep Link Handling
**Type:** 🎨 Frontend
**Story Ref:** US-16-01, US-16-02, US-16-04
**Estimate:** 3 pts
**Depends on:** T-11-01

### Subtasks
- [ ] Configure Expo Router deep linking in `app.json`:
  - Scheme: `neura://`
  - Paths: `/focus`, `/flashcards`, `/materials/{id}`, `/leaderboard`, `/chat`
- [ ] Handle notification tap deep links:
  - `{ screen: 'focus' }` → navigate to `/(tabs)/focus`
  - `{ screen: 'flashcards' }` → navigate to flashcard review
  - `{ screen: 'materials', material_id }` → navigate to material detail
  - `{ screen: 'leaderboard' }` → navigate to leaderboard
  - `{ screen: 'chat' }` → navigate to `/(tabs)/chat`
- [ ] Handle deep links when app is:
  - Closed (cold start) → launch app + navigate to target screen
  - Backgrounded → bring to foreground + navigate
  - Already open → navigate directly
- [ ] Test all notification deep links end-to-end
