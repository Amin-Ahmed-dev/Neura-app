# T-15 — Parental Controls & Reports
**Sprint:** 6 | **Priority:** P2/P3 | **Total Estimate:** 16 pts

---

## T-15-01 · Backend: Parent Link System
**Type:** ⚙️ Backend
**Story Ref:** US-12-01
**Estimate:** 3 pts
**Depends on:** T-01-04, T-02-01

### Subtasks
- [ ] `POST /api/v1/parent/link`:
  - Accepts: `{ contact: string }` (WhatsApp number or email)
  - Creates `parent_links` record with `verified = false`
  - Sends verification message via Twilio (WhatsApp) or SendGrid (email):
    - "ابنك/بنتك [Name] بيربطك بتطبيق نيورا. وافق على الربط: [link]"
  - Returns: `{ link_id, status: 'pending' }`
- [ ] `GET /api/v1/parent/verify/{token}` → marks link as verified
- [ ] `DELETE /api/v1/parent/link` → unlink parent
- [ ] `GET /api/v1/parent/status` → returns current link status
- [ ] Enforce: only one parent link per student

---

## T-15-02 · Frontend: Parent Link UI
**Type:** 🎨 Frontend
**Story Ref:** US-12-01
**Estimate:** 2 pts
**Depends on:** T-15-01, T-13-01

### Subtasks
- [ ] Create `app/settings/parent-link.tsx`:
  - If no link: form to enter WhatsApp number or email
  - "ابعت طلب الربط" button
  - Pending state: "في انتظار موافقة ولي الأمر ⏳"
  - Verified state: "ولي الأمر مرتبط ✅" + "إلغاء الربط" option
- [ ] Unlink confirmation: "عايز تفصل ولي الأمر؟"
- [ ] Accessible from Profile → "حساب الأهل"

---

## T-15-03 · Backend: Weekly Saver Report Generation
**Type:** ⚙️ Backend
**Story Ref:** US-12-02
**Estimate:** 5 pts
**Depends on:** T-15-01, T-10-01, T-05-01

### Subtasks
- [ ] Backend cron job (every Sunday at 09:00 Cairo time):
  - Query all students with verified parent links
  - For each student, calculate weekly stats:
    - `total_focused_hours`: sum of `study_sessions.duration_minutes` / 60 for the week
    - `streak_days`: current streak
    - `neurons_earned`: sum of `neurons_transactions.amount` for the week
    - `money_saved`: `total_focused_hours * 150` (EGP — average tutoring session cost)
  - Generate report message in Arabic:
    ```
    تقرير نيورا الأسبوعي لـ [Student Name] 📊
    
    ⏱️ ساعات التركيز: X ساعة
    🔥 السلسلة: X يوم
    ⚡ النيورونز المكتسبة: X
    💰 المال اللي وفرته: ~X جنيه (مقارنة بالدروس الخصوصية)
    
    نيورا بيساعد [Name] يذاكر بشكل منتظم ومستقل 💪
    ```
  - Send via Twilio WhatsApp API or SendGrid email
- [ ] Report MUST NOT contain: chat history, individual scores, mistakes, flashcard content
- [ ] Parent can opt out: `parent_links.receive_reports = false`

---

## T-15-04 · Privacy Enforcement — Chat Protection
**Type:** ⚙️ Backend + 🔒 Security
**Story Ref:** US-12-03
**Estimate:** 3 pts
**Depends on:** T-07-02, T-15-01

### Subtasks
- [ ] Audit all API endpoints: ensure no endpoint returns `chat_messages` data to anyone other than the student themselves
- [ ] Add middleware check: if request is from a parent-linked account → block access to `/ai/chat/history`
- [ ] Add integration test: verify parent token cannot access student's chat history
- [ ] Privacy policy page (in-app): explicitly state in Arabic that chat is private
- [ ] Backend: `chat_messages` table has no foreign key to `parent_links` — structural enforcement

---

## T-15-05 · Family Plan — Backend Foundation
**Type:** ⚙️ Backend
**Story Ref:** US-12-04
**Estimate:** 3 pts
**Depends on:** T-16-01

### Subtasks
- [ ] Create `family_plans` table:
  ```
  id, parent_user_id, plan_type ('family'), max_students (4),
  subscription_id, status, created_at
  ```
- [ ] Create `family_plan_members` table:
  ```
  id, plan_id (FK), student_id (FK), joined_at
  ```
- [ ] `POST /api/v1/subscriptions/family` → create family plan
- [ ] `POST /api/v1/subscriptions/family/add-member` → add student to plan
- [ ] `DELETE /api/v1/subscriptions/family/remove-member/{student_id}` → remove student
- [ ] When student is on family plan → `users.is_pro = true`
- [ ] Frontend: basic family plan management screen (P3 — placeholder for now)
