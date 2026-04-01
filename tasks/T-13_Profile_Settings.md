# T-13 — Profile & Settings
**Sprint:** 5 | **Priority:** P1/P2 | **Total Estimate:** 16 pts

---

## T-13-01 · Profile Screen
**Type:** 🎨 Frontend
**Story Ref:** US-11-01
**Estimate:** 3 pts
**Depends on:** T-04-05, T-10-04

### Subtasks
- [ ] Build `app/(tabs)/profile.tsx`:
  - Neura avatar (mood-based, from T-04-05)
  - Student name + type badge
  - Stats row: Neurons balance, current streak, total deep work hours
  - "Pro ⚡" badge if subscribed
  - Sections:
    - "نيوروناتي" → Neurons history screen
    - "الترتيب الأسبوعي" → Leaderboard screen
    - "متجر المكافآت" → Rewards store
    - "الإشعارات" → Notification preferences
    - "الخصوصية والأمان" → Privacy settings
    - "حساب الأهل" → Parental link
    - "ترقية لـ Pro ⚡" → Pro upgrade screen (if Free)
    - "إدارة الاشتراك" → Subscription management (if Pro)
    - "تسجيل الخروج" → Logout (red, bottom)

---

## T-13-02 · Edit Profile
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-11-02
**Estimate:** 2 pts
**Depends on:** T-13-01, T-02-01

### Subtasks
- [ ] Tap name/avatar area → navigate to `app/settings/edit-profile.tsx`
- [ ] Editable fields: Display name, Student type (pill selector), School/University name (optional text)
- [ ] Email shown as read-only with note: "الإيميل بيتدار عن طريق Firebase"
- [ ] Backend: `PATCH /api/v1/users/profile` → update name, student_type, school_name
- [ ] On save → update `authStore.user` + show success toast

---

## T-13-03 · Privacy Settings Screen
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-11-04, US-12-03
**Estimate:** 3 pts
**Depends on:** T-13-01, T-02-07

### Subtasks
- [ ] Create `app/settings/privacy.tsx`:
  - Toggle: "ظهر اسمي في الترتيب" (default: off)
  - Toggle: "ساعد نيورا يتحسن ببياناتي" (default: off)
  - Link: "سياسة الخصوصية" → opens in-app browser
  - Info box: "محادثتك مع نيورا خاصة تماماً — مش بيشوفها حد" (with lock icon)
  - "احذف حسابي" → danger button → leads to account deletion flow (T-02-07)
- [ ] Backend: `PATCH /api/v1/users/privacy-settings`

---

## T-13-04 · App Settings (Language, Theme, Bedtime)
**Type:** 🎨 Frontend
**Story Ref:** US-11-05, US-10-01, US-03-05
**Estimate:** 2 pts
**Depends on:** T-13-01

### Subtasks
- [ ] Create `app/settings/app-settings.tsx`:
  - Language: Arabic (display only, v1 has no other option)
  - Theme: Dark Mode (display only, v1 default)
  - Bedtime: time picker (default 23:00) → stored in AsyncStorage → used by grayscale nudge (T-04-07)
  - Wake time: time picker (default 06:30) → used by smart alarm (T-14-03)
  - Study reminder time: time picker (default 19:00) → synced to backend (T-11-02)

---

## T-13-05 · Backend: User Profile API
**Type:** ⚙️ Backend
**Story Ref:** US-11-01, US-11-02
**Estimate:** 2 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] `GET /api/v1/users/me` → return full user profile:
  ```json
  {
    "id", "name", "email", "student_type", "school_name",
    "is_pro", "neurons_balance", "streak_count",
    "total_deep_work_minutes", "reminder_time",
    "notification_preferences": {},
    "privacy_settings": {}
  }
  ```
- [ ] `PATCH /api/v1/users/profile` → update profile fields
- [ ] `PATCH /api/v1/users/notification-preferences` → update notification toggles
- [ ] `PATCH /api/v1/users/privacy-settings` → update privacy toggles
- [ ] `POST /api/v1/users/push-token` → store/update FCM push token

---

## T-13-06 · Re-engagement Screen (Long Absence)
**Type:** 🎨 Frontend
**Story Ref:** US-17-04
**Estimate:** 2 pts
**Depends on:** T-04-02, T-01-06

### Subtasks
- [ ] On app launch, check `lastActiveDate` from `studyStore`
- [ ] If `today - lastActiveDate >= 3 days`:
  - Show re-engagement card on home screen (above the main CTA)
  - Message: "وحشتني! يلا نرجع للمذاكرة سوا 💪"
  - Show last streak before absence
  - CTA: "ابدأ من الأول 🚀"
  - Dismiss button (X)
- [ ] Card shown only once per absence period (store `reengagementShownDate` in AsyncStorage)
- [ ] Streak is reset (handled by backend), but Neurons balance preserved
