# 🚀 STRUN Mobile - Quick Start Guide

## 📋 Prerequisites

1. **Node.js 18+** must be installed
   ```bash
   node --version  # v18.0.0 or higher
   ```

2. **Git** must be installed

3. **Expo CLI** (will auto-install during setup)

4. **iOS Development** (macOS only)
   - Xcode 14+ installed
   - iOS Simulator

5. **Android Development**
   - Android Studio installed
   - Android SDK
   - Android Emulator

## 🏁 Setup (macOS)

### 1. Clone Repository

```bash
cd ~/Desktop/st2/mobile
```

### 2. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

Script automatically:
- ✅ Checks Node.js
- ✅ Installs npm dependencies
- ✅ Installs Expo CLI (if needed)

### 3. Start Development Server

```bash
npm start
```

Expo Dev Tools will open in your browser.

### 4. Run Application

#### On iOS Simulator:
```bash
npm run ios
```

#### On Android Emulator:
```bash
npm run android
```

#### On Physical Device:
1. Download **Expo Go** from App Store/Play Store
2. Scan QR code

## 📱 First Launch

When app opens:

1. You'll see the **Dashboard** screen
2. Switch to **Tasks** tab from bottom menu
3. Select a task and tap **Accept**
4. Go to **Camera** tab and take photo
5. Your GPS location will be saved automatically
6. Add caption and tap **Submit**
7. View submissions in **Community** tab

## 🔧 Development Mode

### Hot Reload
- Code changes apply automatically
- iOS/Android refresh automatically

### Debug Menu
- iOS: `Cmd + D`
- Android: `Cmd + M` or shake device

### Console Logs
```bash
# Watch logs from terminal
npx expo start --clear
```

## 🎨 Asset Files

Placeholders sufficient for development, but for production:

```bash
cd assets
# Design logo and splash screen
# Sizes: see details in assets/README.md
```

## 🔗 Backend Connection

Currently using mock data. To connect backend:

1. Create `src/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:4000/api';
```

2. Add API calls instead of mock data on each screen

## 🐛 Troubleshooting

### "Module not found" error
```bash
npm install
npx expo start --clear
```

### iOS build error
```bash
cd ios && pod install
cd .. && npm run ios
```

### Android build error
```bash
cd android
./gradlew clean
cd .. && npm run android
```

### Clear cache
```bash
npx expo start -c
```

## 📚 Documentation

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js)

## 🎯 Next Steps

1. ✅ Backend API integration
2. ✅ Solana wallet connection (Phantom)
3. ✅ Connect GPS verification to backend
4. ✅ Community voting system
5. ✅ Push notifications
6. ✅ Production build and deployment

## 💡 Tips

- **Development**: Keep `npm start` running
- **VS Code**: Install React Native extensions
- **Debugging**: Use React Native Debugger
- **Testing**: Test on physical device (for GPS)

## 🤝 Support

If you encounter issues:
1. Run `npm install` again
2. Clear cache (with `-c` flag)
3. Delete node_modules and reinstall
4. Run Expo doctor: `npx expo-doctor`

---

**Happy developing! 🚀💜**
