# T-04 — Home Dashboard
**Sprint:** 2 | **Priority:** P1/P2 | **Total Estimate:** 18 pts

---

## T-04-01 · Backend: Stats API Endpoint
**Type:** ⚙️ Backend
**Story Ref:** US-03-01
**Estimate:** 2 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] Create `GET /api/v1/study/stats` endpoint:
  - Protected by `get_current_user` dependency
  - Returns:
    ```json
    {
      "today_deep_work_minutes": 75,
      "current_streak": 5,
      "neurons_balance": 1250,
      "fluency_score": 0.72,
      "tasks_today": { "total": 4, "completed": 2 }
    }
    ```
  - `today_deep_work_minutes`: sum of `study_sessions.duration_minutes` for today
  - `current_streak`: from `users.streak_count`
  - `fluency_score`: average flashcard ease_factor over last 7 days (0.0–1.0)
- [ ] Add Redis caching: cache stats per user for 60 seconds

---

## T-04-02 · Dashboard — Stats Row
**Type:** 🎨 Frontend
**Story Ref:** US-03-01
**Estimate:** 2 pts
**Depends on:** T-04-01, T-01-06

### Subtasks
- [ ] In `app/(tabs)/home.tsx`, build stats row with two `StatCard` components:
  - Deep Work Time: formatted as "Xس Yd" (hours + minutes)
  - Current Streak: "X يوم 🔥"
- [ ] Neurons balance shown in top-right header badge: "X نيورون ⚡"
- [ ] Stats loaded from `studyStore` (local cache) on mount
- [ ] Trigger `GET /study/stats` in background; update store on response
- [ ] Stats update in real-time after each completed Pomodoro session (via store subscription)

---

## T-04-03 · Dashboard — "Start Next Task" CTA Button
**Type:** 🎨 Frontend
**Story Ref:** US-03-02
**Estimate:** 2 pts
**Depends on:** T-04-02, T-06-01

### Subtasks
- [ ] Large green CTA button: "ابدأ المهمة الجاية" with play icon
- [ ] On tap:
  - If pending tasks exist → set active task in `studyStore` → navigate to `/(tabs)/focus`
  - If no tasks → show bottom sheet: "مفيش مهام! ضيف مهمة الأول" with "ضيف مهمة" CTA
- [ ] Button must be the most visually dominant element (large, full-width, rounded)
- [ ] Color: `#10B981` (Emerald Green)

---

## T-04-04 · Dashboard — Today's Task Preview
**Type:** 🎨 Frontend
**Story Ref:** US-03-03
**Estimate:** 3 pts
**Depends on:** T-06-01, T-06-02

### Subtasks
- [ ] Show max 3 tasks from today's task list
- [ ] Each task row: subject tag (colored pill), task title, estimated time, checkbox
- [ ] Tapping checkbox → marks task complete (calls `studyStore.completeTask()`)
- [ ] Completed tasks: strikethrough text + green checkbox
- [ ] "عرض الكل" link at bottom → navigate to `/(tabs)/tasks` (full task list)
- [ ] Fixed height container — no scroll on home screen
- [ ] Empty state: "مفيش مهام النهارده 🎉 ضيف مهمة جديدة"

---

## T-04-05 · Dashboard — Neura Avatar Mood
**Type:** 🎨 Frontend
**Story Ref:** US-03-04
**Estimate:** 3 pts
**Depends on:** T-01-06

### Subtasks
- [ ] Create `src/components/avatar/NeuraAvatar.tsx`
- [ ] Define 4 mood states with corresponding assets/emoji:
  - `happy`: streak ≥ 3 days → 😄 + green glow
  - `neutral`: streak 0–2 → 🙂 + no glow
  - `sad`: missed yesterday → 😔 + dim appearance
  - `excited`: new personal record → 🤩 + animated pulse
- [ ] Mood computed in `src/hooks/useAvatarMood.ts` based on `studyStore` values
- [ ] Add subtle idle animation using `react-native-reanimated` (gentle float/pulse)
- [ ] Tapping avatar → show `ConfirmDialog`-style modal with a motivational Arabic message from a predefined array (5+ messages per mood state)
- [ ] Avatar mood updates on app foreground and after each session completion

---

## T-04-06 · Dashboard — Fluency Meter
**Type:** 🎨 Frontend
**Story Ref:** US-03-06
**Estimate:** 3 pts
**Depends on:** T-04-01, T-09-02

### Subtasks
- [ ] Create `src/components/dashboard/FluencyMeter.tsx`
- [ ] Display as circular progress gauge (use `react-native-svg` or `react-native-circular-progress`)
- [ ] Score from `studyStore.fluencyScore` (0.0–1.0 → 0%–100%)
- [ ] Color: green if > 70%, orange if 40–70%, red if < 40%
- [ ] Tapping meter → navigate to a subject breakdown screen (list of subjects + individual scores)
- [ ] Updates after every flashcard review session

---

## T-04-07 · Dashboard — Grayscale Bedtime Nudge
**Type:** 🎨 Frontend
**Story Ref:** US-03-05
**Estimate:** 3 pts
**Depends on:** T-01-06, T-13-01 (Settings bedtime)

### Subtasks
- [ ] Create `src/hooks/useGrayscaleNudge.ts`:
  - Read `bedtime` from user settings (default 23:00)
  - Every minute, check if current time is within 30 min before bedtime
  - If yes → set `uiStore.isGrayscale = true`
  - Reset at midnight → `uiStore.isGrayscale = false`
- [ ] In root `_layout.tsx`: wrap app in a `View` with `style={{ filter: 'grayscale(1)' }}` when `isGrayscale` is true
  - Note: React Native doesn't support CSS filter; use `ColorMatrix` from `react-native-color-matrix-image-filters` or a custom shader
- [ ] Show dismissible banner: "قرب وقت النوم، خلص اللي عليك وارتاح 🌙"
- [ ] "تمام، هخلص بسرعة" button → sets `uiStore.grayscaleDismissedTonight = true` → suppresses for the night
- [ ] Dismissed state resets at midnight
