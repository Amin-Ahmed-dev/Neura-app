# US-11 — Profile & Settings

---

## US-11-01 · View Profile
**As a** Student,
**I want to** see my profile with my stats and avatar,
**so that** I have a sense of identity and progress within the app.

### Acceptance Criteria
- [ ] Profile shows: Name, Student type, Neura avatar, Neurons balance, current streak, total deep work hours
- [ ] Avatar reflects current mood state
- [ ] Tapping avatar opens avatar customization (future feature placeholder)

**Priority:** P1

---

## US-11-02 · Edit Profile
**As a** Student,
**I want to** update my name and student type,
**so that** my profile stays accurate.

### Acceptance Criteria
- [ ] Editable fields: Display name, Student type, School/University name (optional)
- [ ] Changes saved to server on confirm
- [ ] Email is not editable (Firebase Auth managed)

**Priority:** P2

---

## US-11-03 · Notification Preferences
**As a** Student,
**I want to** control which notifications I receive,
**so that** I'm not overwhelmed by alerts.

### Acceptance Criteria
- [ ] Toggle options: Study reminders, Streak alerts, Leaderboard updates, Neura tips, Parental report sent
- [ ] Quiet hours setting: no notifications between X and Y time
- [ ] Changes take effect immediately

**Priority:** P2

---

## US-11-04 · Privacy Settings
**As a** Student,
**I want to** control my privacy settings,
**so that** I feel safe using the app.

### Acceptance Criteria
- [ ] Toggle: Show my name on leaderboard (default: off — shows anonymized ID)
- [ ] Toggle: Allow Neura to use my study data to improve AI (default: off)
- [ ] Link to Privacy Policy in Arabic
- [ ] "احذف حسابي" option (leads to US-02-06)
- [ ] Clear explanation that chat with Neura is never shared with parents

**Priority:** P1

---

## US-11-05 · App Language & Theme
**As a** Student,
**I want to** confirm the app is in Arabic with dark mode,
**so that** it's comfortable for my night study sessions.

### Acceptance Criteria
- [ ] App language: Arabic (default, only option in v1)
- [ ] Theme: Dark mode (default, only option in v1)
- [ ] RTL layout enforced throughout the app

**Priority:** P1
