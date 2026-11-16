<?php
/** İçerik düzenleyici için Türkçe etiketler ve alan kuralları. */
declare(strict_types=1);

const ICERIK_DOSYALARI = [
    'metin-tr' => ['path' => 'content/dict/tr.json', 'title' => 'Site metinleri', 'lang' => 'tr', 'ref' => 'content/dict/es.json', 'refLang' => 'ES'],
    'metin-es' => ['path' => 'content/dict/es.json', 'title' => 'Site metinleri', 'lang' => 'es', 'ref' => 'content/dict/tr.json', 'refLang' => 'TR'],
    'metin-pt' => ['path' => 'content/dict/pt.json', 'title' => 'Site metinleri', 'lang' => 'pt', 'ref' => 'content/dict/tr.json', 'refLang' => 'TR'],
    'metin-en' => ['path' => 'content/dict/en.json', 'title' => 'Site metinleri', 'lang' => 'en', 'ref' => 'content/dict/tr.json', 'refLang' => 'TR'],
    'urunler' => ['path' => 'content/products.json', 'title' => 'Ürünler', 'active' => 'urunler'],
    'kataloglar' => ['path' => 'content/site.json', 'title' => 'Kataloglar', 'only' => ['catalogs'], 'active' => 'kataloglar'],
    'iletisim' => ['path' => 'content/site.json', 'title' => 'İletişim bilgileri', 'only' => ['email', 'phone', 'whatsapp', 'linkedin', 'instagram', 'city', 'country'], 'active' => 'iletisim'],
];

function editor_hints(): array
{
    $labels = [
        // Bölümler (metinler)
        'meta' => 'Genel SEO açıklaması', 'nav' => 'Menü adları', 'common' => 'Ortak ifadeler (düğmeler vb.)', 'footer' => 'Alt bilgi',
        'home' => 'Ana sayfa', 'star' => 'Star Termos sayfası', 'gastro' => 'Gastroplast sayfası', 'dist' => 'Distribütörler sayfası',
        'pl' => 'Özel marka sayfası', 'cat' => 'Kataloglar sayfası', 'about' => 'Hakkımızda sayfası', 'contact' => 'İletişim sayfası',
        'form' => 'İletişim formu', 'countries' => 'Ülke adları', 'products' => 'Ürün grubu ve malzeme adları', 'notFound' => '404 (bulunamadı) sayfası',
        'langPage' => 'Dil seçim sayfası',
        // Sık alanlar
        'title' => 'Başlık (Google\'da görünen)', 'description' => 'Açıklama (Google\'da görünen)', 'siteDescription' => 'Site açıklaması',
        'h1' => 'Sayfa başlığı', 'sub' => 'Alt başlık', 'lead' => 'Giriş metni', 'kicker' => 'Üst etiket', 'intro' => 'Tanıtım paragrafları',
        'hero' => 'Açılış bölümü', 'caption' => 'Fotoğraf açıklaması', 'facts' => 'Rakamlar / öne çıkanlar', 'v' => 'Değer', 'l' => 'Açıklama',
        't' => 'Başlık', 'd' => 'Açıklama', 'q' => 'Soru', 'a' => 'Cevap', 'items' => 'Maddeler', 'steps' => 'Adımlar', 'faq' => 'Sık sorulan sorular',
        'link' => 'Bağlantı yazısı', 'cta' => 'Teklif bandı', 'makers' => 'Üreticiler bölümü', 'starLine' => 'Star Termos ürünleri bölümü',
        'gastroLine' => 'Gastroplast ürünleri bölümü', 'container' => 'Konteyner bölümü', 'tableTitle' => 'Tablo başlığı', 'note' => 'Not',
        'figure' => 'Çizim açıklaması', 'routes' => 'Rota haritası bölümü', 'atlantic' => 'Atlantik başlığı', 'pacific' => 'Pasifik başlığı',
        'origin' => 'Çıkış limanı', 'mapAlt' => 'Harita açıklaması', 'catalogs' => 'Kataloglar', 'how' => 'Nasıl çalışıyoruz bölümü',
        'seriesTitle' => 'Seriler başlığı', 'loadingTitle' => 'Yükleme verileri başlığı', 'loadingLead' => 'Yükleme verileri açıklaması',
        'certTitle' => 'Belgeler başlığı', 'certs' => 'Belgeler', 'certNote' => 'Belgeler notu', 'faqTitle' => 'SSS başlığı',
        'catsTitle' => 'Ürün grupları başlığı', 'gnTitle' => 'GN tablosu başlığı', 'gnLead' => 'GN tablosu açıklaması', 'gnDepth' => 'Derinlik yazısı',
        'gnSize' => 'Ölçü yazısı', 'gnNote' => 'GN tablosu notu', 'fairsTitle' => 'Fuarlar başlığı', 'fairs' => 'Fuarlar', 'brands' => 'Markalar notu',
        'whoTitle' => 'Kimlerle çalışıyoruz başlığı', 'who' => 'Kimlerle çalışıyoruz', 'stepsTitle' => 'Adımlar başlığı', 'termsTitle' => 'Koşullar başlığı',
        'terms' => 'Ticari koşullar', 'whatTitle' => 'Kişiselleştirme başlığı', 'what' => 'Kişiselleştirilebilenler', 'gastroNote' => 'Gastroplast notu',
        'mock' => 'Kutu çizimindeki marka yazısı', 'langLabel' => 'Katalog dili yazısı', 'yearLabel' => 'Baskı yazısı', 'priceTitle' => 'Fiyat başlığı',
        'priceLead' => 'Fiyat açıklaması', 'body' => 'Paragraflar', 'commitTitle' => 'Taahhütler başlığı', 'commits' => 'Taahhütler',
        'whyTitle' => 'Neden Türkiye başlığı', 'why' => 'Neden Türkiye paragrafları', 'direct' => 'Doğrudan iletişim yazısı', 'office' => 'Ofis yazısı',
        'hours' => 'Çalışma saatleri', 'blurb' => 'Kısa tanıtım', 'brandsNote' => 'Marka notu', 'rights' => 'Haklar yazısı', 'write' => '"Bize yazın" yazısı',
        'pages' => 'Sayfa sayısı', 'groups' => 'Ürün grupları', 'materials' => 'Malzeme adları', 'back' => 'Geri dön yazısı',
        'types' => 'Firma türü seçenekleri', 'interests' => 'İlgi seçenekleri', 'messagePlaceholder' => 'Mesaj kutusu ipucu', 'consent' => 'Onay metni',
        'send' => 'Gönder düğmesi', 'sending' => 'Gönderiliyor yazısı', 'ok' => 'Başarılı mesajı', 'error' => 'Hata mesajı', 'required' => 'Zorunlu yazısı',
        'countryPlaceholder' => 'Ülke seçin yazısı', 'otherCountry' => 'Diğer ülke yazısı',
        // Ürünler
        'starSeries' => 'Star Termos serileri', 'starLoading' => 'Konteyner yükleme tablosu', 'gastroCategories' => 'Gastroplast ürün grupları',
        'gnPerBox' => 'GN küvet koli adetleri (65 / 100 / 150 / 200 mm)', 'id' => 'Kısa kimlik', 'name' => 'Ad', 'group' => 'Grup', 'material' => 'Malzeme',
        'capacity' => 'Hacim', 'image' => 'Fotoğraf', 'detail' => 'Ek bilgi', 'featured' => 'Ana sayfada göster', 'code' => 'Ürün kodu', 'label' => 'Ürün adı',
        'perBox' => 'Koli içi adet', 'box' => 'Koli ölçüsü (cm)', 'boxes40' => '40\' HC koli sayısı', 'hc40' => '40\' HC toplam adet', 'codes' => 'Örnek kodlar',
        // Site
        'email' => 'E-posta', 'phone' => 'Telefon', 'whatsapp' => 'WhatsApp numarası', 'linkedin' => 'LinkedIn adresi', 'instagram' => 'Instagram adresi',
        'city' => 'Şehir', 'country' => 'Ülke', 'brand' => 'Marka', 'file' => 'PDF dosyası', 'cover' => 'Kapak görseli', 'coverW' => 'Kapak genişliği (px)',
        'coverH' => 'Kapak yüksekliği (px)', 'sizeMb' => 'Dosya boyutu (MB)', 'year' => 'Baskı yılı', 'lang' => 'Katalog dili',
    ];
    // Yola özel etiketler
    $pathLabels = [
        'home.star' => 'Star Termos kartı', 'home.gastro' => 'Gastroplast kartı', 'home.pl' => 'Özel marka bölümü', 'home.catalogs' => 'Kataloglar bölümü',
        'nav.starTermos' => 'Star Termos', 'nav.gastroplast' => 'Gastroplast', 'nav.distributors' => 'Distribütörler', 'nav.privateLabel' => 'Özel marka',
        'nav.catalogs' => 'Kataloglar', 'nav.about' => 'Hakkımızda', 'nav.contact' => 'İletişim',
        'form.name' => 'Ad soyad', 'form.company' => 'Firma', 'form.country' => 'Ülke', 'form.email' => 'E-posta', 'form.phone' => 'Telefon',
        'form.type' => 'Firma türü', 'form.interest' => 'İlgi', 'form.message' => 'Mesaj',
        'contact.title' => 'Başlık (Google\'da görünen)', 'contact.h1' => 'Sayfa başlığı',
    ];
    $help = [
        'whatsapp' => 'Yalnızca rakam, ülke koduyla. Örn. 905321234567. Boş bırakılırsa sitede görünmez.',
        'phone' => 'Uluslararası biçimde. Örn. +90 532 123 45 67. Boş bırakılırsa görünmez.',
        'email' => 'Sitede görünen e-posta adresi.',
        'id' => 'Sistem kimliği; küçük harf, boşluksuz. Mevcut kayıtlarda değiştirmeyin.',
        'featured' => 'İşaretliyse ana sayfadaki seçkide görünür.',
        'title' => 'Google sonuçlarında ve tarayıcı sekmesinde görünür. 60 karakter civarı ideal.',
        'description' => 'Google sonuçlarında başlığın altında görünür. 150–160 karakter ideal.',
        'image' => 'JPG, PNG veya WebP. Sunucu otomatik küçültür.',
        'file' => 'PDF yükleyin; boyut ve sayfa sayısı otomatik doldurulur.',
    ];
    $enums = [
        'starSeries.*.group' => [['jugs', 'Cam termos sürahiler'], ['pro', 'HoReCa ve kamp'], ['go', 'Termos bardak ve matara'], ['food', 'Yemek termosları']],
        'starSeries.*.material' => [['doubleGlass', 'Çift cam vakum ampul'], ['solidBody', 'Güçlendirilmiş gövde, çift cam'], ['steel', 'Çift cidarlı paslanmaz çelik'], ['steel304', '304 paslanmaz çelik, sızdırmaz kapak'], ['steelFood', 'Gıdaya uygun paslanmaz çelik']],
    ];
    $files = ['image' => 'image', 'cover' => 'image', 'file' => 'pdf'];
    return compact('labels', 'pathLabels', 'help', 'enums', 'files');
}
