# STRUN Mobile

A React Native Expo app for location-based task completion and proof submission.

## Features

- 🏃‍♂️ Location-based task marketplace
- 📸 Photo/video proof submission  
- 🏆 Community feed with voting
- 💰 SOL rewards via Solana integration
- 🎯 XP and leveling system

## Development

```bash
npm install
npm run web      # Start web development server
npm run android  # Start Android development
npm run ios      # Start iOS development
```

## Deployment

This project is configured for Vercel deployment with Expo Web.
- AI görev üretimi
- Yakındaki görevler haritası

### 2. Tasks (Marketplace)
- Sponsorlu görevler
- Görev filtreleme
- Görev oluşturma
- Kabul edilen görevler

### 3. Camera
- Fotoğraf çekme
- Video kaydetme (max 30 sn)
- GPS tracking
- Gerçek zamanlı konum doğrulama

### 4. Community Feed
- TikTok tarzı vertical feed
- Görev kanıtları
- Upvote/downvote sistemi
- Yorum ve paylaşım

### 5. Profile
- X/TikTok tarzı profil
- Stats & badges
- Post grid
- Solana wallet entegrasyonu

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Expo CLI
- iOS Simulator veya Android Emulator
- (Opsiyonel) Fiziksel cihaz

### Adımlar

```bash
# Proje klasörüne git
cd mobile

# Bağımlılıkları yükle
npm install

# Expo development server'ı başlat
npm start

# iOS simulator'da çalıştır
npm run ios

# Android emulator'da çalıştır
npm run android
```

## 📱 Platform Özellikleri

### iOS
- Camera & Photo Library izinleri
- Location (WhenInUse & Always) izinleri
- Solana Mobile Wallet Adapter desteği

### Android
- Camera izni
- Fine & Coarse Location izinleri
- Storage izinleri
- Phantom Mobile desteği

## 🎯 Teknoloji Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State**: Zustand (opsiyonel)
- **Blockchain**: Solana Web3.js
- **Camera**: expo-camera
- **Location**: expo-location
- **Maps**: react-native-maps
- **Styling**: StyleSheet + LinearGradient

## 📸 Proof Upload Flow

1. Kullanıcı görevi kabul eder
2. Kamera açılır (GPS aktif)
3. Fotoğraf/video çeker
4. GPS koordinatları otomatik eklenir
5. Caption ekler
6. Submit → Backend'e gider
7. EXIF + GPS doğrulama
8. Community voting (24 saat)
9. Ödül dağıtımı

## 🔐 Güvenlik

- GPS koordinatları EXIF verisinden çıkarılır
- Server-side doğrulama (backend)
- AI destekli içerik moderasyonu
- Community voting sistemi

## 🎨 Design System

### Renkler
- Background: `#111827` (Dark)
- Cards: `#1F2937`
- Primary: `#8B5CF6` (Purple)
- Secondary: `#EC4899` (Pink)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Text Primary: `#FFFFFF`
- Text Secondary: `#9CA3AF`

### Typography
- Heading: Bold 24-28px
- Body: Regular 14-16px
- Caption: Regular 12px

## 🔗 Backend Integration

Backend API endpoints:

```typescript
// Tasks
GET    /api/tasks              // Marketplace
POST   /api/tasks              // Create task
GET    /api/tasks/:id          // Task detail
POST   /api/tasks/:id/accept   // Accept task

// Proofs
POST   /api/proofs             // Upload proof
GET    /api/proofs/:id         // Proof detail
POST   /api/proofs/:id/vote    // Vote on proof

// User
GET    /api/user/profile       // User profile
GET    /api/user/stats         // User stats
POST   /api/user/wallet        // Connect wallet
```

## 🌟 Gelecek Özellikler

- [ ] Solana Mobile Stack entegrasyonu
- [ ] NFT rozetler (on-chain)
- [ ] Land ownership sistemi
- [ ] x402 rent payments
- [ ] AI task generator integration
- [ ] Video editing tools
- [ ] AR filters
- [ ] Social features (DM, groups)
- [ ] Referral system
- [ ] Premium subscriptions

## 📝 Notlar

- Bu proje Expo ile geliştirilmiştir
- Development için expo-dev-client önerilir
- Production build için EAS Build kullanın
- Solana entegrasyonu için mobil cüzdan gereklidir

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 🔗 Bağlantılar

- [Solana Docs](https://docs.solana.com)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)

---

**Made with 💜 by STRUN Team**
