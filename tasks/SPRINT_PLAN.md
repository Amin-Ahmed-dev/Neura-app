# Neura — Sprint Plan & Velocity Tracker

## Team Assumptions
- 2 frontend devs + 1 backend dev + 1 full-stack
- Sprint velocity: ~40 story points per sprint
- Sprint duration: 2 weeks

---

## Sprint 0 — Foundation (Week 1)
**Goal:** Everything is set up. A dev can clone the repo and run the app.
**Capacity:** 21 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-01-01 | Initialize Expo Project | 🏗️ | 2 | FE |
| T-01-02 | Configure NativeWind | 🎨 | 2 | FE |
| T-01-03 | Initialize FastAPI Backend | 🏗️ | 3 | BE |
| T-01-04 | Database Schema & Migrations | 🗄️ | 5 | BE |
| T-01-05 | Firebase Project Setup | 🔒 | 2 | FS |
| T-01-06 | Zustand State Management | 🏗️ | 2 | FE |
| T-01-07 | Axios API Client | 🏗️ | 2 | FE |
| T-01-08 | WatermelonDB Setup | 🗄️ | 3 | FE |
| T-01-09 | CI/CD Pipeline | 📦 | 3 | FS |
| T-01-10 | Design System Components | 🎨 | 3 | FE |

**Sprint 0 Total: 27 pts**

---

## Sprint 1 — Auth & Onboarding (Weeks 2–3)
**Goal:** User can register, log in, see onboarding, and use the app offline.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-02-01 | Backend Auth Router | ⚙️ | 3 | BE |
| T-02-02 | Register Screen | 🎨 | 3 | FE |
| T-02-03 | Login Screen | 🎨 | 2 | FE |
| T-02-04 | Google Sign-In | 🎨 | 3 | FS |
| T-02-05 | Session Persistence | 🔒 | 3 | FS |
| T-02-06 | Logout Flow | 🎨 | 2 | FE |
| T-02-07 | Account Deletion | 🎨⚙️ | 3 | FS |
| T-02-08 | Auth Guards | 🔒 | 2 | FE |
| T-03-01 | Splash Screen | 🎨 | 2 | FE |
| T-03-02 | Welcome Screen | 🎨 | 2 | FE |
| T-03-03 | Onboarding Tour | 🎨 | 5 | FE |
| T-03-04 | Offline Launch Handling | 🎨🏗️ | 3 | FE |

**Sprint 1 Total: 33 pts**

---

## Sprint 2 — Core Study Loop (Weeks 4–5)
**Goal:** User can add tasks, start a Pomodoro, earn Neurons, and see their dashboard.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-04-01 | Backend Stats API | ⚙️ | 2 | BE |
| T-04-02 | Dashboard Stats Row | 🎨 | 2 | FE |
| T-04-03 | Start Next Task CTA | 🎨 | 2 | FE |
| T-04-04 | Today's Task Preview | 🎨 | 3 | FE |
| T-05-01 | Backend: Log Session | ⚙️ | 2 | BE |
| T-05-02 | Pomodoro Timer Hook | 🎨 | 3 | FE |
| T-05-03 | Pomodoro Timer UI | 🎨 | 3 | FE |
| T-05-04 | Background Timer + Notification | 🎨 | 5 | FE |
| T-05-05 | Session Completion Flow | 🎨 | 3 | FE |
| T-05-06 | Session Abandonment | 🎨 | 2 | FE |
| T-06-01 | Backend Tasks CRUD | ⚙️ | 3 | BE |
| T-06-02 | Task List Screen | 🎨 | 3 | FE |
| T-06-03 | Add Task Bottom Sheet | 🎨 | 3 | FE |
| T-06-04 | Complete Task Flow | 🎨 | 2 | FE |
| T-06-05 | Midnight Rollover | 🎨⚙️ | 3 | FS |

**Sprint 2 Total: 41 pts**

---

## Sprint 3 — AI Brain (Weeks 6–7)
**Goal:** User can chat with Neura and upload PDFs for processing.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-07-01 | AI Chat Endpoint + Socratic Guardrail | ⚙️🧠 | 5 | BE |
| T-07-02 | Chat History Storage | ⚙️🗄️ | 3 | BE |
| T-07-03 | Chat Interface UI | 🎨 | 5 | FE |
| T-07-04 | Subject Context Tagging | 🎨 | 2 | FE |
| T-07-05 | Voice Input (Feynman) | 🎨🧠 | 5 | FS |
| T-07-07 | Chat History Clear & Privacy | 🎨 | 3 | FE |
| T-08-01 | Backend File Upload & Storage | ⚙️ | 3 | BE |
| T-08-02 | AI Caching for Textbooks | ⚙️🧠 | 3 | BE |
| T-08-03 | Smart Chunking Pipeline | ⚙️🧠 | 5 | BE |
| T-08-05 | Materials Screen | 🎨 | 3 | FE |
| T-08-06 | Upload Flow | 🎨 | 5 | FE |

**Sprint 3 Total: 42 pts**

---

## Sprint 4 — Flashcards, Gamification & Notifications (Weeks 8–9)
**Goal:** Spaced repetition works, Neurons are earned, push notifications fire.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-09-01 | Flashcard Generation | ⚙️🧠 | 3 | BE |
| T-09-02 | SM-2 Spaced Repetition | ⚙️ | 3 | BE |
| T-09-03 | Flashcard Review Screen | 🎨 | 5 | FE |
| T-09-04 | Deck Management | 🎨 | 3 | FE |
| T-10-01 | Neurons Transaction Engine | ⚙️ | 3 | BE |
| T-10-02 | Streak Engine | ⚙️ | 3 | BE |
| T-10-04 | Neurons Balance & History UI | 🎨 | 3 | FE |
| T-11-01 | Expo Notifications + FCM Setup | 🏗️ | 3 | FS |
| T-11-02 | Daily Study Reminder | ⚙️🎨 | 3 | FS |
| T-11-03 | Streak at Risk Alert | ⚙️ | 2 | BE |
| T-11-04 | Flashcard Review Reminder | ⚙️ | 2 | BE |
| T-11-05 | Material Processing Notification | ⚙️ | 2 | BE |
| T-11-06 | Streak Milestone Notifications | ⚙️ | 2 | BE |
| T-08-07 | Material Detail & Chunks View | 🎨 | 3 | FE |

**Sprint 4 Total: 40 pts**

---

## Sprint 5 — Offline, App State & Profile (Weeks 10–11)
**Goal:** App works offline, recovers from crashes, profile is complete.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-12-01 | Network Status Detection | 🎨 | 2 | FE |
| T-12-02 | Offline-First Data Layer | 🏗️ | 3 | FE |
| T-12-03 | Sync Queue Processing | 🎨 | 5 | FE |
| T-12-04 | Offline Flashcard Review | 🎨 | 3 | FE |
| T-12-05 | Performance Targets Verification | 🧪 | 3 | FS |
| T-13-01 | Profile Screen | 🎨 | 3 | FE |
| T-13-02 | Edit Profile | 🎨⚙️ | 2 | FS |
| T-13-03 | Privacy Settings Screen | 🎨⚙️ | 3 | FS |
| T-13-04 | App Settings | 🎨 | 2 | FE |
| T-13-05 | Backend User Profile API | ⚙️ | 2 | BE |
| T-13-06 | Re-engagement Screen | 🎨 | 2 | FE |
| T-18-01 | Last Active Screen Persistence | 🎨 | 3 | FE |
| T-18-02 | Android Back Button Guard | 🎨 | 2 | FE |
| T-18-03 | Session Crash Recovery | 🎨 | 5 | FE |
| T-18-04 | App Foreground/Background State | 🎨 | 3 | FE |
| T-18-05 | Deep Link Handling | 🎨 | 3 | FE |

**Sprint 5 Total: 46 pts** *(split across 2 devs)*

---

## Sprint 6 — Health, Sleep & Parental (Weeks 12–13)
**Goal:** Sleep tracking works, parents receive weekly reports.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-04-05 | Neura Avatar Mood | 🎨 | 3 | FE |
| T-04-06 | Fluency Meter | 🎨 | 3 | FE |
| T-04-07 | Grayscale Bedtime Nudge | 🎨 | 3 | FE |
| T-05-07 | Break Suggestions + Prayer Times | 🎨 | 3 | FE |
| T-05-08 | Adaptive Timer | 🎨 | 2 | FE |
| T-06-06 | Weekly Planner View | 🎨 | 3 | FE |
| T-11-07 | Leaderboard Notification | ⚙️ | 2 | BE |
| T-11-08 | Notification Preferences UI | 🎨 | 2 | FE |
| T-14-01 | Bedtime Settings | 🎨 | 1 | FE |
| T-14-02 | Face-Down Sleep Tracking | 🎨 | 5 | FE |
| T-14-03 | Smart Alarm + Barcode Dismiss | 🎨 | 5 | FE |
| T-15-01 | Backend Parent Link | ⚙️ | 3 | BE |
| T-15-02 | Parent Link UI | 🎨 | 2 | FE |
| T-15-03 | Weekly Saver Report | ⚙️ | 5 | BE |
| T-15-04 | Chat Privacy Enforcement | ⚙️🔒 | 3 | BE |

**Sprint 6 Total: 45 pts** *(split across team)*

---

## Sprint 7 — Monetization (Weeks 14–15)
**Goal:** Users can upgrade to Pro and pay via Egyptian payment methods.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-10-03 | Weekly Leaderboard | ⚙️ | 5 | BE |
| T-10-05 | Leaderboard Screen | 🎨 | 3 | FE |
| T-10-06 | Rewards Store | 🎨⚙️ | 5 | FS |
| T-16-01 | Plan Enforcement Middleware | ⚙️🔒 | 3 | BE |
| T-16-02 | Free Plan Limit Handling | 🎨 | 3 | FE |
| T-16-03 | Pro Upgrade Screen | 🎨 | 3 | FE |
| T-16-04 | Paymob Payment Integration | ⚙️ | 5 | BE |
| T-16-05 | Payment Flow Frontend | 🎨 | 3 | FE |
| T-16-06 | Subscription Management | 🎨 | 2 | FE |
| T-16-07 | Pro Badge & Visual Indicators | 🎨 | 2 | FE |
| T-06-07 | Everest Method (AI Goal Breakdown) | 🎨🧠 | 5 | FS |

**Sprint 7 Total: 39 pts**

---

## Sprint 8 — P2 Polish + P3 Features (Weeks 16–17)
**Goal:** Voice TTS, concept maps, creators, B2B, final polish.
**Capacity:** 40 pts

| Task ID | Title | Type | Pts | Owner |
|---------|-------|------|-----|-------|
| T-07-06 | Neura Voice Notes (TTS) | 🎨🧠 | 5 | FS |
| T-08-04 | Math Subject Detection | ⚙️🧠 | 2 | BE |
| T-08-08 | OCR for Handwritten Notes | ⚙️🧠 | 5 | BE |
| T-09-05 | Feynman Voice Recall on Flashcard | 🎨🧠 | 5 | FS |
| T-09-06 | Concept Map View (Pro) | 🎨🧠 | 5 | FS |
| T-14-04 | Sleep History & Insights (Pro) | 🎨⚙️ | 5 | FS |
| T-15-05 | Family Plan Backend | ⚙️ | 3 | BE |
| T-17-01 | Creator Account Registration | ⚙️🎨 | 5 | FS |
| T-05-09 | Focus Guard (App Blocker) | 🎨 | 3 | FE |

**Sprint 8 Total: 38 pts**

---

## Total Project Summary

| Metric | Value |
|--------|-------|
| Total Story Points | ~350 pts |
| Total Sprints | 9 (including Sprint 0) |
| Estimated Duration | ~18 weeks (~4.5 months) |
| P1 (MVP) Points | ~180 pts |
| P2 Points | ~120 pts |
| P3 Points | ~50 pts |

## MVP Definition (P1 Only — ~10 weeks)
Sprints 0–5 deliver a fully functional MVP:
- ✅ Auth (email + Google)
- ✅ Pomodoro timer (offline, background)
- ✅ Task management (offline, rollover)
- ✅ AI chat with Socratic guardrail
- ✅ PDF upload + smart chunking
- ✅ Flashcard generation + spaced repetition
- ✅ Neurons + streak system
- ✅ Push notifications
- ✅ Offline sync
- ✅ Profile + settings
- ✅ App state recovery
