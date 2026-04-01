# T-02 — Authentication
**Sprint:** 1 | **Priority:** P1 | **Total Estimate:** 21 pts

---

## T-02-01 · Backend: Auth Router & Firebase Token Verification
**Type:** ⚙️ Backend
**Story Ref:** US-02-01, US-02-03
**Estimate:** 3 pts
**Depends on:** T-01-03, T-01-05

### Subtasks
- [ ] Create `app/services/auth_service.py`:
  - `verify_and_get_user(id_token)` → calls `firebase_admin.auth.verify_id_token()`
  - Returns decoded user dict or raises `HTTPException(401)`
- [ ] Create `POST /api/v1/auth/register` endpoint:
  - Accepts: `{ token, name, studentType }`
  - Verifies Firebase token
  - Creates user record in PostgreSQL (upsert by `firebase_uid`)
  - Returns: `{ user: { id, name, email, studentType, isPro, neurons, streak } }`
- [ ] Create `POST /api/v1/auth/login` endpoint:
  - Accepts: `{ token }`
  - Verifies token, fetches user from DB
  - Returns full user object
- [ ] Create `app/dependencies.py` — `get_current_user` dependency that validates Bearer token on every protected route
- [ ] Write unit tests for token verification (mock Firebase Admin)

---

## T-02-02 · Frontend: Register Screen
**Type:** 🎨 Frontend
**Story Ref:** US-02-01
**Estimate:** 3 pts
**Depends on:** T-01-02, T-01-06, T-01-07

### Subtasks
- [ ] Build `app/(auth)/register.tsx`:
  - RTL form: Name, Email, Password (with show/hide toggle), Student Type pill selector
  - Client-side validation: email format, password ≥ 8 chars, all fields required
  - Show inline Arabic error messages below each field
  - Student type pills: "ثانوي عام" / "جامعة" — required selection
- [ ] On submit:
  - Call `firebase.createUserWithEmailAndPassword()`
  - Get Firebase ID token
  - Call `POST /auth/register` with token + name + studentType
  - Store user in `authStore`
  - Navigate to Onboarding Tour (`/onboarding`)
- [ ] Loading state: disable button + show "جاري التسجيل..."
- [ ] Error handling: map Firebase error codes to Arabic messages:
  - `auth/email-already-in-use` → "الإيميل ده مستخدم قبل كده"
  - `auth/weak-password` → "كلمة السر ضعيفة، استخدم 8 حروف على الأقل"
  - Network error → "في مشكلة في الاتصال، حاول تاني"

---

## T-02-03 · Frontend: Login Screen
**Type:** 🎨 Frontend
**Story Ref:** US-02-03
**Estimate:** 2 pts
**Depends on:** T-01-02, T-01-06

### Subtasks
- [ ] Build `app/(auth)/login.tsx`:
  - RTL fields: Email, Password
  - "نسيت كلمة السر؟" link → calls `firebase.sendPasswordResetEmail()`
  - Show success toast: "اتبعت رسالة على إيميلك"
- [ ] On submit:
  - Call `firebase.signInWithEmailAndPassword()`
  - Get ID token → call `POST /auth/login`
  - Store user in `authStore`
  - Navigate to `/(tabs)/home`
- [ ] Error: "الإيميل أو كلمة السر غلط" for any auth failure (no specifics)

---

## T-02-04 · Frontend: Google Sign-In
**Type:** 🎨 Frontend
**Story Ref:** US-02-02
**Estimate:** 3 pts
**Depends on:** T-01-05, T-02-02

### Subtasks
- [ ] Install `expo-auth-session` + `expo-web-browser`
- [ ] Add "سجل بـ Google" button to both register and login screens
- [ ] Implement Google OAuth flow via `expo-auth-session`
- [ ] On first Google login → check if `studentType` is set; if not → show a bottom sheet to select student type before proceeding
- [ ] On success → same flow as email registration (call `/auth/register`)

---

## T-02-05 · Session Persistence & Auto-Login
**Type:** 🔒 Security
**Story Ref:** US-02-04
**Estimate:** 3 pts
**Depends on:** T-01-05, T-01-06

### Subtasks
- [ ] On successful login/register → store Firebase ID token in `expo-secure-store` with key `auth_token`
- [ ] In `app/index.tsx` (root redirect):
  - Read token from SecureStore
  - If token exists → call Firebase `onAuthStateChanged` to verify session
  - If valid → restore user to `authStore` → redirect to `/(tabs)/home`
  - If expired → clear token → redirect to `/(auth)/welcome`
- [ ] Firebase token auto-refresh: call `user.getIdToken(true)` before each API request if token is > 55 min old
- [ ] On 401 response from backend → clear SecureStore → dispatch logout → redirect to login with message "انتهت جلستك، ادخل تاني"

---

## T-02-06 · Logout Flow
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-02-05
**Estimate:** 2 pts
**Depends on:** T-02-05

### Subtasks
- [ ] Add logout button in `app/(tabs)/profile.tsx`
- [ ] Show `ConfirmDialog`: "عايز تخرج فعلاً؟" with Confirm / Cancel
- [ ] On confirm:
  - Call `firebase.signOut()`
  - Clear `auth_token` from SecureStore
  - Reset `authStore` and `studyStore`
  - Clear WatermelonDB local data
  - Navigate to `/(auth)/welcome`

---

## T-02-07 · Account Deletion
**Type:** 🎨 Frontend + ⚙️ Backend
**Story Ref:** US-02-06
**Estimate:** 3 pts
**Depends on:** T-02-05, T-01-04

### Subtasks
- [ ] Add "احذف حسابي" option in Settings → Privacy
- [ ] Show warning dialog in Arabic explaining permanent deletion
- [ ] Require password re-entry (re-authenticate with Firebase before deletion)
- [ ] Backend: `DELETE /api/v1/auth/account` endpoint:
  - Verify token
  - Anonymize user record: replace name/email with hashed token, set `deleted_at`
  - Do NOT hard-delete (COPPA compliance — keep anonymized record)
  - Delete Firebase Auth account via Admin SDK
- [ ] Frontend: on success → clear all local data → navigate to Welcome screen

---

## T-02-08 · Auth Guards (Route Protection)
**Type:** 🔒 Security
**Story Ref:** US-02-04
**Estimate:** 2 pts
**Depends on:** T-02-05

### Subtasks
- [ ] Create `src/hooks/useAuthGuard.ts`:
  - Checks `authStore.isAuthenticated`
  - If false → redirect to `/(auth)/welcome`
- [ ] Apply guard to all `(tabs)` screens via `app/(tabs)/_layout.tsx`
- [ ] Create `src/hooks/useGuestGuard.ts`:
  - If authenticated → redirect to `/(tabs)/home` (prevent accessing login/register when already logged in)
- [ ] Apply guest guard to `(auth)` screens
