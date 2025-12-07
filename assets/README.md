# 🎨 Assets Klasörü

Bu klasör, STRUN mobil uygulamasının görsel varlıklarını içerir.

## Gerekli Dosyalar

Uygulamayı çalıştırmak için aşağıdaki dosyaları oluşturmanız gerekiyor:

### 1. icon.png
- **Boyut**: 1024x1024 px
- **Format**: PNG
- **Açıklama**: Uygulama ikonu
- **Önerilen**: Mor-pembe gradient arka plan, STRUN logosu

### 2. splash.png
- **Boyut**: 1242x2436 px (iPhone X/XS)
- **Format**: PNG
- **Açıklama**: Açılış ekranı
- **Arka plan rengi**: #111827 (dark)
- **Önerilen**: Merkezde STRUN logosu

### 3. adaptive-icon.png (Android)
- **Boyut**: 1024x1024 px
- **Format**: PNG
- **Açıklama**: Android adaptive icon
- **Not**: Sadece logo, arka plan adaptive-icon backgroundColor'dan gelir

### 4. favicon.png (Web)
- **Boyut**: 48x48 px
- **Format**: PNG
- **Açıklama**: Web favicon

## Hızlı Placeholder Oluşturma

Geliştirme için hızlıca başlamak istiyorsanız:

```bash
# macOS/Linux
cd assets
# Her dosya için boş 1024x1024 PNG oluştur
convert -size 1024x1024 xc:"#8B5CF6" icon.png
convert -size 1242x2436 xc:"#111827" splash.png
convert -size 1024x1024 xc:"#8B5CF6" adaptive-icon.png
convert -size 48x48 xc:"#8B5CF6" favicon.png
```

Ya da online araçlar kullanın:
- [Figma](https://figma.com)
- [Canva](https://canva.com)
- [Photopea](https://photopea.com)

## Logo Tasarım Önerileri

- **Ana renk**: #8B5CF6 (Mor)
- **Accent**: #EC4899 (Pembe)
- **Stil**: Modern, minimal, dinamik
- **İkonografi**: Koşu figürü + lokasyon pin + yıldız kombinasyonu
- **Tipografi**: Bold, sans-serif

## Örnek Tasarım

```
┌────────────────────┐
│                    │
│    🏃  📍  ⭐     │
│                    │
│      STRUN         │
│                    │
└────────────────────┘
```

---

**Not**: Production build öncesi profesyonel bir tasarımcıdan logo tasarlatmanız önerilir.
