# US-01 — Onboarding & App Launch

---

## US-01-01 · Splash Screen
**As a** Student,
**I want to** see the Neura logo and a branded splash screen when I open the app,
**so that** I feel the app is loading and professional.

### Acceptance Criteria
- [ ] Splash screen shows Neura logo (🧠 + "نيورا") on `#0F172A` background
- [ ] Splash auto-dismisses after assets are loaded (max 2s)
- [ ] If user is already logged in → redirect to Home tab
- [ ] If user is not logged in → redirect to Welcome screen

**Priority:** P1

---

## US-01-02 · Welcome Screen
**As a** first-time Student,
**I want to** see a welcoming screen that explains what Neura is,
**so that** I understand the app's value before signing up.

### Acceptance Criteria
- [ ] Shows Neura's dynamic avatar (default neutral mood)
- [ ] Tagline displayed in Arabic: "رفيقك الذكي في رحلة التعلم"
- [ ] Two clear CTAs: "ابدأ رحلتك" (Register) and "عندي حساب بالفعل" (Login)
- [ ] Dark mode is the default — no light mode option on this screen
- [ ] No infinite scroll; single static screen

**Priority:** P1

---

## US-01-03 · First-Time Onboarding Tour
**As a** newly registered Student,
**I want to** go through a short onboarding tour after registering,
**so that** I understand the key features (Pomodoro, Neurons, Neura chat) before using the app.

### Acceptance Criteria
- [ ] 3–4 swipeable onboarding cards shown only once after first registration
- [ ] Cards cover: Focus Timer, Neurons currency, AI companion Neura
- [ ] Each card has Arabic copy and a relevant illustration
- [ ] "تخطي" (Skip) button available on every card
- [ ] After last card → navigate to Home tab
- [ ] Tour is never shown again after completion or skip (persisted in AsyncStorage)

**Priority:** P2

---

## US-01-04 · Offline Launch
**As a** Student with no internet connection,
**I want to** still open the app and access my timer and tasks,
**so that** unstable internet in Egypt doesn't block my study session.

### Acceptance Criteria
- [ ] App launches successfully with no internet
- [ ] Pomodoro timer, local tasks, and streak data load from on-device storage (WatermelonDB/AsyncStorage)
- [ ] A subtle banner shows "أنت أوفلاين — بعض الميزات مش متاحة" (non-blocking)
- [ ] AI chat and PDF upload are disabled with a clear message when offline

**Priority:** P1
