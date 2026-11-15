/**
 * Ürün verisi. Kaynaklar:
 *  - Star Termos: startermos.com/urunlerimiz ve "Star Termos E-Katalog 2025" (PDF)
 *  - Gastroplast: gastroplast.com ürün sayfaları ve Gastroplast kataloğu (PDF, 2024)
 * Metinlerin çevirileri src/content/dict/* içindeki `products` bölümündedir (anahtar: material/group/cat).
 */

export type StarGroup = "jugs" | "pro" | "go" | "food";
export type StarMaterial = "doubleGlass" | "solidBody" | "steel" | "steel304" | "steelFood";

export interface StarSeries {
  id: string;
  name: string;
  group: StarGroup;
  material: StarMaterial;
  capacity: string;
  image: string;
  /** Sitedeki ek detay (krom bant vb.) — dict.products.detail[id] varsa gösterilir. */
}

export const starSeries: StarSeries[] = [
  { id: "elegant", name: "Elegant", group: "jugs", material: "doubleGlass", capacity: "2 L", image: "/img/star-termos/elegant.webp" },
  { id: "east", name: "East", group: "jugs", material: "doubleGlass", capacity: "1,5 L", image: "/img/star-termos/east.webp" },
  { id: "dinamik", name: "Dinamik", group: "jugs", material: "solidBody", capacity: "1 L · 1,5 L", image: "/img/star-termos/dinamik.webp" },
  { id: "mimoza", name: "Mimoza", group: "jugs", material: "doubleGlass", capacity: "1 L · 1,5 L", image: "/img/star-termos/mimoza.webp" },
  { id: "kastel", name: "Kastel", group: "jugs", material: "solidBody", capacity: "1 L · 1,5 L", image: "/img/star-termos/kastel.webp" },
  { id: "zagana", name: "Zagana", group: "jugs", material: "solidBody", capacity: "1 L · 1,5 L", image: "/img/star-termos/zagana.webp" },
  { id: "morepse", name: "Morepse", group: "jugs", material: "doubleGlass", capacity: "1 L · 1,5 L", image: "/img/star-termos/morepse.webp" },
  { id: "horeca", name: "Horeca", group: "pro", material: "steel", capacity: "1,5 L · 2 L", image: "/img/star-termos/horeca.webp" },
  { id: "camping", name: "Camping", group: "pro", material: "steel", capacity: "8 L", image: "/img/star-termos/camping.webp" },
  { id: "soothe", name: "Soothe", group: "go", material: "steel304", capacity: "350 ml", image: "/img/star-termos/soothe.webp" },
  { id: "locksip", name: "Locksip", group: "go", material: "steel304", capacity: "380 ml", image: "/img/star-termos/locksip.webp" },
  { id: "trailmate", name: "Trailmate", group: "go", material: "steel304", capacity: "500 ml", image: "/img/star-termos/trailmate.webp" },
  { id: "aqua", name: "Aqua", group: "go", material: "steel", capacity: "900 ml", image: "/img/star-termos/aqua.webp" },
  { id: "sport", name: "Sport", group: "go", material: "steel", capacity: "350 ml", image: "/img/star-termos/sport.webp" },
  { id: "thermbox", name: "Thermbox", group: "food", material: "steelFood", capacity: "500 ml", image: "/img/star-termos/thermbox.webp" },
];

export const starGroups: StarGroup[] = ["jugs", "pro", "go", "food"];

/** Star Termos E-Katalog 2025'teki yükleme tablosundan. Kutu: cm. */
export const starLoading = [
  { code: "STM-6166", key: "glass1", perBox: 12, box: "60 × 45 × 25", hc40: 13500, boxes40: 1125 },
  { code: "STM-6165", key: "glass15", perBox: 12, box: "60 × 45 × 32,5", hc40: 9768, boxes40: 814 },
  { code: "TB-6175", key: "foodJar", perBox: 12, box: "23 × 33 × 33,5", hc40: 32496, boxes40: 2708 },
] as const;

export type GastroCat =
  | "gnPc"
  | "gnPp"
  | "storage"
  | "bakery"
  | "buffet"
  | "dispensers"
  | "bar"
  | "transport"
  | "tools";

export interface GastroCategory {
  id: GastroCat;
  image: string;
  /** Gastroplast sitesindeki örnek ürün kodları. */
  codes: string[];
}

export const gastroCategories: GastroCategory[] = [
  { id: "gnPc", image: "/img/gastroplast/gn-pc-clear.webp", codes: ["GNP-1165", "GNP-12100", "GNP-13150"] },
  { id: "gnPp", image: "/img/gastroplast/gn-pp.webp", codes: ["GNPPLM-12", "GSP-12"] },
  { id: "storage", image: "/img/gastroplast/square-storage.webp", codes: ["GIB-01", "GIB-02", "GIB-03"] },
  { id: "bakery", image: "/img/gastroplast/dough-boxes.webp", codes: ["GPHPE-75", "GPHPE-100"] },
  { id: "buffet", image: "/img/gastroplast/dome-covers.webp", codes: [] },
  { id: "dispensers", image: "/img/gastroplast/dispensers.webp", codes: [] },
  { id: "bar", image: "/img/gastroplast/glasses-jugs.webp", codes: ["GC-S01", "GCIB-02", "GSRH-03"] },
  { id: "transport", image: "/img/gastroplast/carry-box.webp", codes: ["G-600"] },
  { id: "tools", image: "/img/gastroplast/scoops.webp", codes: [] },
];

/** Gastroplast GN polikarbonat şeffaf küvet matrisi: kod ve koli içi adet (gastroplast.com). */
export const gnSizes = ["1/1", "1/2", "1/3", "1/4", "1/6", "1/9"] as const;
export const gnDepths = [65, 100, 150, 200] as const;
export const gnPerBox: Record<(typeof gnSizes)[number], (number | null)[]> = {
  "1/1": [12, 12, 6, 6],
  "1/2": [24, 12, 12, 12],
  "1/3": [12, 12, 12, 12],
  "1/4": [12, 12, 12, 12],
  "1/6": [12, 12, 12, 12],
  "1/9": [12, 12, 12, null],
};
export function gnCode(size: string, depth: number) {
  return `GNP-${size.replace("/", "")}${depth}`;
}
