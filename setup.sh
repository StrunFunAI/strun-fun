#!/bin/bash

# STRUN Mobile Setup Script

echo "🏃 STRUN Mobile - Setup Starting..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo ""
    echo "⚠️  Expo CLI not found globally. Installing..."
    npm install -g expo-cli
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm start"
echo ""
echo "📱 To run on iOS:"
echo "   npm run ios"
echo ""
echo "🤖 To run on Android:"
echo "   npm run android"
echo ""
echo "🌐 To run on web:"
echo "   npm run web"
echo ""
echo "Happy coding! 💜"
