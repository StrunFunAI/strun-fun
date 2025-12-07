# 🚀 STRUN Mobile - Hızlı Başlangıç Rehberi

## 📋 Ön Gereksinimler

1. **Node.js 18+** kurulu olmalı
   ```bash
   node --version  # v18.0.0 veya üzeri
   ```

2. **Git** kurulu olmalı

3. **Expo CLI** (kurulum aşamasında otomatik yüklenecek)

4. **iOS Geliştirme** (macOS'ta)
   - Xcode 14+ kurulu
   - iOS Simulator

5. **Android Geliştirme**
   - Android Studio kurulu
   - Android SDK
   - Android Emulator

## 🏁 Kurulum (macOS)

### 1. Depoyu Klonla

```bash
cd ~/Desktop/st2/mobile
```

### 2. Setup Script'i Çalıştır

```bash
chmod +x setup.sh
./setup.sh
```

Script otomatik olarak:
- ✅ Node.js kontrolü yapar
- ✅ npm bağımlılıklarını yükler
- ✅ Expo CLI'yi kurar (yoksa)

### 3. Development Server'ı Başlat

```bash
npm start
```

Tarayıcınızda Expo Dev Tools açılacak.

### 4. Uygulamayı Çalıştır

#### iOS Simulator'da:
```bash
npm run ios
```

#### Android Emulator'da:
```bash
npm run android
```

#### Fiziksel Cihazda:
1. App Store/Play Store'dan **Expo Go** indir
2. QR kodu tara

## 📱 İlk Çalıştırma

Uygulama açıldığında:

1. **Dashboard** ekranını göreceksiniz
2. Alt menüden **Tasks** sekmesine geçin
3. Bir görev seçin ve **Kabul Et** butonuna tıklayın
4. **Camera** sekmesine geçerek fotoğraf çekin
5. GPS konumunuz otomatik kaydedilecek
6. Caption ekleyip **Gönder** butonuna basın
7. **Community** sekmesinden gönderileri görün

## 🔧 Geliştirme Modu

### Hot Reload
- Kod değişiklikleriniz otomatik yansır
- iOS/Android otomatik yenilenir

### Debug Menu
- iOS: `Cmd + D`
- Android: `Cmd + M` veya cihazı sallayın

### Console Logs
```bash
# Terminalden log'ları izleyin
npx expo start --clear
```

## 🎨 Asset Dosyaları

Geliştirme için placeholder'lar yeterli ancak production için:

```bash
cd assets
# Logo ve splash ekranı tasarlayın
# Boyutlar: assets/README.md'de detaylı
```

## 🔗 Backend Bağlantısı

Şu anda mock data kullanılıyor. Backend bağlamak için:

1. `src/config/api.ts` oluşturun:
```typescript
export const API_BASE_URL = 'http://localhost:4000/api';
```

2. Her ekranda mock data yerine API çağrıları ekleyin

## 🐛 Sorun Giderme

### "Module not found" hatası
```bash
npm install
npx expo start --clear
```

### iOS build hatası
```bash
cd ios && pod install
cd .. && npm run ios
```

### Android build hatası
```bash
cd android
./gradlew clean
cd .. && npm run android
```

### Cache temizleme
```bash
npx expo start -c
```

## 📚 Dökümantasyon

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js)

## 🎯 Sonraki Adımlar

1. ✅ Backend API entegrasyonu
2. ✅ Solana wallet bağlantısı (Phantom)
3. ✅ GPS doğrulama backend'e bağla
4. ✅ Community voting sistemi
5. ✅ Push notifications
6. ✅ Production build ve deploy

## 💡 İpuçları

- **Development**: `npm start` her zaman açık olsun
- **VS Code**: React Native extension'ları kurun
- **Debugging**: React Native Debugger kullanın
- **Testing**: Fiziksel cihazda test edin (GPS için)

## 🤝 Destek

Sorun yaşarsanız:
1. `npm install` tekrar çalıştırın
2. Cache'i temizleyin (`-c` flag)
3. Node modules'u silin ve yeniden kurun
4. Expo doctor çalıştırın: `npx expo-doctor`

---

**Başarılı geliştirmeler! 🚀💜**
