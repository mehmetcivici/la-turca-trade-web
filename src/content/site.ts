/**
 * Şirket bilgileri. Boş bırakılan alanlar sitede gösterilmez.
 * BEKLEYEN: alan adı, e-posta, telefon/WhatsApp, LinkedIn — README "Bekleyenler".
 */
export const site = {
  name: "La Turca Trade",
  /** Yayın adresi (sonda / yok). Sitemap, canonical ve hreflang bu adresten üretilir. */
  url: "https://laturcatrade.com",
  email: "info@laturcatrade.com",
  /** Uluslararası biçimde, örn. "+90 532 000 00 00". Boşsa gösterilmez. */
  phone: "",
  /** Yalnızca rakam, ülke koduyla, örn. "905320000000". Boşsa WhatsApp düğmesi çıkmaz. */
  whatsapp: "",
  linkedin: "",
  instagram: "",
  city: "İstanbul",
  country: "Türkiye",
  /** cPanel'deki PHP form işleyicisi (public/contact.php). */
  formEndpoint: "/contact.php",
  /** Hizmet verilen ülkeler (ISO 3166-1 alpha-2) — JSON-LD areaServed. */
  areaServed: ["AR", "BO", "BR", "CL", "CO", "EC", "PY", "PE", "UY", "VE"],
};

export const manufacturers = {
  starTermos: {
    name: "Star Termos",
    web: "https://startermos.com",
    legal: "Mehmet Dinçok Yıldız Çelik",
    address: "Akçaburgaz, Esenyurt, İstanbul",
  },
  gastroplast: {
    name: "Gastroplast",
    web: "https://www.gastroplast.com",
    legal: "SürPlast Plastik San. ve Dış Tic. Ltd. Şti.",
    address: "Kıraç, Esenyurt, İstanbul",
  },
};

export const catalogs = [
  {
    id: "star-termos",
    brand: "Star Termos",
    file: "/catalogs/star-termos-catalogo-2025.pdf",
    cover: "/img/catalogs/star-termos-cover.webp",
    coverW: 900,
    coverH: 679,
    pages: 41,
    sizeMb: 4.6,
    year: 2025,
    lang: "EN",
  },
  {
    id: "gastroplast",
    brand: "Gastroplast",
    file: "/catalogs/gastroplast-catalogo.pdf",
    cover: "/img/catalogs/gastroplast-cover.webp",
    coverW: 700,
    coverH: 990,
    pages: 148,
    sizeMb: 20.4,
    year: 2024,
    lang: "EN · TR",
  },
] as const;
