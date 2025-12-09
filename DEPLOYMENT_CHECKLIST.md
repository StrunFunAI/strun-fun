# 🚀 STRUN v1.2.0 - Deployment Checklist

**Build Status:** ✅ COMPLETE
**Build Date:** December 9, 2025
**APK Version:** 1.2.0 (Code: 14)
**Build Platform:** EAS Build (Expo)

---

## 📋 Action Plan

### Phase 1: APK Download & Testing (⏰ 5-10 mins)

- [ ] **Download APK from EAS Build**
  ```
  👉 https://expo.dev/accounts/bl10buer/projects/strun-mobile/builds
  ```
  - Bulunacak dosya: `strun-1.2.0-production.apk` (~80MB)
  - Kontrol: Version Code = 14

- [ ] **USB ile Android telefon bağla**
  ```bash
  adb devices  # Telefonu görmeli
  ```

- [ ] **Eski STRUN uygulamasını sil**
  ```bash
  adb uninstall com.strun.mobile
  ```

- [ ] **Yeni APK'yı yükle**
  ```bash
  adb install ~/Downloads/strun-1.2.0-production.apk
  ```

- [ ] **Uygulamayı aç ve test et**
  - ✅ Splash screen yüklensin
  - ✅ Login ekranı görün
  - ✅ "Google ile Giriş" butonuna tıklayın
  - ✅ Google hesabınızla login olun
  - ✅ OAuth token kaydedilsin (localStorage)
  - ✅ Dashboard yüklensin
  - ✅ Cüzdan bağlantısını test edin (Phantom/Solflare)

---

### Phase 2: GitHub Release Oluştur (⏰ 5 mins)

- [ ] **GitHub'da Release oluştur**
  ```
  👉 https://github.com/StrunFunAI/strun-fun/releases
  ```

  **Detaylar:**
  ```
  Tag: v1.2.0
  Release Title: STRUN v1.2.0 - Solana dApp Store Ready
  
  Description:
  
  ## 🎉 What's New
  - ✅ Enhanced Google OAuth integration (web & mobile)
  - ✅ Deep linking support for Solana dApp Store
  - ✅ Improved wallet adapter stability
  - ✅ Version code updated (13 → 14)
  - ✅ Bug fixes and performance optimizations
  
  ## 📦 Installation
  
  ### Android
  - Download APK: [strun-v1.2.0-production.apk]
  - Install: adb install strun-v1.2.0-production.apk
  
  ### Requirements
  - Android 7.0+ (API 24+)
  - 80MB free storage
  - Camera & Location permissions
  
  ## 🔗 Links
  - [Privacy Policy](https://strunfunai.github.io/strun-fun/privacy-policy.html)
  - [Terms of Service](https://strunfunai.github.io/strun-fun/terms.html)
  - [Website](https://strun.fun)
  ```

- [ ] **APK dosyasını Attachments olarak ekle**
  - EAS Build'ten indirilen APK'yı yükle
  - Filename: `strun-v1.2.0-production.apk`

---

### Phase 3: Solana dApp Store Güncelleme (⏰ 10-15 mins)

**Önemli:** Solana dApp Store'da account'a giriş yapabilmeniz gerekiyor.

- [ ] **Solana dApp Store Developer Console'a gir**
  ```
  👉 https://dapp-store.solana.com/publisher/dashboard
  Email: info@strun.fun
  ```

- [ ] **STRUN uygulamasını bul**
  - Left menu: "My Apps"
  - "STRUN" öğesine tıkla

- [ ] **Yeni APK'yı upload et**
  - "Upload New Version" butonuna tıkla
  - Dosyayı seç: `strun-v1.2.0-production.apk`
  - Version Code otomatik olarak 14'e güncellenecek

- [ ] **Release Notes'u güncelle**
  ```markdown
  ## Version 1.2.0
  
  ### What's Improved
  - 🔐 Enhanced OAuth authentication flow
  - 🔗 Deep linking support
  - 🚀 Better wallet integration
  - 🐛 Critical bug fixes
  
  ### Requirements
  - Android 7.0 or later
  - Internet connection
  - Camera & Location permissions
  
  ### Support
  - Website: https://strun.fun
  - Email: info@strun.fun
  ```

- [ ] **Screenshots & Assets kontrol et**
  - Icon (512x512): ✅ Current OK
  - Banner (1200x600): ✅ Current OK
  - Screenshots: ✅ Current OK
  - **Değişiklik**: Yok - geçerli assets kullan

- [ ] **Gözden geçir ve gönder**
  - "Review Changes" butonuna tıkla
  - "Submit Update" ya da "Publish" butonuna tıkla
  - Confirmation bekle

- [ ] **Submission takip et**
  - Status: "Under Review" → "Approved" (3-5 gün)
  - Approval mail: info@strun.fun
  - Sonra live olacak ~24 saat içinde

---

### Phase 4: Verification & Monitoring (⏰ Ongoing)

- [ ] **App Store'da görünür mü kontrol et**
  ```
  https://dapp-store.solana.com/apps/strun
  ```
  - **Expected Status:** Live within 24-48 hours of approval
  - **Check:** Version = 1.2.0
  - **Check:** Rating & Reviews görunüyor mu

- [ ] **Real device testing**
  - Telefonda: Settings → Apps → STRUN
  - Check: Version = 1.2.0
  - Check: Installed from Play Store or side-loaded

- [ ] **Server logs kontrolü**
  - Monitor login successes
  - Check OAuth token errors (if any)
  - Wallet connection logs

---

## 📊 Status Dashboard

```
╔════════════════════════════════════════════════════════════╗
║                  STRUN v1.2.0 Deployment                   ║
╠════════════════════════════════════════════════════════════╣
║ APK Build         ✅ COMPLETE (Dec 9, 2025)               ║
║ Local Testing     ⏳ PENDING (Your Device)                ║
║ GitHub Release    ⏳ TODO                                   ║
║ Solana dApp Store ⏳ TODO (3-5 days)                        ║
║ Public Availability ⏳ TODO (24-48h after approval)        ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **APK Download** | https://expo.dev/accounts/bl10buer/projects/strun-mobile/builds |
| **GitHub Releases** | https://github.com/StrunFunAI/strun-fun/releases |
| **Solana dApp Store** | https://dapp-store.solana.com/publisher/dashboard |
| **STRUN App Store Page** | https://dapp-store.solana.com/apps/strun |
| **Website** | https://strun.fun |
| **Support Email** | info@strun.fun |

---

## ⚠️ Troubleshooting

### APK Installation Fails
```bash
# Clear previous installation
adb uninstall com.strun.mobile

# Reinstall
adb install ~/Downloads/strun-v1.2.0-production.apk

# Check logs
adb logcat | grep STRUN
```

### Google OAuth Not Working
- ✅ Check: Google API credentials configured
- ✅ Check: OAuth redirect URI matches
- ✅ Check: Device has Google Play Services
- ✅ Clear app cache: Settings → Apps → STRUN → Storage → Clear Cache

### Wallet Connection Issues
- ✅ Install Phantom or Solflare app
- ✅ Create/import wallet
- ✅ Ensure devnet is selected (if testing)
- ✅ Check: Mobile Wallet Adapter permission granted

### Solana dApp Store Rejects APK
1. Check rejection reason in console
2. Review: https://docs.solana.com/dapp-publishing
3. Common issues:
   - ❌ Wrong package name (should be `com.strun.mobile`)
   - ❌ Version code too low
   - ❌ Permissions not declared properly
   - ❌ Privacy policy missing

---

## 📞 Support & Documentation

- **Expo EAS Build Docs:** https://docs.expo.dev/build/overview/
- **Solana dApp Publishing:** https://docs.solana.com/dapp-publishing
- **React Native Docs:** https://reactnative.dev/
- **GitHub Actions:** https://github.com/StrunFunAI/strun-fun/actions

---

## ✅ Completion Checklist

- [ ] APK downloaded & tested locally
- [ ] Google OAuth working
- [ ] GitHub Release created (v1.2.0)
- [ ] Solana dApp Store updated
- [ ] Update submitted successfully
- [ ] Approval notification received
- [ ] App live on dApp Store
- [ ] Users can download & install
- [ ] Monitor for errors/feedback

---

**Last Updated:** December 9, 2025
**Next Steps:** Follow Phase 1-4 in order
**Estimated Total Time:** ~30-40 minutes
**Status:** ✅ Ready to Deploy
