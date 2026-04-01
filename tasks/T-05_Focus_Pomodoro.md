# T-05 — Adaptive Pomodoro & Focus Mode
**Sprint:** 2 | **Priority:** P1/P2 | **Total Estimate:** 26 pts

---

## T-05-01 · Backend: Log Study Session
**Type:** ⚙️ Backend
**Story Ref:** US-04-05, US-04-06
**Estimate:** 2 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] Create `POST /api/v1/study/session` endpoint:
  - Accepts: `{ duration_minutes, subject, neurons_earned, completed, phase }`
  - Inserts record into `study_sessions` table
  - If `completed = true` → update `users.neurons_balance += neurons_earned`
  - Update `users.last_active_date` and recalculate streak:
    - If `last_active_date` was yesterday → `streak_count += 1`
    - If `last_active_date` was today → no change
    - If `last_active_date` was before yesterday → `streak_count = 1`
  - Insert `neurons_transactions` record
  - Returns: `{ session_id, new_neurons_balance, new_streak }`
- [ ] Write unit tests for streak calculation logic

---

## T-05-02 · Pomodoro Timer — Core Logic Hook
**Type:** 🎨 Frontend
**Story Ref:** US-04-01
**Estimate:** 3 pts
**Depends on:** T-01-06

### Subtasks
- [ ] Create `src/hooks/usePomodoroTimer.ts`:
  - State: `timeLeft`, `isRunning`, `phase` (work/break), `sessionCount`
  - `start()`, `pause()`, `reset()` actions
  - `useEffect` with `setInterval` — decrements `timeLeft` every second
  - On `timeLeft === 0` → call `handlePhaseComplete()`
  - `handlePhaseComplete()`:
    - If phase was `work` → award Neurons → switch to `break` → set `timeLeft = BREAK_DURATION`
    - If phase was `break` → switch to `work` → set `timeLeft = WORK_DURATION` → increment `sessionCount`
  - Persist timer state to `AsyncStorage` every 30 seconds (for crash recovery — see T-18-03)
- [ ] Constants: `WORK_DURATION = 25 * 60`, `BREAK_DURATION = 5 * 60`
- [ ] Timer must continue running when app is backgrounded (use `AppState` + `Date.now()` delta calculation)

---

## T-05-03 · Pomodoro Timer — UI Screen
**Type:** 🎨 Frontend
**Story Ref:** US-04-01
**Estimate:** 3 pts
**Depends on:** T-05-02, T-01-10

### Subtasks
- [ ] Build `app/(tabs)/focus.tsx`:
  - Phase label: "وقت التركيز 🔥" (work) / "استراحة 🌿" (break)
  - Large circular timer ring (SVG-based) with countdown
  - Timer color: Coral `#F97316` during work, Green `#10B981` during break
  - Minutes:seconds display in large tabular font
  - Play / Pause / Reset buttons
  - Active task name shown above timer (from `studyStore.activeTask`)
- [ ] Subject selector: dropdown/pill to tag the session with a subject
- [ ] Session count indicator: "الجلسة X من 4" (Pomodoro count)

---

## T-05-04 · Background Timer & Persistent Notification
**Type:** 🎨 Frontend
**Story Ref:** US-04-01, US-17-01
**Estimate:** 5 pts
**Depends on:** T-05-02, T-11-01

### Subtasks
- [ ] Use `AppState.addEventListener('change')` to detect background/foreground transitions
- [ ] On background:
  - Record `backgroundedAt = Date.now()`
  - Schedule a local notification for when the session ends: "انتهى وقت التركيز! خد استراحة 🎉"
  - Show persistent notification with remaining time: "⏳ 18:32 متبقي في جلستك"
- [ ] On foreground:
  - Calculate elapsed time: `elapsed = Date.now() - backgroundedAt`
  - Adjust `timeLeft = Math.max(0, timeLeft - elapsed)`
  - Cancel the scheduled end notification if session not yet complete
  - Cancel the persistent notification
- [ ] If `timeLeft` reached 0 while backgrounded → trigger completion flow on foreground
- [ ] Tapping persistent notification → bring app to foreground on Focus screen

---

## T-05-05 · Session Completion Flow
**Type:** 🎨 Frontend
**Story Ref:** US-04-05
**Estimate:** 3 pts
**Depends on:** T-05-02, T-05-01, T-10-01

### Subtasks
- [ ] On work session complete:
  - Play completion sound (short chime via `expo-av`)
  - Show celebratory animation: floating "+25 ⚡" text using `react-native-reanimated`
  - Update `studyStore.neurons += 25`, `studyStore.todayDeepWorkMinutes += 25`
  - Call `POST /study/session` (or queue if offline)
  - Update avatar mood if streak milestone reached
  - Auto-start break timer after 2-second celebration delay
- [ ] On break session complete:
  - Show break suggestion card (see T-05-07)
  - Auto-start next work session after student dismisses card

---

## T-05-06 · Session Abandonment Confirmation
**Type:** 🎨 Frontend
**Story Ref:** US-04-06
**Estimate:** 2 pts
**Depends on:** T-05-02, T-01-10

### Subtasks
- [ ] On Reset button press during active work session → show `ConfirmDialog`:
  - Title: "عايز تقف؟"
  - Body: "مش هتاخد نيورونز للجلسة دي"
  - Confirm: "أيوه، قف" | Cancel: "لا، كمل"
- [ ] On confirm:
  - Calculate partial Neurons: `elapsed < 10 min → 0`, `elapsed ≥ 10 min → proportional`
  - Log abandoned session to backend
  - Reset timer state
- [ ] On Android back button press during active session → same confirmation dialog (see T-18-02)

---

## T-05-07 · Break Suggestions
**Type:** 🎨 Frontend
**Story Ref:** US-04-04
**Estimate:** 3 pts
**Depends on:** T-05-05

### Subtasks
- [ ] Create `src/components/focus/BreakSuggestionCard.tsx`
- [ ] Define suggestion pool:
  - Stretch: "قوم اتمدد لمدة دقيقتين 🧘"
  - Eye rest: "20-20-20: بص على حاجة على بعد 20 متر لمدة 20 ثانية 👁️"
  - Hydration: "اشرب كوباية مية 💧"
  - Prayer: "وقت الصلاة! 🕌" (conditional)
- [ ] Prayer time check:
  - Use `expo-location` to get device coordinates
  - Calculate prayer times using `adhan` npm package (on-device, no API needed)
  - If current time is within 15 min of a prayer time → show prayer suggestion
- [ ] Rotate suggestions (don't repeat same suggestion twice in a row)
- [ ] Card is dismissible; break timer countdown shown on the card

---

## T-05-08 · Adaptive Timer (Flow State)
**Type:** 🎨 Frontend
**Story Ref:** US-04-02
**Estimate:** 2 pts
**Depends on:** T-05-02, T-01-06

### Subtasks
- [ ] Track `consecutiveCompletedPomodoros` in `studyStore`
- [ ] After 3 consecutive completions → show a bottom sheet:
  - "أنت في حالة تركيز ممتازة! تحب تمد الجلسة لـ 35 دقيقة؟"
  - "أيوه، مد" → set `WORK_DURATION = 35 * 60`, `BREAK_DURATION = 7 * 60`
  - "لا، كمل عادي" → keep defaults
- [ ] Adapted duration stored in `AsyncStorage` per user, resets every Monday

---

## T-05-09 · Focus Guard (App Blocker) — Android
**Type:** 🎨 Frontend
**Story Ref:** US-04-03
**Estimate:** 3 pts
**Depends on:** T-05-02

### Subtasks
- [ ] Research and implement Android Accessibility Service via Expo native module or `react-native-app-blocker`
- [ ] Settings screen: "تطبيقات محظورة" — list of installed apps with toggle
- [ ] Store blocked app list in `AsyncStorage`
- [ ] When timer is running + blocked app is opened → show full-screen overlay with Neura avatar: "مش دلوقتي، ركز! ⏳"
- [ ] Overlay has "ارجع للمذاكرة" button → brings Neura back to foreground
- [ ] Overlay auto-dismissed when timer ends or is paused
- [ ] First-time setup: show permission request screen with Arabic explanation
- [ ] Note: iOS Screen Time API is restricted; document limitation for iOS users
