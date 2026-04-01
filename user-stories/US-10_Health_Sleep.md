# US-10 — Health & Sleep Tracking

---

## US-10-01 · Set Bedtime & Wake Time
**As a** Student,
**I want to** set my target bedtime and wake-up time,
**so that** Neura can help me maintain a healthy sleep schedule.

### Acceptance Criteria
- [ ] Bedtime and wake time set in Settings → Health
- [ ] Default: Bedtime 11:00 PM, Wake 6:30 AM
- [ ] Times saved locally on device
- [ ] Used to trigger grayscale nudge (30 min before bedtime) and smart alarm

**Priority:** P2

---

## US-10-02 · Face-Down Sleep Tracking
**As a** Student,
**I want to** place my phone face-down to start sleep tracking,
**so that** Neura can monitor my sleep duration using the accelerometer.

### Acceptance Criteria
- [ ] When phone is placed face-down after bedtime → sleep tracking starts automatically
- [ ] Uses device accelerometer (on-device, no internet needed)
- [ ] Sleep start time recorded
- [ ] Student can also manually tap "بدأت أنام" to start tracking
- [ ] A subtle "تتبع النوم شغال 🌙" notification shown (dismissible)

**Priority:** P2

---

## US-10-03 · Smart Alarm (90-Minute Sleep Cycle)
**As a** Student,
**I want to** be woken up at the end of a 90-minute sleep cycle,
**so that** I wake up feeling refreshed instead of groggy.

### Acceptance Criteria
- [ ] Smart alarm calculates wake time based on sleep start + nearest 90-min cycle boundary
- [ ] Alarm fires within a ±15 min window of the target wake time
- [ ] Alarm sound is gentle and escalating
- [ ] To dismiss the alarm → student must scan a barcode (e.g., toothpaste tube)
- [ ] Barcode scan uses device camera; any barcode accepted
- [ ] If barcode not scanned within 2 minutes → alarm escalates in volume
- [ ] Snooze is NOT available (by design — forces the student to get up)

**Priority:** P2

---

## US-10-04 · Sleep History & Insights
**As a** Student,
**I want to** see my sleep history and how it correlates with my study performance,
**so that** I understand the impact of sleep on my learning.

### Acceptance Criteria
- [ ] Weekly sleep chart: hours slept per night
- [ ] Correlation insight: "في الأيام اللي نمت 7+ ساعات، مراجعتك كانت أحسن بـ 30%"
- [ ] Average sleep duration shown
- [ ] Data stored locally; anonymized before server sync
- [ ] Available for Pro users only

**Priority:** P3
