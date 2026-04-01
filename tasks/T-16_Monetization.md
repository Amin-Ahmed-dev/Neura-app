# T-16 — Monetization & Subscriptions
**Sprint:** 7 | **Priority:** P2 | **Total Estimate:** 21 pts

---

## T-16-01 · Backend: Plan Enforcement Middleware
**Type:** ⚙️ Backend + 🔒 Security
**Story Ref:** US-13-01, US-13-03
**Estimate:** 3 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] Create `app/dependencies.py` → `require_pro` dependency:
  - Checks `user.is_pro == True`
  - If not → raises `HTTPException(403, detail="هذه الميزة متاحة لمشتركي Pro فقط ⚡")`
- [ ] Apply `require_pro` to:
  - TTS endpoint (`/ai/tts`)
  - Concept map endpoint (`/materials/{id}/concept-map`)
  - Sleep insights endpoint (`/health/sleep/insights`)
- [ ] Create `app/services/plan_service.py`:
  - `check_pdf_page_limit(user_id, new_pages)` → raises error if Free user exceeds 50 pages/month
  - `check_chat_rate_limit(user_id)` → raises 429 if Free user exceeds 20 messages/day
  - `check_flashcard_limit(user_id)` → raises error if Free user exceeds 50 cards/month
- [ ] Track monthly usage in Redis: `usage:{user_id}:pdf_pages:{YYYY-MM}`, reset monthly

---

## T-16-02 · Frontend: Free Plan Limit Handling
**Type:** 🎨 Frontend
**Story Ref:** US-13-01
**Estimate:** 3 pts
**Depends on:** T-16-01

### Subtasks
- [ ] Create `src/components/ui/ProUpsellSheet.tsx`:
  - Bottom sheet with: feature name, what Pro unlocks, price in EGP
  - "ترقى لـ Pro ⚡" CTA button → navigates to upgrade screen
  - "مش دلوقتي" dismiss button
- [ ] Show `ProUpsellSheet` when:
  - API returns 403 with Pro-required error
  - User tries to use TTS, concept map, or sleep insights
  - PDF page limit reached
  - Chat daily limit reached
- [ ] Show upsell max once per session (track in `uiStore.upsellShownThisSession`)
- [ ] Free plan usage meter in Materials screen (T-08-05)

---

## T-16-03 · Pro Upgrade Screen
**Type:** 🎨 Frontend
**Story Ref:** US-13-02
**Estimate:** 3 pts
**Depends on:** T-16-02

### Subtasks
- [ ] Create `app/upgrade.tsx`:
  - Header: "نيورا Pro ⚡"
  - Comparison table: Free vs. Pro features (checkmarks)
  - Price: displayed in EGP with tagline "أقل من حصة خصوصي واحدة في الشهر"
  - Payment options: Credit/Debit card, Vodafone Cash, Fawry
  - "اشترك دلوقتي" CTA button
  - "مش دلوقتي" back link
- [ ] Accessible from: Profile tab, ProUpsellSheet, any Pro-gated feature

---

## T-16-04 · Backend: Payment Integration
**Type:** ⚙️ Backend
**Story Ref:** US-13-02
**Estimate:** 5 pts
**Depends on:** T-16-03

### Subtasks
- [ ] Integrate Paymob (Egyptian payment gateway) for:
  - Credit/Debit card
  - Vodafone Cash
  - Fawry
- [ ] Create `subscriptions` table:
  ```
  id, user_id (FK), plan_type (pro/family), status (active/cancelled/expired),
  paymob_subscription_id, amount_egp, billing_cycle_start, billing_cycle_end,
  created_at, cancelled_at
  ```
- [ ] `POST /api/v1/subscriptions/create` → initiate Paymob payment:
  - Returns payment URL/token for frontend to open
- [ ] `POST /api/v1/subscriptions/webhook` → Paymob webhook:
  - On successful payment → set `users.is_pro = true`, create subscription record
  - On failed payment → return error
- [ ] `POST /api/v1/subscriptions/cancel` → cancel subscription:
  - Set `status = 'cancelled'`
  - `is_pro` remains true until `billing_cycle_end`
- [ ] Auto-renewal: cron job checks `billing_cycle_end` daily → charge via Paymob recurring

---

## T-16-05 · Frontend: Payment Flow
**Type:** 🎨 Frontend
**Story Ref:** US-13-02
**Estimate:** 3 pts
**Depends on:** T-16-04

### Subtasks
- [ ] On "اشترك دلوقتي" tap → call `POST /subscriptions/create`
- [ ] Open Paymob payment page in `expo-web-browser` (in-app browser)
- [ ] Handle deep link callback after payment:
  - Success → update `authStore.user.isPro = true` → show success screen with confetti
  - Failure → show error with retry option
- [ ] Success screen: "مبروك! أنت دلوقتي Pro ⚡" + list of unlocked features

---

## T-16-06 · Subscription Management Screen
**Type:** 🎨 Frontend
**Story Ref:** US-13-04
**Estimate:** 2 pts
**Depends on:** T-16-04

### Subtasks
- [ ] Create `app/settings/subscription.tsx`:
  - Plan type badge (Pro / Family / Free)
  - Renewal date: "بيتجدد في [date]"
  - Payment method (last 4 digits of card or Vodafone Cash)
  - "إلغاء الاشتراك" button → confirmation dialog → call `POST /subscriptions/cancel`
  - After cancellation: "اشتراكك هيفضل شغال لحد [end_date]"
- [ ] Accessible from Profile → "إدارة الاشتراك" (shown only if Pro)

---

## T-16-07 · Pro Badge & Visual Indicators
**Type:** 🎨 Frontend
**Story Ref:** US-13-03
**Estimate:** 2 pts
**Depends on:** T-16-05

### Subtasks
- [ ] Pro badge (⚡ gold) shown next to name in Profile tab
- [ ] Pro badge shown on leaderboard next to student's name
- [ ] Pro-gated features show lock icon (🔒) for Free users
- [ ] After upgrade → remove all lock icons immediately (update `authStore.user.isPro`)
