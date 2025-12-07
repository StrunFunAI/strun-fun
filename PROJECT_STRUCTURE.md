# 📁 STRUN Mobile - Proje Yapısı

## Dizin Ağacı

```
mobile/
├── App.tsx                          # Ana uygulama + navigation
├── app.json                         # Expo konfigürasyonu
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── babel.config.js                  # Babel config
├── setup.sh                         # Otomatik kurulum script
├── .gitignore                       # Git ignore kuralları
│
├── assets/                          # Görseller ve medya
│   ├── README.md                    # Asset gereksinimleri
│   ├── icon.png                     # App icon (1024x1024)
│   ├── splash.png                   # Splash screen (1242x2436)
│   ├── adaptive-icon.png            # Android icon
│   └── favicon.png                  # Web favicon
│
└── src/                             # Kaynak kodlar
    └── screens/                     # Tüm ekranlar
        ├── DashboardScreen.tsx      # Ana sayfa
        ├── TasksScreen.tsx          # Görev marketplace
        ├── CameraScreen.tsx         # Kamera + GPS
        ├── CommunityScreen.tsx      # Sosyal feed
        ├── ProfileScreen.tsx        # Kullanıcı profili
        ├── TaskDetailScreen.tsx     # Görev detayı
        └── ProofUploadScreen.tsx    # Kanıt yükleme
```

## 📱 Ekran Detayları

### DashboardScreen.tsx
**Amaç**: Ana kontrol merkezi, kullanıcının günlük görevleri ve istatistikleri

**Bileşenler**:
- Header (user stats, level, XP bar)
- Streak display
- Daily tasks list
- AI task generator button
- Map preview
- Daily challenge banner

**State**:
```typescript
{
  stats: { level, xp, streak, dailyTasks, totalSOL },
  todayTasks: Task[],
}
```

**Navigasyon**: TaskDetail, ProofUpload

---

### TasksScreen.tsx
**Amaç**: Görev keşfi ve marketplace

**Tabs**:
1. **Marketplace** - Sponsorlu görevler
2. **My Tasks** - Kabul edilen görevler
3. **Create** - Yeni görev oluştur

**Bileşenler**:
- Search bar
- Filter buttons
- Task cards (sponsor, distance, reward, slots)

**State**:
```typescript
{
  activeTab: 'marketplace' | 'my-tasks' | 'create',
  searchQuery: string,
  marketplaceTasks: Task[],
}
```

---

### CameraScreen.tsx
**Amaç**: Fotoğraf/video çekimi + GPS tracking

**Özellikler**:
- expo-camera entegrasyonu
- Front/back camera toggle
- Photo/video capture
- GPS location capture
- Recording indicator

**Flow**:
1. Permission check (camera + location)
2. Camera açılır
3. Kullanıcı fotoğraf çeker veya basılı tutarak video çeker
4. GPS koordinatları otomatik kaydedilir
5. ProofUpload ekranına yönlendirilir

**State**:
```typescript
{
  hasPermission: boolean | null,
  type: CameraType,
  isRecording: boolean,
}
```

---

### CommunityScreen.tsx
**Amaç**: Sosyal feed (TikTok/Instagram benzeri)

**Bileşenler**:
- Filter tabs (Tümü, Trend, Fotoğraf, Video, Fitness)
- Post cards:
  - User avatar + name
  - Task badge
  - Media (photo/video)
  - Rewards badge
  - Actions (upvote, comment, share, bookmark)
  - Timestamp

**State**:
```typescript
{
  posts: Post[],
  activeFilter: string,
}
```

---

### ProfileScreen.tsx
**Amaç**: X/TikTok tarzı kullanıcı profili

**Bölümler**:
- Cover photo + avatar
- User info (name, username, bio)
- Stats (level, tasks completed, SOL earned)
- Follow stats
- Badges showcase
- Post grid (3 columns)
- Wallet section (balance, deposit, send, swap)

**Tabs**:
- Grid (posts)
- List (tasks)
- Bookmarks

---

### TaskDetailScreen.tsx
**Amaç**: Görev detay sayfası

**Bileşenler**:
- Header image/map
- Title + description
- Meta info (location, duration)
- Rewards section (XP + SOL)
- Requirements list
- How it works steps (1-4)
- Accept CTA button

**Props**:
```typescript
route.params.task: Task
```

---

### ProofUploadScreen.tsx
**Amaç**: Kanıt yükleme ve submit

**Bileşenler**:
- Media preview (photo/video)
- Location verification badge
- Caption input
- Task info (rewards)
- Verification process explanation
- Submit button

**Props**:
```typescript
route.params: {
  mediaUri: string,
  mediaType: 'photo' | 'video',
  location: { latitude, longitude }
}
```

**Flow**:
1. Medya önizlemesi gösterilir
2. GPS "Doğrulandı" badge'i
3. Kullanıcı caption yazar
4. Submit tıklanır
5. Backend'e gönderilir
6. Success → Community feed'e yönlendir

---

## 🎨 Stil Sistemi

### Renkler
```typescript
const colors = {
  background: '#111827',      // Dark background
  card: '#1F2937',           // Card background
  border: '#374151',         // Borders
  primary: '#8B5CF6',        // Purple (primary)
  secondary: '#EC4899',      // Pink (accent)
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Orange
  gold: '#FFD700',           // XP/Level
  solana: '#FBBF24',         // SOL rewards
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};
```

### Tipografi
```typescript
const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
```

### Spacing
```typescript
const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
};
```

### Border Radius
```typescript
const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

---

## 🔄 Navigation Flow

```
Main (BottomTabs)
├── Dashboard
├── Tasks
│   └── TaskDetail
│       └── ProofUpload
├── Camera
│   └── ProofUpload
├── Community
└── Profile
```

### Stack Navigation
```typescript
type RootStackParamList = {
  Main: undefined;
  TaskDetail: { task: Task };
  ProofUpload: { 
    mediaUri: string; 
    mediaType: 'photo' | 'video';
    location: { latitude: number; longitude: number };
  };
};
```

---

## 🔧 Konfigürasyon

### app.json
- App name, slug, version
- iOS/Android permissions
- Splash screen config
- Icon paths
- Plugins (camera, location)

### tsconfig.json
- TypeScript strict mode
- React Native JSX
- Module resolution

### babel.config.js
- Expo preset
- Reanimated plugin

---

## 📦 Dependencies

### Core
- react, react-native
- expo, expo-camera, expo-location
- @react-navigation/*

### UI
- @expo/vector-icons (Ionicons)
- expo-linear-gradient

### Blockchain (gelecek)
- @solana/web3.js
- @solana-mobile/mobile-wallet-adapter-*

---

## 🚀 Build & Deploy

### Development
```bash
npm start         # Expo dev server
npm run ios       # iOS simulator
npm run android   # Android emulator
```

### Production
```bash
expo build:ios    # iOS IPA
expo build:android # Android APK/AAB
```

### EAS Build (önerilen)
```bash
eas build --platform ios
eas build --platform android
```

---

## 📝 Notlar

- Tüm ekranlar dark mode'da tasarlanmıştır
- GPS permission'ları her platform için ayrı yapılandırılmıştır
- Mock data kullanılmaktadır (backend entegrasyonu gerekiyor)
- TypeScript strict mode aktif
- Expo managed workflow kullanılmaktadır

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-03
