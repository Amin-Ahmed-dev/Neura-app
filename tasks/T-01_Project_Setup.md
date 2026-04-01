# T-01 — Project Infrastructure & Setup
**Sprint:** 0 | **Priority:** P1 | **Total Estimate:** 21 pts

---

## T-01-01 · Initialize React Native (Expo) Project
**Type:** 🏗️ Setup
**Story Ref:** US-01, US-02
**Estimate:** 2 pts
**Depends on:** —

### Subtasks
- [ ] Run `npx create-expo-app neura-app --template expo-template-blank-typescript`
- [ ] Configure `expo-router` for file-based navigation
- [ ] Set up `tsconfig.json` with path aliases (`@/*` → `src/*`)
- [ ] Configure `babel.config.js` with NativeWind plugin
- [ ] Add `.env.example` with all required env vars
- [ ] Add `.gitignore` (node_modules, .env, build artifacts)
- [ ] Verify app boots on Android emulator and iOS simulator

---

## T-01-02 · Configure NativeWind (Tailwind CSS)
**Type:** 🎨 Frontend
**Story Ref:** US-04 (UI Design System)
**Estimate:** 2 pts
**Depends on:** T-01-01

### Subtasks
- [ ] Install `nativewind` + `tailwindcss`
- [ ] Create `tailwind.config.js` with Neura color tokens:
  - `background: #0F172A`
  - `surface: #1E293B`
  - `primary: #10B981`
  - `accent: #F97316`
  - `neurons: #FBBF24`
- [ ] Create `global.css` with Tailwind directives
- [ ] Add `@/` path alias for `src/` in tsconfig
- [ ] Verify custom colors render correctly on a test screen

---

## T-01-03 · Initialize FastAPI Backend Project
**Type:** 🏗️ Setup
**Story Ref:** All backend stories
**Estimate:** 3 pts
**Depends on:** —

### Subtasks
- [ ] Create `neura-backend/` directory with `main.py`
- [ ] Set up `requirements.txt` (FastAPI, uvicorn, SQLAlchemy, asyncpg, pydantic-settings, firebase-admin, openai, alembic, redis)
- [ ] Configure `app/config.py` using `pydantic-settings` (reads from `.env`)
- [ ] Set up CORS middleware (allow all origins in dev)
- [ ] Create router structure: `auth`, `ai`, `materials`, `study`, `gamification`, `notifications`
- [ ] Add `GET /health` endpoint
- [ ] Verify server starts with `uvicorn main:app --reload`

---

## T-01-04 · Database Schema Design & Migrations
**Type:** 🗄️ Database
**Story Ref:** US-02, US-08, US-09
**Estimate:** 5 pts
**Depends on:** T-01-03

### Subtasks
- [ ] Initialize Alembic: `alembic init alembic`
- [ ] Design and create the following PostgreSQL tables:

  **users**
  ```
  id (UUID PK), firebase_uid (unique), email, name, student_type,
  is_pro (bool), neurons_balance (int), streak_count (int),
  last_active_date (date), created_at, updated_at
  ```

  **study_sessions**
  ```
  id, user_id (FK), duration_minutes, subject, neurons_earned,
  phase (work/break), completed (bool), created_at
  ```

  **tasks**
  ```
  id, user_id (FK), title, subject, estimated_minutes,
  due_date, completed (bool), rolled_over (bool), created_at, updated_at
  ```

  **materials**
  ```
  id, user_id (FK), title, file_hash (SHA-256), file_url,
  page_count, subject, processing_status (enum), created_at
  ```

  **chunks**
  ```
  id, material_id (FK), title, content, order_index, created_at
  ```

  **flashcards**
  ```
  id, user_id (FK), deck_id (FK), question, answer,
  ease_factor (float), interval_days (int), next_review_date (date),
  repetitions (int), created_at
  ```

  **decks**
  ```
  id, user_id (FK), material_id (FK nullable), title, subject, created_at
  ```

  **neurons_transactions**
  ```
  id, user_id (FK), amount, action_type (enum), created_at
  ```

  **parent_links**
  ```
  id, student_id (FK), parent_contact (phone/email), verified (bool), created_at
  ```

- [ ] Write Alembic migration for all tables
- [ ] Run migration: `alembic upgrade head`
- [ ] Seed dev database with 1 test user

---

## T-01-05 · Firebase Project Setup
**Type:** 🔒 Security
**Story Ref:** US-02
**Estimate:** 2 pts
**Depends on:** —

### Subtasks
- [ ] Create Firebase project "neura-app" in Firebase Console
- [ ] Enable Authentication providers: Email/Password, Google
- [ ] Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- [ ] Place files in correct Expo locations
- [ ] Download Firebase Admin SDK service account JSON → `neura-backend/firebase-credentials.json`
- [ ] Add `firebase-credentials.json` to `.gitignore`
- [ ] Test Firebase Admin `verify_id_token()` with a test token

---

## T-01-06 · State Management Setup (Zustand)
**Type:** 🏗️ Setup
**Story Ref:** US-02, US-03, US-09
**Estimate:** 2 pts
**Depends on:** T-01-01

### Subtasks
- [ ] Install `zustand`
- [ ] Create `src/store/authStore.ts` — user, isAuthenticated, login, register, logout
- [ ] Create `src/store/studyStore.ts` — neurons, streak, todayMinutes, totalMinutes
- [ ] Create `src/store/uiStore.ts` — isOffline, isGrayscale, activeSession
- [ ] Add Zustand `persist` middleware with AsyncStorage for `studyStore`
- [ ] Verify store persists across app restarts

---

## T-01-07 · API Client Setup (Axios)
**Type:** 🏗️ Setup
**Story Ref:** All API stories
**Estimate:** 2 pts
**Depends on:** T-01-01, T-01-03

### Subtasks
- [ ] Install `axios`
- [ ] Create `src/services/apiClient.ts` with base URL from `EXPO_PUBLIC_API_URL`
- [ ] Add request interceptor: attach `Authorization: Bearer <token>` from SecureStore
- [ ] Add response interceptor: handle 401 → trigger logout flow
- [ ] Add timeout: 15 seconds
- [ ] Test with `/health` endpoint

---

## T-01-08 · WatermelonDB Setup (Offline Storage)
**Type:** 🗄️ Database
**Story Ref:** US-01-04, US-15
**Estimate:** 3 pts
**Depends on:** T-01-01

### Subtasks
- [ ] Install `@nozbe/watermelondb`
- [ ] Configure native build for Android and iOS
- [ ] Define WatermelonDB schema:
  - `tasks` table (id, title, subject, estimated_minutes, due_date, completed, rolled_over, synced)
  - `study_sessions` table (id, duration, subject, neurons_earned, completed, synced)
  - `flashcards` table (id, deck_id, question, answer, ease_factor, interval_days, next_review_date, synced)
  - `sync_queue` table (id, entity_type, entity_id, action, payload, created_at)
- [ ] Create `src/db/database.ts` singleton
- [ ] Verify DB initializes on app start

---

## T-01-09 · CI/CD Pipeline Setup
**Type:** 📦 DevOps
**Story Ref:** —
**Estimate:** 3 pts
**Depends on:** T-01-01, T-01-03

### Subtasks
- [ ] Create `.github/workflows/backend.yml`:
  - Trigger: push to `main` and PRs
  - Steps: install deps, run linter (ruff), run tests (pytest)
- [ ] Create `.github/workflows/mobile.yml`:
  - Trigger: push to `main`
  - Steps: install deps, run TypeScript check, run ESLint
- [ ] Add `EAS Build` config (`eas.json`) for Expo builds
- [ ] Configure environment secrets in GitHub Actions
- [ ] Add `pre-commit` hooks: ESLint + Prettier for frontend, ruff for backend

---

## T-01-10 · Design System — Shared Components
**Type:** 🎨 Frontend
**Story Ref:** All UI stories
**Estimate:** 3 pts
**Depends on:** T-01-02

### Subtasks
- [ ] Create `src/components/ui/Button.tsx` — variants: primary, secondary, ghost, danger
- [ ] Create `src/components/ui/Input.tsx` — RTL support, error state, show/hide password
- [ ] Create `src/components/ui/Card.tsx` — surface background, rounded corners
- [ ] Create `src/components/ui/Badge.tsx` — for Neurons, streak, Pro label
- [ ] Create `src/components/ui/OfflineBanner.tsx` — non-blocking top banner
- [ ] Create `src/components/ui/LoadingSpinner.tsx`
- [ ] Create `src/components/ui/ConfirmDialog.tsx` — reusable modal with Arabic copy
- [ ] Load Cairo font (Arabic) via `expo-font`
- [ ] Apply font globally in `_layout.tsx`
