# Katalog dönüştürücü

Üreticilerin PDF kataloglarından La Turca Trade sürümlerini üretir:

- Arka kapaktaki üretici iletişim bilgileri kaldırılır. Yerine La Turca Trade (Güney Amerika satış ofisi) bilgileri ve `laturcatrade.com/<dil>/` QR kodu gelir. Bilgiler `content/site.json` dosyasından alınır; telefon ve adres doluysa onlar da yazılır.
- Kapaktaki ve sayfa başlarındaki üretici web adresi `www.laturcatrade.com` olur.
- Sayfalardaki boş köşelere La Turca Trade logosu konur. Fotoğrafla dolu sayfalarda logo beyaz bir plaka üstüne yerleştirilir.
- **es / pt sürümleri çevrilir:**
  - Star Termos: ürün adları, teknik etiketler, ısı değerleri, dipnotlar ve "Hakkımızda" sayfası çevrilir. Ölçü, hacim ve barkod gibi sayılar yeniden yazılmaz. Konteyner satırları yalnızca çarpımı tutuyorsa yeniden yazılır.
  - Gastroplast: katalog Türkçe/İngilizce iki dillidir. Türkçe satırlar hedef dile çevrilir, İngilizce ikizleri kalır. Çeviriler `ceviri/gastro-es.json` ve `ceviri/gastro-pt.json` dosyalarındadır: anahtar özgün satır, değer çeviridir (`null` satıra dokunmaz, `""` satırı siler).

## Çalıştırma (macOS)

```bash
pip install pymupdf segno pillow fonttools
python3 scripts/katalog/star.py      # → kataloglar/star-termos-catalogo-2025-{es,pt,en}.pdf
python3 scripts/katalog/gastro.py    # → kataloglar/gastroplast-catalogo-{es,pt,en}.pdf
```

Star Termos sayfalarının bir kısmı vektör çizimdir. Bu yüzden macOS Vision ile OCR yapılır (`ocr.swift`, ilk çalıştırmada derlenir). Sonuçlar `_cache/` klasöründe tutulur.

## Yeni katalog geldiğinde

1. Özgün PDF'i aynı adla `kataloglar/` içine koyun.
2. Betiği çalıştırın.
   - Gastroplast için çevirisi olmayan Türkçe satırlar ekrana listelenir; bunları `ceviri/gastro-*.json` dosyalarına ekleyin.
   - Star Termos için yeni ifadeler `star.py` içindeki sözlüklere (`TAM`, `ACIKLAMA`, `IFADE`, `MALZEME`) eklenir.
3. Çıktıları sayfa sayfa kontrol edin.
4. `content/site.json` içindeki boyut ve sayfa sayısı bilgilerini güncelleyin.

`scripts/sync-catalogs.mjs` dile göre hazırlanmış sürümler varsa özgün dosyayı yayımlamaz. PDF'ler GitHub Pages'ten sunulur, sunucu paketine girmez; sunucu güncellemesi `catalogs/` altında kalan eski PDF'leri siler.

Yazı tipleri SIL Open Font License ile dağıtılır (`fonts/LICENSE.txt`).
