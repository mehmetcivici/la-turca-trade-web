# La Turca Trade — web sitesi

Star Termos ve Gastroplast ürünlerini Güney Amerika'ya satan La Turca Trade'in kurumsal sitesi.
Dört dil (es · pt · en · tr), tamamen statik (cPanel'e zip olarak yüklenir), iletişim formu PHP ile e-posta gönderir.

## Komutlar

```bash
npm install
npm run dev          # http://localhost:3000/es/
npm run build        # out/ klasörü
npm run build:cpanel # dist/la-turca-trade-cpanel.zip → cPanel public_html içine açın
```

`build` önce `kataloglar/` içindeki PDF'leri `public/catalogs/` altına kopyalar ve rota haritasını (`public/img/map/routes-*.svg`) üretir.

## Klasörler

| Yol | İçerik |
| --- | --- |
| `kataloglar/` | **Katalog PDF'leri.** Yeni katalog gelince aynı adla buraya koyun: `star-termos-catalogo-2025.pdf`, `gastroplast-catalogo.pdf`. Sayfa/boyut bilgisi `src/content/site.ts` → `catalogs`. |
| `brand/` | Logo dosyaları (SVG + PNG). `scripts/make-logo.py` ile üretildi; yazılar vektöre çevrilmiştir, font gerekmez. |
| `src/content/dict/` | Tüm metinler: `es.ts` (ana dil), `pt.ts`, `en.ts`, `tr.ts`. Yapı birebir aynıdır. |
| `src/content/site.ts` | E-posta, telefon, WhatsApp, alan adı, katalog listesi. |
| `src/content/products.ts` | Star Termos serileri, yükleme tablosu, Gastroplast grupları, GN küvet matrisi. |
| `src/content/routes.ts` | Harita rotaları ve limanlar. |
| `public/contact.php` | Form işleyicisi (alıcı adresini dosyanın başında değiştirin). |
| `cpanel/.htaccess` | HTTPS, kök adreste tarayıcı diline göre yönlendirme, önbellek. |
| `_indirilen/` | Üretici sitelerinden indirilen ham görseller ve PDF'ler (yayına girmez). |

## Sayfalar ve adresler

| Sayfa | es | pt | en | tr |
| --- | --- | --- | --- | --- |
| Ana sayfa | `/es/` | `/pt/` | `/en/` | `/tr/` |
| Star Termos | `/es/star-termos/` | `/pt/star-termos/` | `/en/star-termos/` | `/tr/star-termos/` |
| Gastroplast | `/es/gastroplast/` | … | … | … |
| Distribütörler | `/es/distribuidores/` | `/pt/distribuidores/` | `/en/distributors/` | `/tr/distributorler/` |
| Özel marka | `/es/marca-propia/` | `/pt/marca-propria/` | `/en/private-label/` | `/tr/ozel-marka/` |
| Kataloglar | `/es/catalogos/` | `/pt/catalogos/` | `/en/catalogs/` | `/tr/kataloglar/` |
| Hakkımızda | `/es/nosotros/` | `/pt/sobre-nos/` | `/en/about/` | `/tr/hakkimizda/` |
| İletişim | `/es/contacto/` | `/pt/contato/` | `/en/contact/` | `/tr/iletisim/` |

## SEO

- Her sayfada dile özel başlık/açıklama, `canonical`, `hreflang` (es, pt-BR, en, tr, x-default → es), Open Graph.
- `sitemap.xml` hreflang alternatifleriyle, `robots.txt`.
- JSON-LD: Organization (areaServed: Güney Amerika ülkeleri, brand: Star Termos + Gastroplast), WebSite, BreadcrumbList, FAQPage (Star Termos ve Distribütörler), ItemList (seriler/kategoriler).
- Yayından sonra: Google Search Console'a alan adını ekleyip `sitemap.xml` gönderin.

## Kaynaklar (sitedeki bilgiler nereden geldi)

- **Star Termos:** startermos.com (Hakkımızda, Ürünlerimiz, SSS, sertifika PDF'leri) ve *Star Termos E-Katalog 2025*.
  30 yıl sektör / 12 yıl termos üretimi, 19 ihracat ülkesi, ISO 9001·14001·22000·45001 (ASCERT), Sedex, OEM/ODM,
  12 saat sıcak / 24 saat soğuk, 2 yıl garanti. Yükleme verileri (STM-6166, STM-6165, TB-6175) katalogdan.
- **Gastroplast:** gastroplast.com (ürün kodları, koli adetleri, sertifikalar, test sonuçları, fuarlar) ve Gastroplast kataloğu.
  SürPlast 2015'te kuruldu, 55+ ülkeye ihracat, kalıp kendi bünyesinde, GN küvetler NSF listeli, PC-1100 FDA/AB testleri, Budapeşte şubesi.
- Fotoğraflar üreticilerin kendi sitelerinden ve kataloglarından alınmıştır.

## Bekleyenler (La Turca Trade'den)

1. **Alan adı** — varsayım `laturcatrade.com`. Farklıysa `src/content/site.ts` → `url` ve `public/contact.php`.
2. **E-posta** — varsayım `info@laturcatrade.com`. cPanel'de hesabı açın; `contact.php` içindeki `ALICI`/`GONDEREN`'i güncelleyin.
3. **Telefon / WhatsApp / LinkedIn / Instagram** — `site.ts`'de boş; doldurulunca sitede kendiliğinden görünür.
4. **Ofis adresi ve çalışma saatleri** — şimdilik yalnızca "İstanbul, Türkiye" ve 09.00–18.00 (İstanbul saati) yazıyor.
5. **Üreticilerin onayı** — fotoğrafların/katalogların kullanımı ve "Güney Amerika satış ofisi" ifadesi için Star Termos ve Gastroplast'tan yazılı onay almanız önerilir.
6. **Taahhütler** — "bir iş günü içinde yanıt", "her yüklemenin fotoğrafı", "ilk sipariş için 20' karışık konteyner", ödeme koşulları: size uygun olduğundan emin olun (`dict/*.ts` → `about.commits`, `dist.terms`).
7. **Gastroplast özel marka** — sitede "ürüne ve adede göre değerlendirilir" diye geçiyor; kesinleşirse metni güçlendirin.
8. Kendi fotoğraflarınız (ofis, fabrika ziyareti, yükleme) gelirse "Hakkımızda" sayfasına eklenir — siteyi en çok güçlendirecek şey budur.

## Logo ve kimlik

- **Logo:** LT işareti — Türkiye ve Güney Amerika haritalarını bağlayan altın ok. Kaynak dosya laturcatrade.com'daki şeffaf PNG:
  `brand/la-turca-trade-logo-kaynak.png`. `python3 -I scripts/make-logo.py` bundan şunları üretir:
  `lt-lacivert.png` (açık zemin), `lt-acik.png` (koyu zemin), favicon (`src/app/icon.png`, `apple-icon.png`).
  Daha yüksek çözünürlüklü/vektör logo gelirse kaynak dosyayı değiştirip betiği yeniden çalıştırın.
- **Renkler (logodan):** lacivert `#263658`, altın `#C49E58`, metin vurgusu koyu altın `#8E6A28`, açık zemin `#F4F1EA`.
- **Yazı tipleri:** başlıklar **Besley** (laturcatrade.com ile aynı), metin **Manrope**.
- Eski ibrik logo denemesi `brand/_eski-ibrik/`, logo/yazı tipi seçenek sayfaları `brand/secenekler/` altında.
