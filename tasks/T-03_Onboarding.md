# T-03 — Onboarding & App Launch
**Sprint:** 1 | **Priority:** P1/P2 | **Total Estimate:** 13 pts

---

## T-03-01 · Splash Screen
**Type:** 🎨 Frontend
**Story Ref:** US-01-01
**Estimate:** 2 pts
**Depends on:** T-01-01, T-01-02

### Subtasks
- [ ] Configure `expo-splash-screen` in `app.json`:
  - Background color: `#0F172A`
  - Image: Neura logo asset
- [ ] In `app/_layout.tsx`:
  - Call `SplashScreen.preventAutoHideAsync()` on mount
  - Wait for: fonts loaded + auth state resolved
  - Call `SplashScreen.hideAsync()` when ready
- [ ] Auth state check on splash:
  - Token found + valid → navigate to `/(tabs)/home`
  - No token → navigate to `/(auth)/welcome`
- [ ] Ensure splash dismisses within 2 seconds maximum (add timeout fallback)

---

## T-03-02 · Welcome Screen
**Type:** 🎨 Frontend
**Story Ref:** US-01-02
**Estimate:** 2 pts
**Depends on:** T-01-02, T-01-10

### Subtasks
- [ ] Build `app/(auth)/welcome.tsx`:
  - Full-screen dark background (`#0F172A`)
  - Neura avatar (🧠 placeholder, swap with Lottie animation in P2)
  - Arabic tagline: "رفيقك الذكي في رحلة التعلم"
  - CTA button "ابدأ رحلتك" → navigate to `/register`
  - Secondary link "عندي حساب بالفعل" → navigate to `/login`
- [ ] No scroll — single static screen
- [ ] Apply `useGuestGuard` (redirect to home if already logged in)

---

## T-03-03 · Onboarding Tour (Post-Registration)
**Type:** 🎨 Frontend
**Story Ref:** US-01-03
**Estimate:** 5 pts
**Depends on:** T-01-02, T-01-06, T-02-02

### Subtasks
- [ ] Create `app/onboarding.tsx` — full-screen swipeable carousel
- [ ] Build 4 onboarding cards:
  - Card 1: "وضع التركيز 🎯" — Pomodoro timer illustration + Arabic description
  - Card 2: "نيورونز ⚡" — Neurons currency illustration + how to earn
  - Card 3: "نيورا معاك 🧠" — AI companion illustration + Socratic tutor description
  - Card 4: "ابدأ رحلتك 🚀" — Final CTA card
- [ ] Each card: illustration area, title, subtitle, progress dots
- [ ] "تخطي" (Skip) button on every card → navigate to `/(tabs)/home`
- [ ] "التالي" button on cards 1–3, "يلا نبدأ!" on card 4
- [ ] After completion or skip:
  - Set `AsyncStorage.setItem('onboarding_complete', 'true')`
  - Navigate to `/(tabs)/home`
- [ ] In `app/index.tsx`: check `onboarding_complete` flag — if set, skip tour on future logins

---

## T-03-04 · Offline Launch Handling
**Type:** 🎨 Frontend + 🏗️ Setup
**Story Ref:** US-01-04
**Estimate:** 3 pts
**Depends on:** T-01-08, T-01-06

### Subtasks
- [ ] Install `@react-native-community/netinfo`
- [ ] Create `src/hooks/useNetworkStatus.ts`:
  - Subscribe to `NetInfo.addEventListener`
  - Update `uiStore.isOffline` on change
- [ ] Create `src/components/ui/OfflineBanner.tsx`:
  - Shown at top of screen when `isOffline === true`
  - Text: "أنت أوفلاين — بعض الميزات مش متاحة"
  - Non-blocking (does not prevent interaction)
  - Auto-hides when connection restored
- [ ] Add `OfflineBanner` to root `_layout.tsx` so it appears on all screens
- [ ] In AI Chat and PDF Upload screens: check `isOffline` before allowing action → show inline message if offline
- [ ] Verify app launches and loads local data (tasks, streak) with airplane mode on
