# T-17 — Tutor Creators & B2B Features
**Sprint:** 8 | **Priority:** P3 | **Total Estimate:** 21 pts

---

## T-17-01 · Tutor Creator Account Registration
**Type:** ⚙️ Backend + 🎨 Frontend
**Story Ref:** US-14-01
**Estimate:** 5 pts
**Depends on:** T-02-01, T-01-04

### Subtasks
- [ ] Backend:
  - Add `account_type` field to `users` table: `student | creator | admin`
  - Create `creator_profiles` table:
    ```
    id, user_id (FK), display_name, bio, subjects (array),
    national_id_hash (anonymized), credentials_url (S3),
    verification_status (pending/verified/rejected), created_at
    ```
  - `POST /api/v1/creators/apply` → submit creator application
  - `POST /api/v1/admin/creators/{id}/verify` → admin verifies creator
  - On verification → set `account_type = 'creator'` + send notification
- [ ] Frontend:
  - "سجل كـ Creator" option on registration screen (separate flow)
  - Creator application form: display name, bio, subjects, upload credentials photo
  - "في انتظار المراجعة" pending state screen
  - Verified badge (✓) shown on creator profile

---

## T-17-02 · Creator Content Upload
**Type:** ⚙️ Backend + 🎨 Frontend
**Story Ref:** US-14-02
**Estimate:** 5 pts
**Depends on:** T-17-01, T-08-01

### Subtasks
- [ ] Backend:
  - `creator_content` table: `id, creator_id, type (flashcard_deck/quiz/pdf), title, subject, visibility (public/private), status (pending_review/approved/rejected), created_at`
  - `POST /api/v1/creators/content` → upload content
  - Admin review queue: `GET /api/v1/admin/content/pending`
  - `POST /api/v1/admin/content/{id}/approve`
- [ ] Frontend: Creator dashboard (`app/creator/dashboard.tsx`):
  - Upload flashcard deck (CSV or manual entry)
  - Upload quiz (multiple choice questions)
  - Upload PDF summary
  - Set visibility: Public / Private (invite-only)
  - Content status list: pending / approved / rejected

---

## T-17-03 · Affiliate Code System
**Type:** ⚙️ Backend + 🎨 Frontend
**Story Ref:** US-14-03
**Estimate:** 5 pts
**Depends on:** T-17-01

### Subtasks
- [ ] Backend:
  - `affiliate_codes` table: `id, creator_id, code (unique 8-char), uses_count, created_at`
  - `POST /api/v1/creators/affiliate-code` → generate unique code
  - `POST /api/v1/students/redeem-code` → student redeems code:
    - Links student to creator's private content
    - Increments `uses_count`
  - `GET /api/v1/creators/affiliate-stats` → code usage stats
- [ ] Frontend:
  - Creator dashboard: "كود الطلاب" section → show code + copy button + usage count
  - Student settings: "كود المدرس" field → enter code → gain access to creator's content
  - Success: "اتضافت مواد [Creator Name] لحسابك ✅"

---

## T-17-04 · Sponsored Events Discovery
**Type:** ⚙️ Backend + 🎨 Frontend
**Story Ref:** US-14-04
**Estimate:** 5 pts
**Depends on:** T-04-02

### Subtasks
- [ ] Backend:
  - `sponsored_events` table: `id, sponsor_name, title, description, event_date, location, registration_url, target_subjects (array), target_cities (array), logo_url, active`
  - `GET /api/v1/events?subject=math&city=cairo` → returns targeted events
  - Admin: `POST /api/v1/admin/events` → create sponsored event
- [ ] Frontend:
  - Events card on home dashboard (shown max once per session)
  - Card: sponsor logo, event title, date, "سجل دلوقتي" button → opens registration URL in browser
  - "برعاية [Sponsor]" label clearly visible
  - Dismiss button (X) → stores dismissed event ID in AsyncStorage → never shown again
  - Targeting: filter by student's subjects and city (from profile)
