# T-10 — Neurons & Gamification
**Sprint:** 4 | **Priority:** P1/P2 | **Total Estimate:** 23 pts

---

## T-10-01 · Backend: Neurons Transaction Engine
**Type:** ⚙️ Backend
**Story Ref:** US-09-01, US-09-02
**Estimate:** 3 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] Create `app/services/neurons_service.py`:
  - `award_neurons(user_id, amount, action_type)`:
    - Inserts into `neurons_transactions`
    - Updates `users.neurons_balance += amount`
    - Returns new balance
  - `deduct_neurons(user_id, amount, reason)`:
    - Checks balance ≥ amount; raises error if not
    - Inserts negative transaction
    - Updates balance
- [ ] Define `action_type` enum: `pomodoro_complete`, `task_complete`, `flashcard_session`, `streak_3_day`, `streak_7_day`, `redemption`
- [ ] Neurons per action (constants):
  - Pomodoro complete: 25
  - Task complete: 5
  - Flashcard session: 10
  - 3-day streak bonus: 50
  - 7-day streak bonus: 150
- [ ] `GET /api/v1/neurons/history?page=1` → paginated transaction history
- [ ] `GET /api/v1/neurons/balance` → current balance

---

## T-10-02 · Backend: Streak Engine
**Type:** ⚙️ Backend
**Story Ref:** US-09-05
**Estimate:** 3 pts
**Depends on:** T-05-01, T-10-01

### Subtasks
- [ ] Streak logic in `POST /study/session` (already in T-05-01):
  - If `last_active_date == yesterday` → `streak += 1`
  - If `last_active_date == today` → no change
  - Else → `streak = 1`
  - Update `last_active_date = today`
- [ ] Streak milestone detection:
  - After update, check if streak == 3 → award 50 bonus Neurons + send notification
  - Check if streak == 7 → award 150 bonus Neurons + send notification
  - Check if streak == 30 → award 500 bonus Neurons + send notification
- [ ] Streak freeze logic:
  - `users.streak_freeze_count` field
  - Cron job at 00:05: for users with `last_active_date < yesterday` and `streak_freeze_count > 0` → decrement freeze, keep streak
  - For users with no freeze → reset streak to 0

---

## T-10-03 · Backend: Weekly Leaderboard
**Type:** ⚙️ Backend
**Story Ref:** US-09-03
**Estimate:** 5 pts
**Depends on:** T-10-01

### Subtasks
- [ ] Create `leaderboard_entries` table:
  ```
  id, user_id (FK), week_start (date), league (school/city/national),
  weekly_neurons (int), rank (int), school_name, city
  ```
- [ ] Cron job every Monday 00:00:
  - Calculate weekly Neurons for each user (sum of `neurons_transactions` for the week)
  - Rank users within each league tier
  - Determine promotions/demotions:
    - Top 20% of school league → promote to city
    - Top 20% of city league → promote to national
    - Bottom 20% → demote
  - Insert new week's entries
- [ ] `GET /api/v1/leaderboard?league=school&week=current` → top 50 + user's rank
- [ ] Anonymization: return `display_name` (anonymized ID unless user opted in)

---

## T-10-04 · Frontend: Neurons Balance & History
**Type:** 🎨 Frontend
**Story Ref:** US-09-01, US-09-02
**Estimate:** 3 pts
**Depends on:** T-10-01, T-04-02

### Subtasks
- [ ] Neurons balance badge in home screen header (always visible)
- [ ] Earning animation: when Neurons are awarded → floating "+X ⚡" text animates upward from the action point using `react-native-reanimated`
- [ ] In Profile tab → "نيوروناتي" section:
  - Current balance (large number)
  - Weekly bar chart (7 days, Neurons earned per day) using `react-native-chart-kit`
  - Transaction history list: date, action label (Arabic), amount (+/-)
  - "كيف تكسب أكتر؟" expandable tips section

---

## T-10-05 · Frontend: Leaderboard Screen
**Type:** 🎨 Frontend
**Story Ref:** US-09-03
**Estimate:** 3 pts
**Depends on:** T-10-03

### Subtasks
- [ ] Create `app/leaderboard.tsx`:
  - League tier tabs: "مدرستي" / "مدينتي" / "مصر كلها"
  - Top 3: gold/silver/bronze podium display
  - Ranked list: rank number, avatar, display name, weekly Neurons
  - User's own rank highlighted (sticky at bottom if not in top 50)
  - Leaderboard resets countdown: "يتجدد في X أيام"
- [ ] Promotion/demotion banner: "🏆 اتترقيت!" or "حافظ على مكانك"
- [ ] Accessible from Profile tab → "الترتيب الأسبوعي"

---

## T-10-06 · Backend & Frontend: Rewards Store
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-09-04
**Estimate:** 5 pts
**Depends on:** T-10-01

### Subtasks
- [ ] Backend:
  - `rewards` table: `id, title, description, neurons_cost, partner_logo_url, expiry_date, stock_count, reward_type (data/promo/ticket)`
  - `GET /api/v1/rewards` → list available rewards
  - `POST /api/v1/rewards/{id}/redeem`:
    - Check user balance ≥ cost
    - Check stock > 0
    - Deduct Neurons
    - Decrement stock
    - Return reward code
    - Send push notification with code
- [ ] Frontend: `app/rewards.tsx`:
  - Grid of reward cards: partner logo, title, Neurons cost
  - Filter by type: بيانات / خصومات / تذاكر
  - Tap reward → show detail sheet with description + "استبدل" button
  - Insufficient Neurons → show "محتاجك X نيورون أكتر" with progress bar
  - Redemption success → show code in a copyable card + confetti animation
- [ ] Accessible from Profile tab → "متجر المكافآت"
