# ⚡ Quick Start - Neura App (2026)

## 🚀 Installation (2 Commands - EASIEST)

```bash
cd neura-app
npx expo install --fix
npx expo start
```

The `expo install --fix` command automatically resolves all version conflicts for Expo 52.

## 📦 Alternative Installation

If you prefer npm:

```bash
cd neura-app
npm install --legacy-peer-deps
npm start
```

Note: npm install may take 5-10 minutes. Be patient!

## ✅ Verify Everything Works

```bash
npm run validate
```

This runs TypeScript check + ESLint + Prettier in one command.

## 📱 Run the App

```bash
# Development server
npm start

# Android
npm run android

# iOS  
npm run ios

# Clear cache
npm start -- --clear
```

## 🔧 Common Commands

```bash
# Fix linting issues
npm run lint:fix

# Format all files
npm run format

# Type check
npm run ts:check

# Clean everything
rm -rf node_modules package-lock.json .expo
npm install --legacy-peer-deps
```

## 🐛 Troubleshooting

### Issue: Peer dependency conflicts
```bash
npm install --legacy-peer-deps
```

### Issue: Module not found
```bash
npm start -- --clear
```

### Issue: Installation hangs
```bash
npm cache clean --force
npm install --legacy-peer-deps --force
```

## 📚 Documentation

- `INSTALLATION_GUIDE.md` - Detailed installation
- `MODERNIZATION_2026.md` - What changed
- `MIGRATION_CHECKLIST.md` - Migration steps
- `UPGRADE_SUMMARY.md` - Complete summary

## 🎯 What's New

- ✅ Expo 52 (latest)
- ✅ React Native 0.76.5 (latest)
- ✅ ESLint 9 flat config
- ✅ TypeScript 5.7 strict mode
- ✅ Zero warnings policy
- ✅ Modern Babel config
- ✅ Enhanced Prettier

## 🎉 Success Indicators

You're good when:
- ✅ `npm install` completes
- ✅ `npm run validate` passes
- ✅ `npm start` runs without warnings
- ✅ App loads on device

---

**Need help?** Check `INSTALLATION_GUIDE.md`
