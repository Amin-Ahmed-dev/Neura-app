# US-12 — Parental Controls & Reports

---

## US-12-01 · Link a Parent Account
**As a** Student,
**I want to** link my parent's phone number or email to my account,
**so that** they can receive weekly progress reports.

### Acceptance Criteria
- [ ] Option in Settings → "حساب الأهل"
- [ ] Student enters parent's WhatsApp number or email
- [ ] Parent receives a verification message to confirm the link
- [ ] Student can unlink parent at any time
- [ ] Only one parent account can be linked per student

**Priority:** P2

---

## US-12-02 · Weekly Parent Report (Saver Report)
**As a** Parent,
**I want to** receive a weekly summary of my child's study activity,
**so that** I can see their progress without invading their privacy.

### Acceptance Criteria
- [ ] Report sent every Sunday via WhatsApp (Twilio API) or email
- [ ] Report contains ONLY: Total focused hours this week, Streak days, Neurons earned, Estimated money saved vs. private tutoring cost
- [ ] Report does NOT contain: Chat history, individual mistakes, flashcard content, scores
- [ ] Report is in simple Arabic, easy to read on WhatsApp
- [ ] Parent can opt out of reports

**Priority:** P2

---

## US-12-03 · Parent Cannot Access Private Chat
**As a** Student,
**I want to** be sure my conversations with Neura are private,
**so that** I feel safe asking questions without fear of judgment.

### Acceptance Criteria
- [ ] Chat history is never included in parent reports
- [ ] No parent-facing view of chat exists in the app
- [ ] Privacy policy explicitly states this in Arabic
- [ ] Backend enforces this — no API endpoint exposes chat to parent accounts

**Priority:** P1

---

## US-12-04 · Family Plan Subscription
**As a** Parent,
**I want to** subscribe to a Family Plan for multiple children,
**so that** I get a discount compared to buying individual Pro plans.

### Acceptance Criteria
- [ ] Family Plan supports up to 4 student accounts
- [ ] Managed from a parent dashboard (web or app)
- [ ] Discounted price shown vs. individual Pro plans
- [ ] Parent can add/remove student accounts from the plan
- [ ] Each student retains full privacy within their own account

**Priority:** P3
