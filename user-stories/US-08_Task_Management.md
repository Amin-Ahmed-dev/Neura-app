# US-08 — Task Management & AI Co-pilot

---

## US-08-01 · Add a Task
**As a** Student,
**I want to** add a study task with a subject and estimated time,
**so that** I have a clear plan for what to study.

### Acceptance Criteria
- [ ] Quick-add form: Task name, Subject, Estimated duration, Due date
- [ ] Task is added to today's list immediately
- [ ] Input is RTL; Arabic keyboard opens by default
- [ ] Task saved locally first (offline-safe), then synced to server
- [ ] Confirmation haptic feedback on save

**Priority:** P1

---

## US-08-02 · Complete a Task
**As a** Student,
**I want to** mark a task as done,
**so that** I feel a sense of accomplishment and my progress is tracked.

### Acceptance Criteria
- [ ] Tap checkbox to complete a task
- [ ] Completed task shows strikethrough + green color
- [ ] Completing a task awards bonus Neurons (5 Neurons per task)
- [ ] Completion triggers a small celebratory animation
- [ ] Completed tasks move to a "منجز" section at the bottom of the list

**Priority:** P1

---

## US-08-03 · Guilt-Free Rollover
**As a** Student,
**I want to** have unfinished tasks automatically rescheduled,
**so that** I don't feel guilty about tasks I couldn't finish today.

### Acceptance Criteria
- [ ] At midnight, any incomplete tasks are automatically moved to the next available day
- [ ] Student sees a morning notification: "عندك X مهام اتنقلوا من امبارح، يلا نبدأ 💪"
- [ ] Rolled-over tasks are visually marked with a small "↩" indicator
- [ ] Student can manually reschedule a task to a specific date
- [ ] Rollover logic runs on-device (no internet needed)

**Priority:** P1

---

## US-08-04 · Everest Method — Big Goal Breakdown
**As a** Student,
**I want to** enter a big goal (e.g., "أجيب 95% في الرياضيات") and have Neura break it into micro-steps,
**so that** I have a clear, actionable weekly plan instead of a vague ambition.

### Acceptance Criteria
- [ ] "أضف هدف كبير" option in task management
- [ ] Student enters: Goal description, Target date, Subject
- [ ] AI generates a week-by-week breakdown of micro-tasks
- [ ] Student can edit, reorder, or delete generated micro-tasks
- [ ] Progress toward the big goal shown as a percentage bar
- [ ] Requires internet connection for AI generation

**Priority:** P2

---

## US-08-05 · Weekly Planner View
**As a** Student,
**I want to** see my tasks organized in a weekly calendar view,
**so that** I can plan my study week at a glance.

### Acceptance Criteria
- [ ] Horizontal week strip at the top; tap a day to see its tasks
- [ ] Shows total estimated study time per day
- [ ] Warns if a day is overloaded (> 4 hours): "النهارده كتير أوي، فكر توزع المهام"
- [ ] No infinite scroll — fixed 7-day view

**Priority:** P2
