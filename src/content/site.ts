/**
 * Şirket bilgileri ve katalog listesi content/site.json dosyasındadır (yönetim panelinden düzenlenir).
 * Boş bırakılan iletişim alanları sitede gösterilmez.
 */
import data from "../../content/site.json";

export interface Catalog {
  id: string;
  brand: string;
  /** İngilizce (ve Türkçe sayfalar için) dosya; fileEs / filePt boşsa her dilde bu kullanılır. */
  file: string;
  fileEs?: string;
  filePt?: string;
  sizeMbEs?: number;
  sizeMbPt?: number;
  langEs?: string;
  langPt?: string;
  cover: string;
  coverW: number;
  coverH: number;
  pages: number;
  sizeMb: number;
  year: number;
  lang: string;
}

const { catalogs: rawCatalogs, ...rest } = data;

export const site = rest as {
  name: string;
  url: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  whatsapp: string;
  linkedin: string;
  instagram: string;
  city: string;
  country: string;
  formEndpoint: string;
  areaServed: string[];
  googleVerification: string;
};

export const catalogs = rawCatalogs as Catalog[];

/** Sayfanın diline uygun katalog dosyası: es → İspanyolca, pt → Portekizce, en / tr → İngilizce. */
export function catalogFor(c: Catalog, locale: string): { file: string; sizeMb: number; lang: string } {
  if (locale === "es" && c.fileEs) return { file: c.fileEs, sizeMb: c.sizeMbEs ?? c.sizeMb, lang: c.langEs || c.lang };
  if (locale === "pt" && c.filePt) return { file: c.filePt, sizeMb: c.sizeMbPt ?? c.sizeMb, lang: c.langPt || c.lang };
  return { file: c.file, sizeMb: c.sizeMb, lang: c.lang };
}

/**
 * Temsil edilen üreticiler. Sitede üreticilerin kendi web sitelerine, adreslerine veya iletişim bilgilerine
 * bağlantı verilmez (kullanıcı kararı, 20 Kas 2026): alıcı her zaman La Turca Trade üzerinden ilerler.
 */
export const manufacturers = {
  starTermos: { name: "Star Termos", page: "starTermos" as const },
  gastroplast: { name: "Gastroplast", page: "gastroplast" as const },
};
