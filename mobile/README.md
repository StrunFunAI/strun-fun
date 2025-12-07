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

### 1. Home Screen
- AI-powered task generation
- Nearby tasks map

### 2. Tasks (Marketplace)
- Sponsored tasks
- Task filtering
- Task creation
- Accepted tasks

### 3. Camera
- Photo capture
- Video recording (max 30 secs)
- GPS tracking
- Real-time location verification

### 4. Community Feed
- TikTok-style vertical feed
- Task proofs
- Upvote/downvote system
- Comments and sharing

### 5. Profile
- X/TikTok-style profile
- Stats & badges

## Platform Features

### iOS
- Native app with Expo
- iOS 14.0+

### Android  
- Native app with Expo
- Android 9.0+

### Web
- Vercel deployment
- Responsive design

## Technology Stack

- React Native 0.73.6
- Expo 51.0.0
- React Navigation
- @solana/web3.js
- Native Wind CSS

## Future Features

- 🤖 Advanced AI task generation
- 🌍 Multi-location support
- 💎 NFT achievements
- 🔔 Push notifications
- 📱 Native app store releases (iOS App Store, Google Play Store)
- Post grid
- Solana wallet integration

## 🚀 Setup

### Requirements

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- (Optional) Physical device

### Steps

```bash
# Navigate to project folder
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📱 Platform Features

### iOS
- Camera & Photo Library permissions
- Location (WhenInUse & Always) permissions
- Solana Mobile Wallet Adapter support

### Android
- Camera permission
- Fine & Coarse Location permissions
- Storage permissions
- Phantom Mobile support

## 🎯 Technology Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State**: Zustand (optional)
- **Blockchain**: Solana Web3.js
- **Camera**: expo-camera
- **Location**: expo-location
- **Maps**: react-native-maps
- **Styling**: StyleSheet + LinearGradient

## 📸 Proof Upload Flow

1. User accepts task
2. Camera opens (GPS active)
3. Take photo/video
4. GPS coordinates automatically added
5. Add caption
6. Submit → Sent to backend
7. EXIF + GPS verification
8. Community voting (24 hours)
9. Reward distribution

## 🔐 Security

- GPS coordinates extracted from EXIF data
- Server-side verification (backend)
- AI-powered content moderation
- Community voting system

## 🎨 Design System

### Colors
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

## 🌟 Future Features

- [ ] Solana Mobile Stack integration
- [ ] NFT badges (on-chain)
- [ ] Land ownership system
- [ ] Rent payments
- [ ] AI task generator integration
- [ ] Video editing tools
- [ ] AR filters
- [ ] Social features (DM, groups)
- [ ] Referral system
- [ ] Premium subscriptions

## 📝 Notes

- This project is built with Expo
- expo-dev-client recommended for development
- Use EAS Build for production builds
- Mobile wallet required for Solana integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License

## 🔗 Links

- [Solana Docs](https://docs.solana.com)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)

---

**Made with 💜 by STRUN Team**
