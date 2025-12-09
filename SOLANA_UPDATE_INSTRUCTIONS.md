# Solana dApp Store - Update v1.2.0 Instructions

## 📋 Update Summary
- **Previous Version:** 1.2.0 (versionCode 13)
- **New Version:** 1.2.0 (versionCode 14)
- **Build Date:** December 9, 2025
- **Changes:** Enhanced OAuth, domain linking, improved wallet support

---

## 🔄 Submission Update Steps

### 1. **Log into Solana dApp Store Developer Console**
```
https://dapp-store.solana.com/publisher/dashboard
Email: info@strun.fun
```

### 2. **Navigate to STRUN App**
- Go to **"My Apps"** → **"STRUN"**
- Click **"Edit App"** or **"Manage Releases"**

### 3. **Update APK**
- Download latest APK from: 
  ```
  https://expo.dev/accounts/bl10buer/projects/strun-mobile/builds
  ```
- In dApp Store: Click **"Upload New APK"**
- Select the new `strun-v1.2.0.apk` file
- Version Code will auto-update to **14**

### 4. **Update Release Notes**
```markdown
## v1.2.0 - Enhanced Integration
- ✨ Improved Google OAuth authentication
- 🔗 Deep linking for Solana dApp Store
- 🔌 Better wallet adapter support
- 🐛 Bug fixes and performance improvements

**Requirements:**
- Android 7.0+ (API 24)
- 80MB free storage
- Camera & Location permissions

**New Features:**
- Seamless OAuth login flow
- Improved transaction speed
- Enhanced error messages
```

### 5. **Update Screenshots & Assets** (if changed)
- Icon: ✅ No change needed (512x512px)
- Banner: ✅ Current banner OK
- Screenshots: Optional update

### 6. **Review & Submit**
- Click **"Save Changes"**
- Review submission summary
- Click **"Submit for Review"** or **"Update Live"**

---

## ✅ Verification Checklist

After update submission, verify:

```bash
# 1. Check APK details
aapt dump badging strun-v1.2.0.apk | grep versionCode

# 2. Verify package name
# Expected: package: name='com.strun.mobile'

# 3. Check permissions
aapt dump permissions strun-v1.2.0.apk

# 4. Validate signature
keytool -printcert -jarfile strun-v1.2.0.apk
```

---

## 📱 Testing Before Submission

1. **Install on test device:**
   ```bash
   adb install -r strun-v1.2.0.apk
   ```

2. **Test core flows:**
   - ✅ Google Login with OAuth
   - ✅ Wallet connection (Phantom, Solflare)
   - ✅ Task creation & submission
   - ✅ Location verification
   - ✅ Proof upload
   - ✅ Solana transactions

3. **Check logs for errors:**
   ```bash
   adb logcat | grep STRUN
   ```

---

## 🚀 Expected Timeline

- **Submission:** Immediate
- **Review:** 3-5 business days
- **Approval:** Auto-published to Solana Mobile dApp Store
- **User Availability:** ~24 hours after approval

---

## 📞 Support

If update is rejected:
1. Check rejection reason in dApp Store console
2. Review: https://docs.solana.com/dapp-publishing
3. Contact: support@solana.com (with app ID)

---

## 🔗 Important Links

- **App on dApp Store:** https://dapp-store.solana.com/apps/strun
- **GitHub Release:** https://github.com/StrunFunAI/strun-fun/releases/tag/v1.2.0
- **APK Download:** https://expo.dev/accounts/bl10buer/projects/strun-mobile/builds
- **Privacy Policy:** https://strunfunai.github.io/strun-fun/privacy-policy.html
- **Terms:** https://strunfunai.github.io/strun-fun/terms.html

---

## 📊 Version History

| Version | Code | Date | Status | Notes |
|---------|------|------|--------|-------|
| 1.2.0 | 14 | Dec 9, 2025 | Ready for Update | Enhanced OAuth |
| 1.2.0 | 13 | Dec 8, 2025 | Live | Initial submission |
| 1.1.0 | 12 | Dec 1, 2025 | Archived | Earlier version |

---

**Last Updated:** December 9, 2025
**By:** STRUN Dev Team
**Status:** ✅ Ready for Submission
