# 🚀 STRUN - Creator-First Web3 Task & Reward Platform

[![GitHub](https://img.shields.io/badge/GitHub-StrunFunAI-blue?logo=github)](https://github.com/StrunFunAI/strun-fun)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Solana](https://img.shields.io/badge/Built%20on-Solana-14F195?logo=solana)](https://solana.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?logo=react)](https://reactnative.dev)

> **STRUN** is a revolutionary Web3 platform empowering content creators to monetize their skills through location-based tasks, community voting, and instant SOL rewards powered by Solana blockchain.

## ✨ Features

### 🎯 Core Platform
- **AI-Powered Task Generation** - Smart task creation using Claude 3.5 Sonnet
- **Location-Based Verification** - GPS-verified task completion
- **Real-Time Community Voting** - Creator community determines winners
- **Instant SOL Rewards** - Solana blockchain for fast, transparent payouts
- **XP & Leveling System** - Gamified progression and reputation

### 📱 Mobile App (React Native + Expo)
- ✅ Google OAuth & Supabase Auth
- ✅ Photo/Video proof submission with GPS tracking
- ✅ TikTok-style community feed with upvotes/downvotes
- ✅ Real-time leaderboards and rankings
- ✅ Wallet integration (Phantom, Solflare, etc.)
- ✅ Cross-platform: iOS, Android, Web
- ✅ Dark mode with native animations
- ✅ Instant notifications

### 🔌 Backend API (Node.js/Express)
- ✅ RESTful API with JWT authentication
- ✅ PostgreSQL with Row-Level Security (RLS)
- ✅ Supabase integration for real-time updates
- ✅ Rate limiting and security middleware
- ✅ Transaction history and analytics
- ✅ Email notifications
- ✅ Scalable architecture

### ⛓️ Smart Contract (Solana)
- ✅ On-chain user profiles
- ✅ Task completion verification
- ✅ Automatic SOL distribution
- ✅ XP tracking and achievements
- ✅ Mainnet-ready deployment

---

## 🏗️ Project Structure

```
strun-fun/
├── mobile/                    # React Native Expo app
│   ├── src/
│   │   ├── screens/          # Dashboard, Tasks, Camera, Community, Profile
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API, Solana, AI services
│   │   ├── context/          # Auth, Theme context
│   │   ├── lib/              # Utilities and helpers
│   │   └── assets/           # Icons, images, media
│   ├── app.json              # Expo configuration
│   └── package.json
│
├── backend/                   # Node.js/Express API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── services/         # Solana, Database, Email
│   │   ├── models/           # Database queries
│   │   └── config/           # Environment configuration
│   ├── migrations/           # Database migrations
│   ├── .env.example          # Environment template
│   └── package.json
│
├── solana-program/           # Rust smart contract
│   ├── src/
│   │   ├── lib.rs           # Entry point
│   │   ├── processor.rs     # Instruction handlers
│   │   ├── state.rs         # Account structures
│   │   └── error.rs         # Error types
│   └── Cargo.toml
│
├── publishing/               # Release and submission files
│   ├── files/               # APK, IPA, attestation
│   ├── SUBMISSION_READY.md
│   ├── ATTESTATION_SUBMISSION.txt
│   └── google-play-checklist.md
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- **Git**
- For smart contract: **Rust** and **Solana CLI**

### 1️⃣ Clone Repository

```bash
git clone https://github.com/StrunFunAI/strun-fun.git
cd strun-fun
```

### 2️⃣ Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:password@localhost/strun
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-key
# SOLANA_RPC_URL=https://api.devnet.solana.com

# Run migrations
npm run migrate

# Start server
npm run dev
```

**Server runs on:** `http://localhost:3000`

### 3️⃣ Mobile App Setup (3 minutes)

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Press 'w' for web, 'i' for iOS, 'a' for Android, or scan with Expo Go
```

**App runs on:** `http://localhost:19006` (web) or via Expo Go (mobile)

### 4️⃣ Deploy Smart Contract (Optional)

```bash
cd solana-program

# Build
cargo build-sbf

# Deploy to devnet
solana program deploy target/sbf-solana-solana/release/strun_program.so --url devnet
```

---

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/strun

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_KEYPAIR_JSON=[76,195,25,71,...]  # Keypair as JSON array
SOLANA_PROGRAM_ID=your-program-id

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h

# AI Task Generation
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini

# Optional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

---

## 📚 API Documentation

### Authentication
```
POST   /api/auth/google          Sign in with Google
POST   /api/auth/logout          Sign out
GET    /api/auth/me              Get current user info
```

### Users
```
GET    /api/users/:id            Get user profile
PUT    /api/users/profile        Update profile
GET    /api/users/leaderboard    Get top users
POST   /api/users/wallet/connect Connect Solana wallet
```

### Tasks
```
GET    /api/tasks                List all tasks
POST   /api/tasks                Create new task
GET    /api/tasks/:id            Get task details
POST   /api/tasks/:id/accept     Accept a task
POST   /api/tasks/:id/submit     Submit proof
GET    /api/tasks/my-tasks       Get user's tasks
```

### Community & Voting
```
GET    /api/community/feed       Get community feed
POST   /api/proofs               Upload proof
GET    /api/proofs/:id           Get proof details
POST   /api/votes                Vote on proof
```

### Rewards & Transactions
```
POST   /api/rewards/fund         Fund task reward pool
POST   /api/rewards/distribute   Distribute task rewards
GET    /api/transactions         Get transaction history
GET    /api/rewards/payouts      Get payout details
```

### Leaderboard
```
GET    /api/leaderboard          Get global rankings
GET    /api/leaderboard/monthly  Get monthly rankings
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Mobile Tests
```bash
cd mobile
npm run test            # Jest tests
npm run lint            # ESLint
npm run type-check      # TypeScript check
```

---

## 📦 Deployment

### Backend Deployment

**Railway** (recommended - 1 click deploy)
```bash
# 1. Connect GitHub repo to Railway
# 2. Set environment variables
# 3. Deploy with: git push
```

**Heroku**
```bash
heroku create strun-backend
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

### Mobile App Deployment

**iOS App Store**
```bash
cd mobile
eas build --platform ios --release-channel production
eas submit --platform ios
```

**Google Play Store**
```bash
cd mobile
eas build --platform android --release-channel production
eas submit --platform android
```

---

## 🔐 Security

### Security Best Practices
- ✅ JWT authentication with expiry
- ✅ PostgreSQL Row-Level Security (RLS)
- ✅ Rate limiting on all API endpoints
- ✅ HTTPS/TLS encryption
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by STRUN Team**

[⭐ Star us on GitHub](https://github.com/StrunFunAI/strun-fun) | [🐦 Follow on Twitter](https://twitter.com/strunfun) | [💬 Join Discord](https://discord.gg/strun)

</div>
