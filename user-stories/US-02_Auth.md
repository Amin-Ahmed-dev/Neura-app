# US-02 — Authentication (Register / Login / Logout)

---

## US-02-01 · Register with Email
**As a** new Student,
**I want to** create an account using my email and password,
**so that** my study data is saved and synced across devices.

### Acceptance Criteria
- [ ] Form fields (RTL layout): Name, Email, Password, Student Type (ثانوي عام / جامعة)
- [ ] Password minimum 8 characters; show/hide toggle
- [ ] Email format validated before submission
- [ ] Student type selection is required (pill selector, not a dropdown)
- [ ] On success → Firebase Auth creates account → backend creates user record → navigate to Onboarding Tour
- [ ] On failure → show Arabic error message (e.g., "الإيميل ده مستخدم قبل كده")
- [ ] Loading state shown on submit button ("جاري التسجيل...")

**Priority:** P1

---

## US-02-02 · Register with Google
**As a** new Student,
**I want to** sign up using my Google account,
**so that** I don't have to remember another password.

### Acceptance Criteria
- [ ] "سجل بـ Google" button on register screen
- [ ] Uses Firebase Google Auth provider
- [ ] On first Google login → prompt for Student Type before proceeding
- [ ] On success → same flow as email registration

**Priority:** P2

---

## US-02-03 · Login with Email
**As a** returning Student,
**I want to** log in with my email and password,
**so that** I can access my saved progress and data.

### Acceptance Criteria
- [ ] Fields: Email, Password (RTL)
- [ ] "نسيت كلمة السر؟" link → triggers Firebase password reset email
- [ ] On success → navigate to Home tab
- [ ] On wrong credentials → "الإيميل أو كلمة السر غلط" (no specifics for security)
- [ ] Session persisted via Firebase Auth + SecureStore token; user stays logged in on next launch

**Priority:** P1

---

## US-02-04 · Stay Logged In
**As a** Student,
**I want to** remain logged in when I close and reopen the app,
**so that** I don't have to log in every time.

### Acceptance Criteria
- [ ] Firebase Auth token refreshed automatically in background
- [ ] Token stored securely in `expo-secure-store`
- [ ] Session valid for 30 days of inactivity before requiring re-login
- [ ] On token expiry → redirect to Login screen with message "انتهت جلستك، ادخل تاني"

**Priority:** P1

---

## US-02-05 · Logout
**As a** Student,
**I want to** log out of my account,
**so that** my data is protected if I share my device.

### Acceptance Criteria
- [ ] Logout option in Profile tab
- [ ] Confirmation dialog: "عايز تخرج فعلاً؟" with Confirm / Cancel
- [ ] On confirm → Firebase signOut → clear local token → navigate to Welcome screen
- [ ] Local on-device data (timer state, tasks) cleared on logout

**Priority:** P1

---

## US-02-06 · Account Deletion
**As a** Student,
**I want to** permanently delete my account,
**so that** my personal data is removed from Neura's servers.

### Acceptance Criteria
- [ ] Option available in Settings → Privacy
- [ ] Requires password re-confirmation before deletion
- [ ] Warning shown in Arabic explaining data is permanently deleted
- [ ] On confirm → delete Firebase Auth account + anonymize DB records (COPPA compliance)
- [ ] Navigate to Welcome screen after deletion

**Priority:** P2
