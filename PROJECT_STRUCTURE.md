# 📁 STRUN Mobile - Project Structure

## Directory Tree

```
mobile/
├── App.tsx                          # Main app + navigation
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── babel.config.js                  # Babel config
├── setup.sh                         # Automatic setup script
├── .gitignore                       # Git ignore rules
│
├── assets/                          # Images and media
│   ├── README.md                    # Asset requirements
│   ├── icon.png                     # App icon (1024x1024)
│   ├── splash.png                   # Splash screen (1242x2436)
│   ├── adaptive-icon.png            # Android icon
│   └── favicon.png                  # Web favicon
│
└── src/                             # Source code
    └── screens/                     # All screens
        ├── DashboardScreen.tsx      # Home screen
        ├── TasksScreen.tsx          # Task marketplace
        ├── CameraScreen.tsx         # Camera + GPS
        ├── CommunityScreen.tsx      # Social feed
        ├── ProfileScreen.tsx        # User profile
        ├── TaskDetailScreen.tsx     # Task details
        └── ProofUploadScreen.tsx    # Proof upload
```

## 📱 Screen Details

### DashboardScreen.tsx
**Purpose**: Main control center, user's daily tasks and statistics

**Components**:
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

**Navigation**: TaskDetail, ProofUpload

---

### TasksScreen.tsx
**Purpose**: Task discovery and marketplace

**Tabs**:
1. **Marketplace** - Sponsored tasks
2. **My Tasks** - Accepted tasks
3. **Create** - Create new task

**Components**:
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
**Purpose**: Photo/video capture + GPS tracking

**Features**:
- expo-camera integration
- Front/back camera toggle
- Photo/video capture
- GPS location capture
- Recording indicator

**Flow**:
1. Permission check (camera + location)
2. Camera opens
3. User takes photo or holds to record video
4. GPS coordinates auto-recorded
5. Navigate to ProofUpload screen

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
**Purpose**: Social feed (TikTok/Instagram style)

**Components**:
- Filter tabs (All, Trending, Photos, Videos, Fitness)
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
**Purpose**: X/TikTok-style user profile

**Sections**:
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
**Purpose**: Task detail page

**Components**:
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
**Purpose**: Proof upload and submit

**Components**:
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
1. Media preview shown
2. GPS "Verified" badge
3. User writes caption
4. Submit clicked
5. Sent to backend
6. Success → redirect to community feed

---

## 🎨 Design System

### Colors
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

### Typography
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

## 🔧 Configuration

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

### Blockchain (future)
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

### EAS Build (recommended)
```bash
eas build --platform ios
eas build --platform android
```

---

## 📝 Notes

- All screens designed in dark mode
- GPS permissions configured separately per platform
- Currently using mock data (backend integration needed)
- TypeScript strict mode active
- Using Expo managed workflow

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-03
