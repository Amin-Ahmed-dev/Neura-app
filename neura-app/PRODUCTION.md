# Production Build Guide

This document outlines the temporary changes made for UI testing in Expo Go and how to reverse them for production/development builds.

## ⚠️ Current State: UI Testing Mode

The app is currently configured to run in **Expo Go** (mobile) and **Web Browser** with mocked native modules. This allows UI testing without building native code, but **data will not persist** and **native features will not work**.

### ✅ What Works Now

**Web Browser (Full Styling):**
- Run: `npx expo start --web`
- ✅ Full Tailwind CSS styling
- ✅ All UI components styled correctly
- ✅ Fonts loaded
- ✅ Navigation works
- ❌ No data persistence (mocked database)
- ❌ No native features

**Expo Go (No Styling):**
- Run: `npx expo start` then scan QR code
- ✅ App loads without crashing
- ✅ Navigation works
- ✅ Fonts loaded
- ❌ Tailwind CSS doesn't work (NativeWind v4 incompatibility)
- ❌ No data persistence (mocked database)
- ❌ No native features

**Development Build (Full Features):**
- Build: `eas build --profile development --platform android`
- ✅ Full Tailwind CSS styling
- ✅ All native modules work
- ✅ Data persistence
- ✅ Animations work properly
- ✅ All features functional

---

## 🔄 Temporary Changes Made for Testing

### 1. **WatermelonDB Completely Disabled**
- **What changed**: All WatermelonDB code commented out and mocked
- **Impact**: No data persistence, all database operations return empty results
- **Files affected**: 
  - `src/db/database.ts` - All imports commented, exports mocks only
  - `src/db/schema.ts` - Schema definition commented out
  - `src/db/models/*.ts` - All model decorators commented out
  - `src/hooks/useNeuraChat.ts` - All database queries commented out
  - `src/mocks/nativeModules.ts` - Comprehensive WatermelonDB mocks
  - `node_modules/@nozbe/watermelondb/` - Mock files created to intercept imports
  - `metro.config.js` - Resolver blocks WatermelonDB imports
  - `app/_layout.tsx` - DatabaseProvider import commented out

### 2. **Firebase Safety Checks** (`src/services/authService.ts`)
- **What changed**: Added fallback values and null checks for Firebase initialization
- **Impact**: Auth features won't work, but app won't crash
- **Location**: Firebase config initialization and all auth methods
- **Fallback values**: Using "demo-key", "demo-project", etc.

### 3. **Root Layout Simplified** (`app/_layout.tsx`)
- **What changed**: Removed DatabaseProvider completely, removed conditional logic
- **Impact**: WatermelonDB context not available, using mocks instead
- **Location**: DatabaseProvider import commented out, single render path

### 4. **React Native Reanimated Downgrade**
- **What changed**: Downgraded from v4.1.7 to v3.15.0
- **Impact**: Some newer animation APIs may not be available
- **Reason**: v4.x requires `react-native-worklets` which doesn't work in Expo Go

### 5. **Reanimated Mock** (`src/mocks/reanimated.ts`)
- **What changed**: Created mock for react-native-reanimated
- **Impact**: Animations work but aren't smooth in Expo Go
- **Location**: Metro config resolves to mock in Expo Go

### 6. **Metro Config** (`metro.config.js`)
- **What changed**: Added resolver to block WatermelonDB imports and use Reanimated mock
- **Impact**: Prevents WatermelonDB bundling errors and native module errors
- **Location**: `resolveRequest` function blocks `@nozbe/watermelondb` imports

### 7. **Removed Packages**
- **react-native-worklets**: Removed (incompatible with Expo Go)
- **Impact**: Required by Reanimated v4.x, not needed for v3.x

### 8. **App Configuration** (`app.json`)
- **What changed**: Added back WatermelonDB and Reanimated plugins for builds
- **Current state**: Plugins configured for development/production builds
- **Plugins**:
  - `@nozbe/watermelondb/expo`
  - `react-native-reanimated/plugin`

### 9. **Environment Variables** (`.env`)
- **What changed**: Created with demo Firebase credentials
- **Impact**: Firebase won't actually connect, but app won't crash
- **Flag**: `EXPO_PUBLIC_EXPO_GO=true` to enable mocks
- **Note**: Replace with real credentials for production

---

## 🚀 Building for Production/Development

You have **three options** for building the app with full functionality:

### Option 1: Web Browser (Quick UI Testing - Available Now!)

Test the UI with full styling in your web browser.

#### Steps:

1. **Start Expo with web**:
```bash
npx expo start --web
```

2. **Or press `w`** in the Expo terminal

3. **Browser opens automatically** at http://localhost:8081

#### Advantages:
- ✅ Instant - no build required
- ✅ Full Tailwind CSS styling
- ✅ Fast refresh/hot reload
- ✅ Easy to test UI changes
- ✅ Works on any OS

#### Disadvantages:
- ❌ No native features (camera, notifications, etc.)
- ❌ No data persistence (mocked database)
- ❌ Some mobile-specific UI may differ
- ❌ Not suitable for testing native functionality

---

### Option 2: Local Development Build (Recommended for Full Testing)

This creates a development build that runs on your physical device or emulator with full native module support.

#### Prerequisites:
- Android Studio installed (for Android)
- Xcode installed (for iOS, macOS only)
- EAS CLI installed: `npm install -g eas-cli`

#### Steps:

1. **Revert Temporary Changes** (see section below)

2. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

3. **Login to Expo**:
```bash
eas login
```

4. **Configure EAS Build** (already done in `eas.json`):
```bash
eas build:configure
```

5. **Build for Android** (local):
```bash
eas build --profile development --platform android --local
```

6. **Build for iOS** (local, macOS only):
```bash
eas build --profile development --platform ios --local
```

7. **Install the APK/IPA** on your device and run:
```bash
npx expo start --dev-client
```

#### Advantages:
- Full native module support
- Faster iteration than cloud builds
- No build minutes consumed
- Can debug native code

#### Disadvantages:
- Requires Android Studio/Xcode setup
- Larger initial setup time
- Platform-specific (can't build iOS on Windows)

---

### Option 3: Cloud Development Build (Easiest for Mobile)

Let Expo's servers build the app for you.

#### Steps:

1. **Revert Temporary Changes** (see section below)

2. **Build on Expo's servers**:
```bash
# Android
eas build --profile development --platform android

# iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

3. **Download and install** the build when complete

4. **Run the dev server**:
```bash
npx expo start --dev-client
```

#### Advantages:
- No local setup required
- Can build iOS on Windows
- Consistent build environment

#### Disadvantages:
- Requires Expo account
- Uses build minutes (free tier: limited)
- Slower than local builds
- Requires internet connection

---

### Option 4: Production Build

For releasing to app stores.

#### Steps:

1. **Revert ALL temporary changes**

2. **Update environment variables** with real Firebase credentials:
```bash
# Edit .env file with production values
EXPO_PUBLIC_API_URL=https://api.neura.app/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=your_real_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. **Update version** in `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    },
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

4. **Build for production**:
```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

5. **Submit to stores**:
```bash
# Android (requires google-play-key.json)
eas submit --platform android

# iOS (requires Apple Developer account)
eas submit --platform ios
```

---

## 🔧 How to Revert Temporary Changes

### Step 1: Restore Database Files

**Uncomment all WatermelonDB code** in the following files:

#### `src/db/database.ts`
Uncomment the entire commented block and remove the mock-only exports:

```typescript
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { Platform } from "react-native";
import { dbSchema } from "./schema";
import { Task } from "./models/Task";
import { StudySession } from "./models/StudySession";
import { Flashcard } from "./models/Flashcard";
import { Deck } from "./models/Deck";
import { ChatMessage } from "./models/ChatMessage";
import { SyncQueueItem } from "./models/SyncQueueItem";
import { SleepSession } from "./models/SleepSession";

// Web fallback: Use LokiJS adapter for web platform
const adapter =
  Platform.OS === "web"
    ? new (require("@nozbe/watermelondb/adapters/lokijs").default)({
        schema: dbSchema,
        useWebWorker: false,
        useIncrementalIndexedDB: true,
        dbName: "neura_db",
        onSetUpError: (error: Error) => {
          console.error("[WatermelonDB] Setup error:", error);
        },
      })
    : new SQLiteAdapter({
        schema: dbSchema,
        dbName: "neura_db",
        jsi: true,
        onSetUpError: (error: Error) => {
          console.error("[WatermelonDB] Setup error:", error);
        },
      });

export const database = new Database({
  adapter,
  modelClasses: [Task, StudySession, Flashcard, Deck, ChatMessage, SyncQueueItem, SleepSession],
});

// Typed collection accessors
export const tasksCollection = database.get<Task>("tasks");
export const sessionsCollection = database.get<StudySession>("study_sessions");
export const flashcardsCollection = database.get<Flashcard>("flashcards");
export const decksCollection = database.get<Deck>("decks");
export const chatMessagesCollection = database.get<ChatMessage>("chat_messages");
export const syncQueueCollection = database.get<SyncQueueItem>("sync_queue");
export const sleepSessionsCollection = database.get<SleepSession>("sleep_sessions");
```

#### `src/db/schema.ts`
Uncomment the entire schema definition.

#### `src/db/models/*.ts`
Uncomment all model class definitions with decorators in:
- `Task.ts`
- `StudySession.ts`
- `Flashcard.ts`
- `Deck.ts`
- `ChatMessage.ts`
- `SyncQueueItem.ts`
- `SleepSession.ts`

#### `src/hooks/useNeuraChat.ts`
Uncomment all WatermelonDB query code in:
- `loadHistory()`
- `loadOlderMessages()`
- `saveToDb()`
- `clearHistory()`

### Step 2: Restore Firebase (`src/services/authService.ts`)

**Remove** the safety checks and restore strict initialization:

```typescript
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import { apiClient, TOKEN_KEY } from "./apiClient";
import type { User } from "@/store/authStore";

// ── Firebase init (singleton) ─────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(app);

// ... rest of the file (remove all null checks and error handling for firebaseAuth)
```

### Step 3: Restore Root Layout (`app/_layout.tsx`)

**Uncomment** the DatabaseProvider import and wrap the app:

```typescript
import { DatabaseProvider } from "@nozbe/watermelondb/DatabaseProvider";

// In the return statement:
return (
  <ErrorBoundary>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider database={database}>
          <QueryClientProvider client={queryClient}>
            {/* ... rest of the JSX */}
          </QueryClientProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  </ErrorBoundary>
);
```

### Step 4: Upgrade React Native Reanimated

```bash
npm install react-native-reanimated@~4.1.1 --legacy-peer-deps
```

### Step 5: Remove Mock Files

```bash
rm -rf src/mocks
```

Or manually delete:
- `src/mocks/nativeModules.ts`
- `src/mocks/reanimated.ts`

### Step 6: Restore Metro Config (`metro.config.js`)

**Remove** the WatermelonDB blocking logic from the resolver:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Remove the entire resolver section that blocks @nozbe/watermelondb

module.exports = withNativeWind(config, { input: "./global.css" });
```

### Step 6b: Remove Mock Files from node_modules

**Delete** the mock files created in `node_modules/@nozbe/watermelondb/`:
- `node_modules/@nozbe/watermelondb/index.js`
- `node_modules/@nozbe/watermelondb/decorators/index.js`
- `node_modules/@nozbe/watermelondb/DatabaseProvider/index.js`
- `node_modules/@nozbe/watermelondb/adapters/sqlite/index.js`

Or simply reinstall the package:
```bash
npm uninstall @nozbe/watermelondb
npm install @nozbe/watermelondb@^0.27.1 --legacy-peer-deps
```

### Step 7: Update Environment Variables

Replace `.env` with real Firebase credentials (never commit this file):

```bash
EXPO_PUBLIC_API_URL=https://your-api-url.com/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=your_real_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123
# Remove EXPO_PUBLIC_EXPO_GO flag
```

### Step 8: Clean and Rebuild

```bash
# Clear all caches
npx expo start --clear

# Or for a fresh start (recommended after uncommenting everything)
rm -rf node_modules .expo
npm install --legacy-peer-deps
npx expo prebuild --clean
```

---

## 📋 Pre-Build Checklist

Before building for production or development, ensure:

- [ ] All WatermelonDB code uncommented in:
  - [ ] `src/db/database.ts`
  - [ ] `src/db/schema.ts`
  - [ ] `src/db/models/*.ts` (all 7 model files)
  - [ ] `src/hooks/useNeuraChat.ts`
  - [ ] `app/_layout.tsx` (DatabaseProvider)
- [ ] Mock files removed from `node_modules/@nozbe/watermelondb/`
- [ ] WatermelonDB reinstalled: `npm install @nozbe/watermelondb@^0.27.1 --legacy-peer-deps`
- [ ] Real Firebase credentials in `.env`
- [ ] Real API URL configured
- [ ] WatermelonDB plugin in `app.json`
- [ ] Reanimated v4.x installed
- [ ] `src/mocks/` directory deleted
- [ ] Metro config restored (WatermelonDB blocking removed)
- [ ] `EXPO_PUBLIC_EXPO_GO` flag removed from `.env`
- [ ] Version numbers updated in `app.json`
- [ ] Run `npx expo prebuild --clean`
- [ ] Tested on a development build first
- [ ] All native permissions configured (camera, notifications, location)
- [ ] Google Play key configured (for Android submission)
- [ ] Apple Developer account configured (for iOS submission)

---

## 🐛 Common Issues

### Issue: "import.meta may only appear in a module"
**Solution**: This happens when WatermelonDB is being bundled. Make sure the metro config is blocking it OR you've properly uncommented all code and reinstalled WatermelonDB from npm (not using mocks).

### Issue: "Cannot find module '@nozbe/watermelondb/expo'"
**Solution**: Make sure you've added the plugin back to `app.json` and run `npx expo prebuild --clean`

### Issue: "TurboModule method 'installTurboModule' called with 1 arguments"
**Solution**: This happens in Expo Go. You must use a development build for native modules.

### Issue: "Firebase auth component not registered"
**Solution**: Ensure you have real Firebase credentials in `.env` and Firebase is properly initialized.

### Issue: Build fails with "JSI not available"
**Solution**: Make sure you're building with the correct profile and all plugins are configured in `app.json`.

### Issue: "Database not persisting data"
**Solution**: You're likely still running in Expo Go with mocks. Build a development build instead.

---

## 📚 Additional Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [WatermelonDB Setup](https://watermelondb.dev/docs/Installation)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Firebase Setup for React Native](https://rnfirebase.io/)

---

## 🎯 Quick Command Reference

```bash
# UI Testing - Web (current state - WORKS WITH STYLING)
npx expo start --web

# UI Testing - Expo Go Mobile (no styling)
npx expo start

# Local Development Build
eas build --profile development --platform android --local

# Cloud Development Build
eas build --profile development --platform android

# Production Build
eas build --profile production --platform android

# Submit to Store
eas submit --platform android

# Clean Everything
rm -rf node_modules .expo && npm install --legacy-peer-deps
```

---

**Last Updated**: April 2, 2026  
**Current Mode**: UI Testing (Web + Expo Go)  
**Recommended**: Test UI in web browser, then build development build for full features
