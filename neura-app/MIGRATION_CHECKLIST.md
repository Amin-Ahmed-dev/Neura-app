# 🔄 Migration Checklist - 2026 Modernization

## ✅ Completed Automatically

- [x] Updated all dependencies to latest stable versions
- [x] Migrated ESLint to flat config (eslint.config.js)
- [x] Updated Babel configuration for React Native 0.76+
- [x] Enhanced TypeScript strict mode
- [x] Updated Prettier configuration
- [x] Created .eslintignore and .prettierignore
- [x] Added new npm scripts (validate, clean, etc.)
- [x] Removed deprecated .eslintrc.js

## 📋 Manual Steps Required

### Step 1: Install Dependencies
```bash
cd neura-app
npm install --legacy-peer-deps
```

**Expected**: Installation completes successfully
**If fails**: Try `npm cache clean --force` then retry

### Step 2: Verify TypeScript
```bash
npm run ts:check
```

**Expected**: Zero errors
**If errors**: Fix type issues incrementally (see Common Fixes below)

### Step 3: Verify ESLint
```bash
npm run lint
```

**Expected**: Zero warnings/errors
**If errors**: Run `npm run lint:fix` to auto-fix

### Step 4: Verify Prettier
```bash
npm run format:check
```

**Expected**: All files formatted correctly
**If errors**: Run `npm run format` to auto-fix

### Step 5: Start the App
```bash
npm start
```

**Expected**: Metro bundler starts without warnings
**If errors**: See Troubleshooting section

### Step 6: Test All Screens
- [ ] Welcome screen loads
- [ ] Login/Register works
- [ ] Onboarding flow works
- [ ] Home dashboard displays
- [ ] Chat interface works
- [ ] Focus/Pomodoro timer works
- [ ] Tasks screen works
- [ ] Materials screen works
- [ ] Profile screen works
- [ ] Settings screens work
- [ ] Flashcards work
- [ ] Leaderboard displays
- [ ] Rewards screen works

## 🔧 Common Fixes Needed

### Fix 1: Type Imports (ESLint Enforced)

**Old Code:**
```typescript
import { User, Task } from './types';
```

**New Code:**
```typescript
import type { User, Task } from './types';
// or if you need both types and values:
import { someFunction, type User, type Task } from './types';
```

**Auto-fix**: Run `npm run lint:fix`

### Fix 2: Explicit Any (Now Error)

**Old Code:**
```typescript
const data: any = await fetchData();
```

**New Code:**
```typescript
const data: unknown = await fetchData();
// Then use type guards
if (isValidData(data)) {
  // data is now properly typed
}
```

### Fix 3: Unused Variables (Now Error)

**Old Code:**
```typescript
const [data, setData] = useState();
// setData never used
```

**New Code:**
```typescript
const [data, _setData] = useState();
// or remove if truly unused
const [data] = useState();
```

### Fix 4: Unchecked Index Access

**Old Code:**
```typescript
const item = array[0]; // might be undefined
item.name; // error if undefined
```

**New Code:**
```typescript
const item = array[0];
if (item) {
  item.name; // safe
}
// or use optional chaining
array[0]?.name;
```

### Fix 5: Console Statements (Now Warning)

**Old Code:**
```typescript
console.log('Debug info');
```

**New Code:**
```typescript
// Use console.warn or console.error (allowed)
console.warn('Debug info');
// or remove in production (auto-removed by Babel)
```

## 🚨 Breaking Changes to Watch

### React Native 0.76 Changes

#### 1. New Architecture Default
- Turbo Modules enabled by default
- Fabric renderer enabled
- Better performance, but some libraries might need updates

**Action**: Test all third-party libraries

#### 2. Deprecated APIs Removed
- Some old APIs might be removed
- Check console for deprecation warnings

**Action**: Update any deprecated API usage

### Expo 52 Changes

#### 1. expo-router 4.0
- New navigation features
- Some API changes
- Better type safety

**Action**: Test all navigation flows

#### 2. Plugin System Updates
- Some plugins have new APIs
- Config format might change

**Action**: Check app.json and babel.config.js

### ESLint 9 Changes

#### 1. Flat Config Required
- Old .eslintrc.js no longer supported
- Must use eslint.config.js

**Action**: Already migrated ✅

#### 2. Stricter Rules
- More errors instead of warnings
- Better code quality enforcement

**Action**: Fix all ESLint errors

## 📊 Quality Metrics to Achieve

### TypeScript
- [ ] Zero `any` types (use `unknown` instead)
- [ ] Zero `@ts-ignore` comments
- [ ] Zero type errors
- [ ] All functions have return types (inferred or explicit)

### ESLint
- [ ] Zero warnings
- [ ] Zero errors
- [ ] All imports use `type` keyword where applicable
- [ ] No unused variables

### Prettier
- [ ] All files formatted consistently
- [ ] No formatting errors

### Performance
- [ ] App starts in < 3 seconds
- [ ] No memory leaks
- [ ] Smooth 60fps animations
- [ ] Fast navigation transitions

## 🧪 Testing Checklist

### Functional Testing
- [ ] Authentication flow works
- [ ] Data persistence works (WatermelonDB)
- [ ] Offline mode works
- [ ] Sync works when back online
- [ ] Push notifications work
- [ ] Deep linking works
- [ ] File uploads work
- [ ] Camera/gallery access works

### UI Testing
- [ ] All screens render correctly
- [ ] RTL layout works properly
- [ ] Fonts load correctly (Tajawal, Amiri, Cairo)
- [ ] Colors match design system
- [ ] Animations are smooth
- [ ] Touch targets are accessible

### Performance Testing
- [ ] No lag when scrolling lists
- [ ] Images load efficiently
- [ ] App doesn't crash under load
- [ ] Memory usage is reasonable
- [ ] Battery usage is acceptable

## 🔍 Code Review Checklist

### Before Committing
- [ ] Run `npm run validate` - all checks pass
- [ ] Test on Android device/emulator
- [ ] Test on iOS device/simulator (if available)
- [ ] Check Metro bundler for warnings
- [ ] Review all changed files
- [ ] Update documentation if needed

### Code Quality
- [ ] No hardcoded values (use design tokens)
- [ ] No magic numbers (use constants)
- [ ] Proper error handling
- [ ] Accessibility labels added
- [ ] Comments for complex logic
- [ ] No duplicate code

## 📝 Documentation Updates

### Files to Review
- [ ] README.md - Update if needed
- [ ] INSTALLATION_GUIDE.md - Follow instructions
- [ ] MODERNIZATION_2026.md - Read for context
- [ ] This file - Check off completed items

## 🎯 Success Criteria

You're done when:
- ✅ All dependencies installed successfully
- ✅ `npm run validate` passes with zero issues
- ✅ `npm start` runs without warnings
- ✅ App loads on device/simulator
- ✅ All screens tested and working
- ✅ No console errors or warnings
- ✅ Performance is smooth
- ✅ All features work as expected

## 🆘 Rollback Plan

If something goes wrong:

### Option 1: Revert Specific Files
```bash
git checkout HEAD -- neura-app/package.json
git checkout HEAD -- neura-app/eslint.config.js
git checkout HEAD -- neura-app/babel.config.js
npm install
```

### Option 2: Full Rollback
```bash
git reset --hard HEAD~1
npm install
```

### Option 3: Keep New Config, Downgrade Packages
Edit `package.json` and change versions back, then:
```bash
npm install --legacy-peer-deps
```

## 📞 Support

If you need help:
1. Check error messages carefully
2. Review this checklist
3. Check INSTALLATION_GUIDE.md
4. Check MODERNIZATION_2026.md
5. Search for the error online
6. Check Expo/React Native docs

## 🎉 Completion

Once all items are checked:
- Commit your changes
- Push to repository
- Deploy to staging
- Test in production-like environment
- Deploy to production

---

**Migration Started**: March 21, 2026
**Target Completion**: Same day
**Estimated Time**: 1-2 hours
