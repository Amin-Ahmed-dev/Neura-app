# US-17 — Background, App Close & Return States

---

## US-17-01 · Timer Continues in Background
**As a** Student,
**I want to** switch to another app while my Pomodoro timer is running,
**so that** I can check something quickly without losing my session.

### Acceptance Criteria
- [ ] Timer continues counting when app is backgrounded
- [ ] A persistent notification shows remaining time: "⏳ 18:32 متبقي في جلستك"
- [ ] Tapping the notification brings the app back to the Focus screen
- [ ] Timer state is preserved exactly when app is foregrounded again
- [ ] If app is killed by OS → timer state is restored from AsyncStorage on next launch

**Priority:** P1

---

## US-17-02 · Return to App Mid-Session
**As a** Student,
**I want to** return to the app and immediately see where I left off,
**so that** I don't lose context or have to navigate back to my task.

### Acceptance Criteria
- [ ] If a Pomodoro session was active → app opens directly to Focus screen with timer running
- [ ] If student was reviewing flashcards → app opens to the flashcard they were on
- [ ] If student was in chat → app opens to chat with history intact
- [ ] Last active screen is persisted in AsyncStorage

**Priority:** P1

---

## US-17-03 · App Close During Active Session
**As a** Student,
**I want to** be warned before closing the app during an active Pomodoro session,
**so that** I don't accidentally lose my progress.

### Acceptance Criteria
- [ ] On Android back button press during active timer → show dialog: "جلستك شغالة! لو خرجت هتخسر النيورونز. متأكد؟"
- [ ] Options: "استمر في الدراسة" (dismiss) / "اخرج وخسر الجلسة" (confirm exit)
- [ ] On iOS swipe-to-close → timer continues in background (no warning needed)

**Priority:** P1

---

## US-17-04 · Cold Start After Long Absence
**As a** Student returning after several days of not using the app,
**I want to** see a motivating re-engagement screen,
**so that** I feel welcomed back rather than guilty.

### Acceptance Criteria
- [ ] If student hasn't opened the app in ≥ 3 days → show a re-engagement card on home screen
- [ ] Message from Neura: "وحشتني! يلا نرجع للمذاكرة سوا 💪" (not guilt-tripping)
- [ ] Card shows: last streak before absence, a "ابدأ من الأول" CTA
- [ ] Card is dismissible and shown only once per absence period
- [ ] Streak is reset but Neurons balance is preserved

**Priority:** P2

---

## US-17-05 · Session State Recovery After Crash
**As a** Student,
**I want to** recover my session if the app crashes,
**so that** I don't lose Neurons I earned.

### Acceptance Criteria
- [ ] Session state (start time, elapsed time, subject) written to AsyncStorage every 30 seconds
- [ ] On next app launch after a crash → detect incomplete session
- [ ] Show dialog: "لقينا جلسة ناقصة من قبل، تحسبها؟"
- [ ] If confirmed → award proportional Neurons for completed portion
- [ ] Recovery dialog shown only once per crash event

**Priority:** P2
