# 📦 Neura App - Installation Guide (2026 Modernized)

## 🚀 Quick Start

### Option 1: Fresh Install (Recommended)

```bash
cd neura-app

# Clean everything
rm -rf node_modules package-lock.json .expo

# Install dependencies
npm install --legacy-peer-deps

# Start the app
npm start
```

### Option 2: If Option 1 Fails

```bash
cd neura-app

# Clean everything including cache
rm -rf node_modules package-lock.json .expo
npm cache clean --force

# Install with force flag
npm install --legacy-peer-deps --force

# Start the app
npm start
```

## 🔧 Configuration Updates Applied

### ✅ ESLint 9 Flat Config
- **Old**: `.eslintrc.js` (deprecated)
- **New**: `eslint.config.js` (ES module format)
- **Benefits**: Faster, more flexible, modern syntax

### ✅ Babel Modernization
- Updated decorator plugin syntax
- Removed deprecated class-properties plugin
- Added production console removal
- Optimized for React Native 0.76+

### ✅ TypeScript Strict Mode
- All strict flags enabled
- Catches more bugs at compile time
- Better IDE autocomplete

### ✅ Prettier Enhanced
- Added all modern formatting rules
- Created .prettierignore
- Consistent code style

## 📋 Verification Steps

After installation, run these commands to verify everything works:

```bash
# 1. Check TypeScript
npm run ts:check

# 2. Check ESLint
npm run lint

# 3. Check Prettier
npm run format:check

# 4. Run all checks
npm run validate
```

## 🎯 Expected Results

All commands should complete with:
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Zero Prettier issues

## 🐛 Troubleshooting

### Issue: "Cannot find module 'eslint.config.js'"
**Solution**: The file uses ES module syntax. Ensure you have Node.js 18+ installed.

### Issue: "Peer dependency conflicts"
**Solution**: Always use `--legacy-peer-deps` flag with npm install.

### Issue: "Module not found" errors when starting
**Solution**: 
```bash
npm start -- --clear
# or
expo start --clear
```

### Issue: ESLint errors about imports
**Solution**: The new config enforces `type` imports. Update imports like:
```typescript
// Old
import { SomeType } from './types';

// New
import type { SomeType } from './types';
```

### Issue: Babel decorator errors
**Solution**: The decorator plugin is updated. If you see errors, check that decorators use the correct syntax.

## 📦 Package Versions

### Core Framework
- Expo: ~52.0.23
- React: 18.3.1
- React Native: 0.76.5
- expo-router: ~4.0.14

### Development Tools
- TypeScript: ~5.7.2
- ESLint: ^9.17.0
- Prettier: ^3.4.2
- Babel: ^7.26.0

### Key Libraries
- @gorhom/bottom-sheet: ^5.0.5
- @nozbe/watermelondb: ^0.27.1
- @tanstack/react-query: ^5.62.7
- zustand: ^5.0.2
- nativewind: ^4.1.23

## 🎨 Design System

All design tokens are already configured:
- **Colors**: Background, surface, primary, accent, neurons
- **Typography**: 10 variants (display-lg to overline)
- **Spacing**: xs to 4xl
- **Elevation**: base, raised, floating
- **Animations**: Particle burst, check, pulse, bounce

## 🌐 RTL Support

The app is configured for Arabic (RTL):
- Fonts: Tajawal, Amiri, Cairo
- Layout: RTL by default
- Accessibility: Screen reader support

## 🔐 Security

- Latest versions with security patches
- No deprecated packages
- Strict TypeScript prevents common bugs
- ESLint catches security issues

## 📱 Running the App

### Development
```bash
npm start
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

### Clear Cache
```bash
npm run start:clear
```

## 🧪 Quality Checks

### Before Committing
```bash
npm run validate
```

This runs:
1. TypeScript type checking
2. ESLint linting
3. Prettier format checking

### Auto-fix Issues
```bash
npm run lint:fix
npm run format
```

## 📊 Performance

### Build Optimization
- Lazy imports enabled
- Console logs removed in production
- Native driver used where possible
- React Native new architecture ready

### Bundle Size
- Tree shaking enabled
- Unused code eliminated
- Optimized dependencies

## 🎯 Zero Warnings Goal

The project is configured to achieve zero warnings:
- ESLint: `--max-warnings 0`
- TypeScript: Strict mode catches all issues
- Prettier: Enforces consistent style

## 📝 Next Steps

1. ✅ Run `npm install --legacy-peer-deps`
2. ✅ Run `npm run validate` to check everything
3. ✅ Run `npm start` to launch the app
4. ✅ Test all screens for any breaking changes
5. ✅ Update any deprecated API usage if found

## 🆘 Need Help?

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review `MODERNIZATION_2026.md` for details
3. Check the error message carefully
4. Try clearing cache and reinstalling

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ `npm install` completes without errors
- ✅ `npm run validate` passes all checks
- ✅ `npm start` launches without warnings
- ✅ App loads on device/simulator
- ✅ All screens render correctly
- ✅ No console errors in Metro bundler

---

**Last Updated**: March 21, 2026
**Expo SDK**: 52
**React Native**: 0.76.5
**Node.js**: 18+ required
