# US-03 — Home Dashboard

---

## US-03-01 · Daily Stats Overview
**As a** Student,
**I want to** see my key study stats at a glance when I open the app,
**so that** I'm immediately aware of my progress without digging through menus.

### Acceptance Criteria
- [ ] Dashboard shows: Deep Work Time today, Current Streak (days), Neurons balance
- [ ] Stats update in real-time as sessions are completed
- [ ] Stats are loaded from local cache first (offline-safe), then synced with server
- [ ] Greeting uses student's first name: "أهلاً، [Name] 👋"

**Priority:** P1

---

## US-03-02 · Frictionless "Start Next Task" Button
**As a** Student,
**I want to** see a large, prominent "ابدأ المهمة الجاية" button on the home screen,
**so that** I can start studying immediately without decision fatigue.

### Acceptance Criteria
- [ ] Button is the most visually dominant element on the home screen
- [ ] Tapping it starts the Pomodoro timer for the next pending task
- [ ] If no tasks exist → prompt to add a task first
- [ ] Button color is Emerald Green (`#10B981`) to signal a positive action

**Priority:** P1

---

## US-03-03 · Today's Task List Preview
**As a** Student,
**I want to** see my tasks for today on the home screen,
**so that** I know what I need to accomplish without switching tabs.

### Acceptance Criteria
- [ ] Shows max 3 tasks to avoid overwhelm (with "عرض الكل" link)
- [ ] Each task shows: subject, estimated time, completion checkbox
- [ ] Completed tasks show a strikethrough with green color
- [ ] No infinite scroll — fixed height list

**Priority:** P1

---

## US-03-04 · Neura Avatar Mood
**As a** Student,
**I want to** see Neura's avatar change mood based on my streak and consistency,
**so that** I feel emotionally connected and motivated to maintain my habit.

### Acceptance Criteria
- [ ] Avatar states: Happy (streak ≥ 3 days), Neutral (streak = 0–2), Sad (missed yesterday), Excited (new personal record)
- [ ] Avatar is animated (subtle idle animation)
- [ ] Tapping the avatar opens a quick motivational message from Neura in Arabic
- [ ] Avatar mood updates on app launch and after each completed session

**Priority:** P2

---

## US-03-05 · Grayscale Bedtime Nudge
**As a** Student,
**I want to** see the UI gradually turn grayscale 30 minutes before my set bedtime,
**so that** I'm nudged to stop using my phone and prepare for sleep.

### Acceptance Criteria
- [ ] User sets bedtime in Settings (default: 11:00 PM)
- [ ] 30 mins before bedtime → entire app UI transitions to grayscale
- [ ] A soft message appears: "قرب وقت النوم، خلص اللي عليك وارتاح 🌙"
- [ ] Student can dismiss the nudge for the night ("تمام، هخلص بسرعة")
- [ ] Grayscale resets at midnight

**Priority:** P2

---

## US-03-06 · Fluency Meter
**As a** Student,
**I want to** see a "Fluency Meter" on my dashboard,
**so that** I can track how well I'm retaining the material I'm studying.

### Acceptance Criteria
- [ ] Displayed as a progress bar or circular gauge on the dashboard
- [ ] Score is calculated from flashcard recall accuracy over the last 7 days
- [ ] Tapping it shows a breakdown by subject
- [ ] Updates after every flashcard review session

**Priority:** P2
