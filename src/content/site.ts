/**
 * Şirket bilgileri ve katalog listesi content/site.json dosyasındadır (yönetim panelinden düzenlenir).
 * Boş bırakılan iletişim alanları sitede gösterilmez.
 */
import data from "../../content/site.json";

export interface Catalog {
  id: string;
  brand: string;
  file: string;
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
