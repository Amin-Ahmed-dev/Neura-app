# US-09 — Gamification (Neurons System & Leagues)

---

## US-09-01 · Earn Neurons
**As a** Student,
**I want to** earn Neurons for every study action I complete,
**so that** studying feels rewarding and game-like.

### Acceptance Criteria
- [ ] Neurons earned per action:
  - Complete 25-min Pomodoro: +25 Neurons
  - Complete a task: +5 Neurons
  - Complete a flashcard review session: +10 Neurons
  - 3-day streak maintained: +50 bonus Neurons
  - 7-day streak: +150 bonus Neurons
- [ ] Neurons balance always visible in the top bar of the home screen
- [ ] Earning animation plays on each reward (floating "+25 ⚡" text)
- [ ] Neurons are synced to server; not losable on app reinstall

**Priority:** P1

---

## US-09-02 · View Neurons Balance & History
**As a** Student,
**I want to** see how many Neurons I have and how I earned them,
**so that** I understand my progress and feel motivated.

### Acceptance Criteria
- [ ] Neurons balance shown in Profile tab
- [ ] Transaction history: date, action, amount earned
- [ ] Weekly Neurons earned chart (bar chart)
- [ ] "كيف تكسب أكتر؟" tips section

**Priority:** P2

---

## US-09-03 · Weekly Leaderboard (Leagues)
**As a** Student,
**I want to** compete with other students in a weekly leaderboard,
**so that** I'm motivated by friendly competition.

### Acceptance Criteria
- [ ] Three league tiers: School → City → National
- [ ] Leaderboard resets every Monday at midnight
- [ ] Student's rank and Neurons shown; top 3 highlighted with gold/silver/bronze
- [ ] Student can see their school name (anonymized if preferred)
- [ ] Promotion/demotion between leagues based on weekly rank
- [ ] Leaderboard data is anonymized (no real names unless student opts in)

**Priority:** P2

---

## US-09-04 · Redeem Neurons for Real-World Rewards
**As a** Student,
**I want to** exchange my Neurons for real rewards like mobile data or promo codes,
**so that** my study effort has tangible, real-world value.

### Acceptance Criteria
- [ ] Rewards store accessible from Profile tab
- [ ] Available rewards: mobile data packages (Vodafone/Orange/Etisalat), discount promo codes, event tickets
- [ ] Each reward shows: Neurons cost, partner logo, expiry date
- [ ] Redemption flow: confirm → Neurons deducted → reward code shown + sent via notification
- [ ] Insufficient Neurons → shows how many more are needed
- [ ] Rewards inventory managed by Neura admin

**Priority:** P2

---

## US-09-05 · Streak System
**As a** Student,
**I want to** maintain a daily study streak,
**so that** I build a consistent study habit.

### Acceptance Criteria
- [ ] Streak increments when student completes at least 1 Pomodoro per day
- [ ] Streak shown on dashboard and profile with a flame icon 🔥
- [ ] Streak broken if no session completed by midnight
- [ ] "Streak Freeze" item available in rewards store (costs Neurons) — protects streak for 1 day
- [ ] Streak milestone notifications: "3 أيام متتالية! 🔥", "أسبوع كامل! 🏆"

**Priority:** P1
