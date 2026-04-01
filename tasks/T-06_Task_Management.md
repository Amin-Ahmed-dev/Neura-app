# T-06 — Task Management & AI Co-pilot
**Sprint:** 2 | **Priority:** P1/P2 | **Total Estimate:** 21 pts

---

## T-06-01 · Backend: Tasks CRUD API
**Type:** ⚙️ Backend
**Story Ref:** US-08-01, US-08-02, US-08-03
**Estimate:** 3 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] Create `app/routers/tasks.py` with the following endpoints:
  - `GET /api/v1/tasks?date=YYYY-MM-DD` → list tasks for a given date
  - `POST /api/v1/tasks` → create task `{ title, subject, estimated_minutes, due_date }`
  - `PATCH /api/v1/tasks/{id}` → update task (title, subject, due_date, completed)
  - `DELETE /api/v1/tasks/{id}` → delete task
  - `POST /api/v1/tasks/{id}/complete` → mark complete + award 5 Neurons
- [ ] All endpoints protected by `get_current_user`
- [ ] `POST /api/v1/tasks/rollover` → move all incomplete tasks from yesterday to today (called by cron job at midnight)
- [ ] Write unit tests for rollover logic

---

## T-06-02 · Frontend: Task List Screen
**Type:** 🎨 Frontend
**Story Ref:** US-08-01, US-08-02
**Estimate:** 3 pts
**Depends on:** T-06-01, T-01-08

### Subtasks
- [ ] Create `app/(tabs)/tasks.tsx` (new tab or accessible from home)
- [ ] Task list sections:
  - "مهام النهارده" — pending tasks
  - "منجز ✅" — completed tasks (collapsed by default)
- [ ] Each task row:
  - Subject pill (color-coded by subject)
  - Task title (RTL)
  - Estimated time badge
  - Checkbox (tap to complete)
  - Swipe-left to delete (with confirmation)
  - Swipe-right to reschedule (date picker)
- [ ] Rolled-over tasks show "↩" indicator
- [ ] Empty state: "مفيش مهام! ضيف مهمة جديدة 🎯"
- [ ] Load from WatermelonDB first (offline-safe), sync with server in background

---

## T-06-03 · Frontend: Add Task Bottom Sheet
**Type:** 🎨 Frontend
**Story Ref:** US-08-01
**Estimate:** 3 pts
**Depends on:** T-01-10, T-01-08

### Subtasks
- [ ] Create `src/components/tasks/AddTaskSheet.tsx` using `@gorhom/bottom-sheet`
- [ ] Form fields (RTL):
  - Task name (text input, Arabic keyboard)
  - Subject (pill selector: رياضيات / فيزياء / كيمياء / أحياء / عربي / إنجليزي / تاريخ / جغرافيا / عام)
  - Estimated duration (stepper: 15 / 30 / 45 / 60 / 90 min)
  - Due date (date picker, default: today)
- [ ] On save:
  - Validate: title required
  - Save to WatermelonDB immediately (offline-safe)
  - Trigger haptic feedback (`expo-haptics`)
  - Queue sync to server
  - Close sheet + show task in list
- [ ] "+" FAB button on task screen opens this sheet

---

## T-06-04 · Frontend: Complete Task Flow
**Type:** 🎨 Frontend
**Story Ref:** US-08-02
**Estimate:** 2 pts
**Depends on:** T-06-02, T-10-01

### Subtasks
- [ ] On checkbox tap:
  - Animate checkbox to checked state (spring animation)
  - Apply strikethrough to task title
  - Move task to "منجز" section with slide animation
  - Update WatermelonDB `completed = true`
  - Dispatch `studyStore.addNeurons(5)`
  - Show floating "+5 ⚡" animation
  - Queue `POST /tasks/{id}/complete` for server sync

---

## T-06-05 · Midnight Rollover Logic
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-08-03
**Estimate:** 3 pts
**Depends on:** T-06-01, T-06-02

### Subtasks
- [ ] Frontend: on app foreground, check if `lastRolloverDate` in AsyncStorage ≠ today
  - If yes → run local rollover: update WatermelonDB tasks with `due_date < today` and `completed = false` → set `due_date = today`, `rolled_over = true`
  - Update `lastRolloverDate = today`
- [ ] Backend: cron job (APScheduler) runs at 00:05 daily:
  - Calls rollover logic for all users
  - Marks tasks as rolled over in PostgreSQL
- [ ] Morning notification (see T-11-03): "عندك X مهام اتنقلوا من امبارح"
- [ ] Rolled-over tasks display "↩" badge in the UI

---

## T-06-06 · Weekly Planner View
**Type:** 🎨 Frontend
**Story Ref:** US-08-05
**Estimate:** 3 pts
**Depends on:** T-06-02

### Subtasks
- [ ] Add horizontal week strip at top of task screen
- [ ] Each day shows: day name (Arabic), date, task count badge
- [ ] Tapping a day → filters task list to that day
- [ ] Today is highlighted with primary color
- [ ] Show total estimated minutes per day below the day name
- [ ] If a day has > 240 min (4 hours) of tasks → show orange warning dot
- [ ] Fixed 7-day view (current week); no infinite scroll

---

## T-06-07 · Everest Method — Big Goal Breakdown
**Type:** 🎨 Frontend + 🧠 AI
**Story Ref:** US-08-04
**Estimate:** 5 pts
**Depends on:** T-06-03, T-07-01 (AI service)

### Subtasks
- [ ] Add "أضف هدف كبير 🏔️" button in task screen header
- [ ] Create `app/goals/new.tsx` form:
  - Goal description (text, e.g., "أجيب 95% في الرياضيات")
  - Subject selector
  - Target date (date picker)
- [ ] On submit → call `POST /api/v1/ai/everest`:
  - Backend sends goal to GPT-4o-mini with prompt: "Break this goal into weekly micro-tasks in Egyptian Arabic"
  - Returns array of `{ week, tasks: [{ title, estimated_minutes }] }`
- [ ] Show generated tasks in a review screen — student can edit/delete/reorder
- [ ] On confirm → bulk-create tasks in WatermelonDB + server
- [ ] Goal progress bar: `completed_tasks / total_tasks * 100%`
- [ ] Goals listed in a "أهدافي الكبيرة" section in the task screen
