# 🔧 Fix Installation - Windows Locked Files

## The Problem
Windows has locked the `node_modules` folder. This happens when:
- VS Code is indexing files
- Another terminal is running
- Expo/Metro bundler is still running

## ✅ Solution (Follow These Steps)

### Step 1: Close Everything
1. Close VS Code (or any editor with the project open)
2. Close all terminals running in this project
3. If Expo is running, press Ctrl+C to stop it

### Step 2: Wait 10 Seconds
Windows needs time to release file locks.

### Step 3: Delete node_modules Manually
```powershell
# In PowerShell, run:
cd E:\Life Skills\Context\neura-app
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
```

If that fails, delete the folders manually:
1. Open File Explorer
2. Go to `E:\Life Skills\Context\neura-app`
3. Delete `node_modules` folder (right-click → Delete)
4. Delete `package-lock.json` file
5. Empty Recycle Bin

### Step 4: Install Fresh
```powershell
cd E:\Life Skills\Context\neura-app
npm install --legacy-peer-deps
```

### Step 5: Start the App
```powershell
npx expo start
```

## 🚀 Alternative: Use the Existing Installation

If node_modules already exists and has most packages, you might be able to just run:

```powershell
npx expo start
```

Try this first! The installation might have completed enough to work.

## 🔍 Check What's Locking Files

If you keep having issues, check what's using the files:

1. Open Task Manager (Ctrl+Shift+Esc)
2. Look for these processes:
   - `node.exe`
   - `Code.exe` (VS Code)
   - `expo.exe`
3. End any related to your project

## ✅ Quick Commands (Copy & Paste)

```powershell
# Stop everything, wait, then install
cd E:\Life Skills\Context\neura-app
timeout /t 10
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install --legacy-peer-deps
npx expo start
```

## 💡 Pro Tip

After installation completes, the app should work. All the configuration is correct now (Expo 51 stable).
