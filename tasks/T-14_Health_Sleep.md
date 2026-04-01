# T-14 — Health & Sleep Tracking
**Sprint:** 6 | **Priority:** P2/P3 | **Total Estimate:** 18 pts

---

## T-14-01 · Bedtime & Wake Time Settings
**Type:** 🎨 Frontend
**Story Ref:** US-10-01
**Estimate:** 1 pt
**Depends on:** T-13-04

### Subtasks
- [ ] Bedtime and wake time pickers already in App Settings (T-13-04)
- [ ] Store in AsyncStorage: `settings.bedtime` and `settings.wakeTime`
- [ ] Sync to backend: `PATCH /api/v1/users/profile` with `bedtime` and `wake_time` fields
- [ ] Verify grayscale nudge (T-04-07) reads from this setting

---

## T-14-02 · Face-Down Sleep Tracking
**Type:** 🎨 Frontend
**Story Ref:** US-10-02
**Estimate:** 5 pts
**Depends on:** T-13-04

### Subtasks
- [ ] Install `expo-sensors` (Accelerometer)
- [ ] Create `src/hooks/useSleepTracking.ts`:
  - Subscribe to `Accelerometer.addListener`
  - Detect face-down: `z < -0.8` (phone face down on flat surface)
  - Only activate after bedtime (check `settings.bedtime`)
  - On face-down detected for > 30 seconds → start sleep tracking:
    - Record `sleepStartTime = Date.now()`
    - Set `uiStore.isSleepTracking = true`
    - Show dismissible notification: "تتبع النوم شغال 🌙"
  - On face-up detected → record `sleepEndTime`, calculate duration
- [ ] Manual "بدأت أنام" button in Health section of profile
- [ ] Sleep data stored in `sleep_sessions` table (WatermelonDB + server):
  ```
  id, user_id, sleep_start, sleep_end, duration_minutes, created_at
  ```
- [ ] Accelerometer runs on-device (no internet needed)
- [ ] Battery optimization: reduce accelerometer polling rate to 1Hz during sleep tracking

---

## T-14-03 · Smart Alarm (90-Minute Cycle)
**Type:** 🎨 Frontend
**Story Ref:** US-10-03
**Estimate:** 5 pts
**Depends on:** T-14-02, T-11-01

### Subtasks
- [ ] Create `src/services/smartAlarmService.ts`:
  - Input: `sleepStartTime`, `targetWakeTime` (from settings)
  - Calculate optimal wake time:
    - `cyclesNeeded = Math.round((targetWakeTime - sleepStartTime) / 90min)`
    - `optimalWakeTime = sleepStartTime + cyclesNeeded * 90min`
    - Clamp to ±15 min window around `targetWakeTime`
  - Schedule local notification at `optimalWakeTime`
- [ ] Alarm notification:
  - Sound: gentle escalating tone (custom audio file via `expo-av`)
  - Persistent — cannot be dismissed by swiping
  - Action: "أوقف المنبه" → opens app to barcode scanner
- [ ] Barcode scanner to dismiss alarm:
  - Open `expo-barcode-scanner` on alarm dismiss tap
  - Any valid barcode accepted
  - On scan → stop alarm sound + show "صباح الخير! 🌅" screen
  - If no scan within 2 minutes → escalate alarm volume
- [ ] Snooze button: intentionally NOT present
- [ ] Request camera permission for barcode scanner on first alarm setup

---

## T-14-04 · Sleep History & Insights — Pro Feature
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-10-04
**Estimate:** 5 pts
**Depends on:** T-14-02, T-16-01 (Pro gate)

### Subtasks
- [ ] Backend: `GET /api/v1/health/sleep?days=30` → sleep sessions for last 30 days
- [ ] Backend: `GET /api/v1/health/sleep/insights` → correlation analysis:
  - For each day with sleep data + study data → calculate correlation
  - Return: `{ avg_sleep_hours, best_study_day_sleep, insight_message }`
- [ ] Frontend: `app/health/sleep.tsx`:
  - Weekly bar chart: hours slept per night (7 days)
  - Average sleep duration badge
  - Insight card: "في الأيام اللي نمت 7+ ساعات، مراجعتك كانت أحسن بـ 30%"
  - Monthly calendar view: color-coded by sleep duration
- [ ] Pro gate: if Free → show blurred chart + "ترقى لـ Pro عشان تشوف التحليل"
- [ ] Data anonymized before server sync (no raw timestamps, only durations)

---

## T-14-05 · Health Section in Profile
**Type:** 🎨 Frontend
**Story Ref:** US-10-01, US-10-02
**Estimate:** 2 pts
**Depends on:** T-14-02, T-14-03

### Subtasks
- [ ] Add "الصحة والنوم" section in Profile tab
- [ ] Shows: last night's sleep duration, average this week, smart alarm status (on/off)
- [ ] "تفاصيل النوم" → navigates to sleep history screen (T-14-04)
- [ ] "تفعيل المنبه الذكي" toggle → enables/disables smart alarm
