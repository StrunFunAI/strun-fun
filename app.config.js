export default {
  expo: {
    name: "STRUN",
    slug: "strun-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#111827"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.strun.mobile",
      scheme: "strun",
      infoPlist: {
        NSCameraUsageDescription: "STRUN needs camera access to capture task proofs",
        NSPhotoLibraryUsageDescription: "STRUN needs photo library access to select images",
        NSLocationWhenInUseUsageDescription: "STRUN needs location access to verify task completion",
        NSLocationAlwaysUsageDescription: "STRUN needs location access to track running activities"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111827"
      },
      package: "com.strun.mobile",
      scheme: "strun",
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      bundler: "webpack"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow STRUN to access your camera to capture task proofs"
        }
      ],
      "expo-location",
      "expo-font"
    ],
    // ✅ Environment variables için extra config
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://yspbmyvazyroblgfuxuj.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcGJteXZhenlyb2JsZ2Z1eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjQxODMsImV4cCI6MjA4MDQ0MDE4M30.Vs46lekcDOT61qoSg-j0Qh9yx9e-SkO9326Qelc2S28",
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    }
  }
};
