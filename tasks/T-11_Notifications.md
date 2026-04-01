# T-11 — Push Notifications & Reminders
**Sprint:** 4 | **Priority:** P1/P2 | **Total Estimate:** 18 pts

---

## T-11-01 · Setup: Expo Notifications + FCM
**Type:** 🏗️ Setup
**Story Ref:** US-16-01
**Estimate:** 3 pts
**Depends on:** T-01-01, T-01-05

### Subtasks
- [ ] Install `expo-notifications`
- [ ] Configure FCM (Firebase Cloud Messaging) in Firebase Console
- [ ] Add `google-services.json` FCM config to Android build
- [ ] In `app/_layout.tsx` on mount:
  - Request notification permissions with Arabic explanation
  - Get Expo Push Token: `Notifications.getExpoPushTokenAsync()`
  - Send token to backend: `POST /api/v1/users/push-token`
- [ ] Backend: store push token in `users.push_token` field
- [ ] Create `app/services/notification_service.py`:
  - `send_push(user_id, title, body, data)` → calls Expo Push API
  - Batch sending support for leaderboard notifications
- [ ] Test: send a test notification from backend to a device

---

## T-11-02 · Daily Study Reminder
**Type:** ⚙️ Backend + 🎨 Frontend
**Story Ref:** US-16-01
**Estimate:** 3 pts
**Depends on:** T-11-01

### Subtasks
- [ ] Backend cron job (daily at user's reminder time, default 19:00 Cairo time):
  - Query users where `last_active_date < today` (haven't studied today)
  - Send push notification with rotating messages:
    - "نيورا بتستناك! 📚"
    - "السلسلة بتاعتك في خطر 🔥"
    - "يلا نذاكر شوية؟ 🧠"
    - "دقيقة واحدة تفرق! ابدأ جلسة صغيرة ⏱️"
  - Notification `data`: `{ screen: 'focus' }` → deep link to Focus tab
- [ ] Frontend: handle notification tap → navigate to `/(tabs)/focus`
- [ ] Settings: user can change reminder time or disable it (stored in `users.reminder_time`)

---

## T-11-03 · Streak at Risk Alert
**Type:** ⚙️ Backend
**Story Ref:** US-16-02
**Estimate:** 2 pts
**Depends on:** T-11-01, T-10-02

### Subtasks
- [ ] Backend cron job (daily at 21:00 Cairo time):
  - Query users where:
    - `last_active_date < today` (no session today)
    - `streak_count >= 2` (has a streak worth protecting)
  - Send push: "سلسلتك هتنكسر في 3 ساعات! عمل جلسة صغيرة دلوقتي 🔥"
  - Notification `data`: `{ screen: 'focus', autoStart: true }`
- [ ] Do NOT send if daily reminder was already sent and user has studied since

---

## T-11-04 · Flashcard Review Due Reminder
**Type:** ⚙️ Backend
**Story Ref:** US-16-03
**Estimate:** 2 pts
**Depends on:** T-11-01, T-09-01

### Subtasks
- [ ] Backend cron job (daily at 10:00 Cairo time):
  - Query users with `COUNT(flashcards WHERE next_review_date <= today) >= 5`
  - Send push: "عندك {count} كارت للمراجعة النهارده 🧠"
  - Notification `data`: `{ screen: 'flashcards' }`
- [ ] Sent max once per day per user

---

## T-11-05 · Material Processing Complete Notification
**Type:** ⚙️ Backend
**Story Ref:** US-16-04
**Estimate:** 2 pts
**Depends on:** T-11-01, T-08-03

### Subtasks
- [ ] In chunking worker (T-08-03), after `processing_status = 'complete'`:
  - Call `notification_service.send_push(user_id, "موادك جاهزة! ✨", "الفلاش كارد اتعملت، ابدأ المراجعة دلوقتي")`
  - Notification `data`: `{ screen: 'materials', material_id: id }`
- [ ] Frontend: handle deep link → navigate to material detail screen

---

## T-11-06 · Streak Milestone Notifications
**Type:** ⚙️ Backend
**Story Ref:** US-09-05
**Estimate:** 2 pts
**Depends on:** T-11-01, T-10-02

### Subtasks
- [ ] In streak engine (T-10-02), after streak update:
  - streak == 3 → send "3 أيام متتالية! 🔥 كسبت 50 نيورون إضافي"
  - streak == 7 → send "أسبوع كامل! 🏆 كسبت 150 نيورون إضافي"
  - streak == 30 → send "شهر كامل! 🌟 أنت بطل!"

---

## T-11-07 · Leaderboard Weekly Result Notification
**Type:** ⚙️ Backend
**Story Ref:** US-16-05
**Estimate:** 2 pts
**Depends on:** T-11-01, T-10-03

### Subtasks
- [ ] In leaderboard cron job (Monday 00:00), after calculating new ranks:
  - For promoted users → send "🏆 اتترقيت للدوري الجديد! استمر كده"
  - For demoted users → send "حافظ على مكانك الأسبوع الجاي 💪"
  - For top 3 → send "🥇 أنت في المراكز الأولى! رائع"
  - Notification `data`: `{ screen: 'leaderboard' }`

---

## T-11-08 · Notification Preferences (Frontend)
**Type:** 🎨 Frontend
**Story Ref:** US-11-03
**Estimate:** 2 pts
**Depends on:** T-11-01

### Subtasks
- [ ] In Settings screen, create "الإشعارات" section:
  - Toggle: تذكير المذاكرة اليومي (+ time picker)
  - Toggle: تنبيه السلسلة
  - Toggle: نتيجة الترتيب الأسبوعي
  - Toggle: الفلاش كارد الجاهزة للمراجعة
  - Toggle: المواد جاهزة
  - Quiet hours: "لا إشعارات من X لـ Y"
- [ ] Save preferences to backend: `PATCH /api/v1/users/notification-preferences`
- [ ] Backend respects preferences before sending each notification type
