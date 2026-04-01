# US-16 — Push Notifications & Reminders

---

## US-16-01 · Daily Study Reminder
**As a** Student,
**I want to** receive a daily reminder to study,
**so that** I don't forget to maintain my streak.

### Acceptance Criteria
- [ ] Default reminder at 7:00 PM (customizable in Settings)
- [ ] Message varies daily to avoid habituation (e.g., "نيورا بتستناك! 📚", "السلسلة بتاعتك في خطر 🔥")
- [ ] Tapping notification opens the app directly to the Focus tab
- [ ] Reminder not sent if student already completed a session today
- [ ] Student can disable reminders in Settings

**Priority:** P1

---

## US-16-02 · Streak at Risk Alert
**As a** Student,
**I want to** be alerted when my streak is about to break,
**so that** I have a chance to do a quick session before midnight.

### Acceptance Criteria
- [ ] Alert sent at 9:00 PM if no session completed that day
- [ ] Message: "سلسلتك هتنكسر في 3 ساعات! عمل جلسة صغيرة دلوقتي 🔥"
- [ ] Tapping notification → opens Focus tab with timer ready to start
- [ ] Alert only sent if student has a streak ≥ 2 days (no alert for day 0)

**Priority:** P1

---

## US-16-03 · Flashcard Review Due Reminder
**As a** Student,
**I want to** be reminded when I have flashcards due for review,
**so that** I don't fall behind on my spaced repetition schedule.

### Acceptance Criteria
- [ ] Notification sent when student has ≥ 5 cards due
- [ ] Message: "عندك X كارت للمراجعة النهارده 🧠"
- [ ] Tapping notification → opens the flashcard review screen
- [ ] Sent max once per day (morning, around 10:00 AM)

**Priority:** P2

---

## US-16-04 · Material Processing Complete
**As a** Student,
**I want to** be notified when my uploaded PDF has been processed,
**so that** I know when my flashcards and chunks are ready.

### Acceptance Criteria
- [ ] Push notification sent when processing is complete
- [ ] Message: "موادك جاهزة! الفلاش كارد اتعملت ✨"
- [ ] Tapping notification → opens the material detail screen
- [ ] Notification sent even if app is closed

**Priority:** P1

---

## US-16-05 · Leaderboard Weekly Result
**As a** Student,
**I want to** be notified of my weekly leaderboard result,
**so that** I know if I was promoted, stayed, or demoted.

### Acceptance Criteria
- [ ] Notification sent every Monday morning
- [ ] Message varies: "🏆 اتترقيت للدوري الجديد!" / "حافظ على مكانك الأسبوع الجاي 💪"
- [ ] Tapping notification → opens Leaderboard screen

**Priority:** P2
