/**
 * Ürün verisi content/products.json dosyasındadır (yönetim panelinden düzenlenir).
 * Kaynaklar: startermos.com + Star Termos E-Katalog 2025; gastroplast.com + Gastroplast kataloğu.
 */
import data from "../../content/products.json";
import type { Locale } from "@/i18n/config";

export type I18n = Record<Locale, string>;
export type StarGroup = "jugs" | "pro" | "go" | "food";
export type StarMaterial = "doubleGlass" | "solidBody" | "steel" | "steel304" | "steelFood";

export interface StarSeries {
  id: string;
  name: string;
  group: StarGroup;
  material: StarMaterial;
  capacity: string;
  image: string;
  detail?: Partial<I18n>;
  featured?: boolean;
}

export interface LoadingRow {
  code: string;
  label: I18n;
  perBox: number;
  box: string;
  boxes40: number;
  hc40: number;
}

export interface GastroCategory {
  id: string;
  image: string;
  codes: string[];
  title: I18n;
  desc: I18n;
  featured?: boolean;
}

export const starSeries = data.starSeries as StarSeries[];
export const starGroups: StarGroup[] = ["jugs", "pro", "go", "food"];
export const starLoading = data.starLoading as LoadingRow[];
export const gastroCategories = data.gastroCategories as GastroCategory[];

/** Gastroplast GN polikarbonat şeffaf küvet matrisi: koli içi adet (gastroplast.com). */
export const gnSizes = ["1/1", "1/2", "1/3", "1/4", "1/6", "1/9"] as const;
export const gnDepths = [65, 100, 150, 200] as const;
export const gnPerBox = data.gnPerBox as Record<(typeof gnSizes)[number], (number | null)[]>;
export function gnCode(size: string, depth: number) {
  return `GNP-${size.replace("/", "")}${depth}`;
}

export function tx(v: Partial<I18n> | undefined, locale: Locale): string {
  return (v && (v[locale] || v.es)) || "";
}
