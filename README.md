STRUN MobileA React Native Expo app for location-based task completion and proof submission.Features Location-based task marketplace
 Photo/video proof submission  
 Community feed with voting
 SOL rewards via Solana integration
 XP and leveling system

Developmentbash

npm install
npm run web      # Start web development server
npm run android  # Start Android development
npm run ios      # Start iOS development

DeploymentThis project is configured for Vercel deployment with Expo Web.AI task generation
Nearby tasks map

2. Tasks (Marketplace)Sponsored tasks
Task filtering
Task creation
Accepted tasks

3. CameraTake photos
Record video (max 30 seconds)
GPS tracking
Real-time location verification

4. Community FeedTikTok-style vertical feed
Task proofs
Upvote/downvote system
Comments and sharing

5. ProfileX/TikTok-style profile
Stats & badges
Post grid
Solana wallet integration

 SetupRequirementsNode.js 18+
Expo CLI
iOS Simulator or Android Emulator
(Optional) Physical device

Stepsbash

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

 Platform FeaturesiOSCamera & Photo Library permissions
Location (WhenInUse & Always) permissions
Solana Mobile Wallet Adapter support

AndroidCamera permission
Fine & Coarse Location permissions
Storage permissions
Phantom Mobile support

 Technology StackFramework: React Native (Expo)
Navigation: React Navigation
State: Zustand (optional)
Blockchain: Solana Web3.js
Camera: expo-camera
Location: expo-location
Maps: react-native-maps
Styling: StyleSheet + LinearGradient

 Proof Upload FlowUser accepts a task
Camera opens (GPS active)
Takes photo/video
GPS coordinates are automatically attached
Adds caption
Submits → Sent to backend
EXIF + GPS verification
Community voting (24 hours)
Reward distribution

 SecurityGPS coordinates are stripped from EXIF data
Server-side verification (backend)
AI-powered content moderation
Community voting system

 Design SystemColorsBackground: #111827 (Dark)
Cards: #1F2937
Primary: #8B5CF6 (Purple)
Secondary: #EC4899 (Pink)
Success: #10B981 (Green)
Warning: #F59E0B (Orange)
Text Primary: #FFFFFF
Text Secondary: #9CA3AF

TypographyHeading: Bold 24-28px
Body: Regular 14-16px
Caption: Regular 12px

 Backend IntegrationBackend API endpoints:typescript

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

 Future FeaturesSolana Mobile Stack integration
NFT badges (on-chain)
Land ownership system
x402 rent payments
AI task generator integration
Video editing tools
AR filters
Social features (DM, groups)
Referral system
Premium subscriptions

 NotesThis project is built with Expo
expo-dev-client is recommended for development
Use EAS Build for production builds
Mobile wallet required for Solana integration

 ContributingFork the repo
Create a feature branch (git checkout -b feature/amazing)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing)
Open a Pull Request

 LicenseMIT License LinksSolana Docs
Expo Docs
React Navigation

Made with  by STRUN Team

