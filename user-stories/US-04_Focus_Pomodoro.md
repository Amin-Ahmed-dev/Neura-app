# US-04 — Adaptive Pomodoro & Focus Mode

---

## US-04-01 · Start a Pomodoro Session
**As a** Student,
**I want to** start a 25-minute focus timer,
**so that** I can work in structured deep work intervals.

### Acceptance Criteria
- [ ] Default timer: 25 min work / 5 min break
- [ ] Large circular timer display with minutes:seconds
- [ ] Play / Pause / Reset controls
- [ ] Timer runs on-device (no internet required)
- [ ] Timer continues running if app is backgrounded
- [ ] Notification sent when session ends: "انتهى وقت التركيز! خد استراحة 🎉"

**Priority:** P1

---

## US-04-02 · Adaptive Timer (Flow State)
**As a** Student,
**I want to** have the timer adapt based on my focus state,
**so that** I'm not interrupted when I'm in deep flow.

### Acceptance Criteria
- [ ] After 3 consecutive completed Pomodoros → app suggests extending to 35/7 min
- [ ] Student can accept or keep default
- [ ] Adaptation is stored per-user and resets weekly
- [ ] Adaptation logic runs on-device

**Priority:** P2

---

## US-04-03 · Focus Guard (App Blocker)
**As a** Student,
**I want to** block social media apps while my timer is running,
**so that** I'm not tempted to check Instagram or TikTok during a session.

### Acceptance Criteria
- [ ] On Android: uses Accessibility API to detect and overlay blocked apps
- [ ] On iOS: uses Screen Time API (requires parental/user permission setup)
- [ ] Student selects which apps to block in Settings
- [ ] Blocked app overlay shows Neura's avatar with message: "مش دلوقتي، ركز! ⏳"
- [ ] Block is automatically lifted when timer ends or is paused
- [ ] First-time setup shows a clear permission request with explanation in Arabic

**Priority:** P2

---

## US-04-04 · Break Suggestions
**As a** Student,
**I want to** receive a contextual break suggestion when my Pomodoro ends,
**so that** I rest in a way that actually helps my brain recover.

### Acceptance Criteria
- [ ] Break suggestions rotate between: stretch exercise, 20-20-20 eye rest, hydration reminder
- [ ] If current time matches a prayer time (based on device location) → suggest prayer break
- [ ] Prayer times fetched from a local Islamic calendar API or on-device calculation
- [ ] Suggestion shown as a card with an illustration; dismissible
- [ ] Break timer counts down the 5-minute break

**Priority:** P2

---

## US-04-05 · Session Completion & Neuron Reward
**As a** Student,
**I want to** earn Neurons when I complete a full Pomodoro session,
**so that** I feel rewarded for my focus effort.

### Acceptance Criteria
- [ ] Completing a 25-min work session awards 25 Neurons
- [ ] A celebratory animation plays (confetti or avatar happy state)
- [ ] Neurons balance updates immediately on screen
- [ ] Session is logged to the backend (duration, subject, neurons earned)
- [ ] If offline → session is queued and synced when connection is restored

**Priority:** P1

---

## US-04-06 · Session Abandonment
**As a** Student,
**I want to** be able to stop a session early without penalty,
**so that** I don't feel punished for genuine interruptions.

### Acceptance Criteria
- [ ] Pressing Reset shows a confirmation: "عايز تقف؟ مش هتاخد نيورونز للجلسة دي"
- [ ] Partial sessions (< 10 min) earn 0 Neurons
- [ ] Partial sessions (≥ 10 min) earn proportional Neurons
- [ ] Abandoned session is still logged for analytics

**Priority:** P1
