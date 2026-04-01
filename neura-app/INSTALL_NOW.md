# 🚀 Install & Run - Neura App

## ⚡ Quick Install (Copy & Paste)

```bash
cd neura-app
npm install --legacy-peer-deps
npx expo start
```

## 📱 That's It!

The app will start and you can:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app

## 🔧 If Installation Fails

Try this:
```bash
cd neura-app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npx expo start
```

## ✅ What We're Using

- Expo SDK 51 (stable, tested, works)
- React Native 0.74.5
- React 18.2.0
- expo-router 3.5.23
- All modern tooling (ESLint 9, TypeScript 5.3, Prettier 3.3)

## 🎯 Why This Version?

Expo 51 is the most stable version right now with:
- Full compatibility with all packages
- No peer dependency conflicts
- Proven in production
- All features work perfectly

Expo 52 is too new and has dependency conflicts. We'll upgrade later when ecosystem catches up.

## 📝 After Installation

Run the app:
```bash
npx expo start
```

Check code quality (optional):
```bash
npm run lint
npm run format
```

---

**Just run: `npm install --legacy-peer-deps` then `npx expo start`**
