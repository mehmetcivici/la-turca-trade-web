/**
 * Sahne fotoğraflarının açıklayıcı alt metinleri (SEO + erişilebilirlik).
 * Aynı görsel birden çok sayfada kullanılabilir; metin görselin ne gösterdiğini anlatır.
 * Yeni sahne fotoğrafı eklerken buraya da 4 dilde açıklama yazın.
 */
import type { Locale } from "@/i18n/config";

type T = Record<Locale, string>;

const ALTS: Record<string, T> = {
  "/img/star-termos/scene-tea-table.webp": {
    es: "Termos de vidrio Star Termos negro y blanco con aros cobrizos en una mesa de té turco",
    pt: "Garrafas térmicas de vidro Star Termos preta e branca com aros acobreados em uma mesa de chá turco",
    en: "Black and white Star Termos glass vacuum jugs with copper rings on a Turkish tea table",
    tr: "Türk çay sofrasında bakır halkalı siyah ve beyaz Star Termos cam termoslar",
  },
  "/img/star-termos/scene-jugs-stone.webp": {
    es: "Cuatro termos de vidrio Star Termos en tonos pastel sobre piedras, con café y macarons",
    pt: "Quatro garrafas térmicas de vidro Star Termos em tons pastel sobre pedras, com café e macarons",
    en: "Four pastel Star Termos glass vacuum jugs on stones, with coffee and macarons",
    tr: "Taşların üzerinde pastel renkli dört Star Termos cam termos, kahve ve makaronlarla",
  },
  "/img/star-termos/travel-mugs.webp": {
    es: "Vasos térmicos Star Termos de doble pared en azul, con tapa antiderrame",
    pt: "Copos térmicos Star Termos de parede dupla azuis, com tampa antivazamento",
    en: "Blue double-wall Star Termos travel mugs with leak-proof lids",
    tr: "Sızdırmaz kapaklı mavi, çift cidarlı Star Termos termos bardaklar",
  },
  "/img/star-termos/steel-jug.webp": {
    es: "Termo de acero inoxidable Star Termos de la línea HoReCa en una cocina",
    pt: "Garrafa térmica de aço inox Star Termos da linha HoReCa em uma cozinha",
    en: "Star Termos HoReCa stainless steel vacuum jug in a kitchen",
    tr: "Mutfakta Star Termos HoReCa serisi paslanmaz çelik termos",
  },
  "/img/star-termos/lineup.webp": {
    es: "Gama de termos de vidrio Star Termos en rojo, negro, crema, gris y rosa",
    pt: "Linha de garrafas térmicas de vidro Star Termos em vermelho, preto, creme, cinza e rosa",
    en: "Star Termos glass vacuum jug range in red, black, cream, grey and pink",
    tr: "Kırmızı, siyah, krem, gri ve pembe Star Termos cam termos serisi",
  },
  "/img/star-termos/scene-red-jug.webp": {
    es: "Termo de vidrio Star Termos rojo con tapa a presión junto a tazas de té y galletas",
    pt: "Garrafa térmica de vidro Star Termos vermelha com tampa de pressão ao lado de chá e biscoitos",
    en: "Red Star Termos glass vacuum jug with push-button lid next to tea and biscuits",
    tr: "Çay ve kurabiyelerin yanında basmalı kapaklı kırmızı Star Termos cam termos",
  },
  "/img/star-termos/scene-pastel-jugs.webp": {
    es: "Termos de vidrio Star Termos serie Mimoza en amarillo, verde, naranja y rosa",
    pt: "Garrafas térmicas de vidro Star Termos série Mimoza em amarelo, verde, laranja e rosa",
    en: "Star Termos Mimoza series glass vacuum jugs in yellow, green, orange and pink",
    tr: "Sarı, yeşil, turuncu ve pembe Star Termos Mimoza serisi cam termoslar",
  },
  "/img/gastroplast/scene-condiment.webp": {
    es: "Guarnicioneras Gastroplast con tapa abatible y compartimentos para salsas y toppings",
    pt: "Porta-condimentos Gastroplast com tampa basculante e compartimentos para molhos e coberturas",
    en: "Gastroplast condiment holders with flip lids and compartments for sauces and toppings",
    tr: "Sos ve süslemeler için bölmeli, açılır kapaklı Gastroplast sunumluklar",
  },
  "/img/gastroplast/gn-pc-black.webp": {
    es: "Cubetas gastronorm negras de policarbonato Gastroplast con alimentos servidos",
    pt: "Cubas gastronorm pretas de policarbonato Gastroplast com alimentos servidos",
    en: "Gastroplast black polycarbonate gastronorm containers filled with food",
    tr: "Yemek dolu siyah Gastroplast polikarbonat gastronorm küvetler",
  },
  "/img/gastroplast/gn-pc-clear.webp": {
    es: "Cubetas gastronorm transparentes de policarbonato Gastroplast en distintos tamaños GN",
    pt: "Cubas gastronorm transparentes de policarbonato Gastroplast em vários tamanhos GN",
    en: "Clear Gastroplast polycarbonate gastronorm containers in several GN sizes",
    tr: "Farklı GN ölçülerinde şeffaf Gastroplast polikarbonat gastronorm küvetler",
  },
};

const LOGO: T = { es: "Logotipo de {n}", pt: "Logotipo da {n}", en: "{n} logo", tr: "{n} logosu" };

/** Görselin açıklaması; tanımlı değilse verilen yedek metin. */
export function altFor(src: string, locale: Locale, fallback = ""): string {
  return ALTS[src]?.[locale] ?? fallback;
}

/** Marka logosu alt metni: "Logotipo de Star Termos" / "Star Termos logo"… */
export function logoAlt(name: string, locale: Locale): string {
  return LOGO[locale].replace("{n}", name);
}
