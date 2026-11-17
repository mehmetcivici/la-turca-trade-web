/**
 * Yol yardımcıları.
 * - BASE_PATH: alt klasörde yayın (GitHub Pages önizlemesi: /la-turca-trade-web). next/link bunu kendisi ekler.
 * - ASSET_CDN: görseller, logolar ve PDF kataloglar için CDN kökü (Hostinger derlemesinde jsDelivr, görsellerin son
 *   değiştiği commit'e sabit → değişmez, uzun süre önbellekte). Paylaşımlı sunucunun yükünü alır.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";
export const ASSET_CDN = (process.env.NEXT_PUBLIC_ASSET_CDN || "").replace(/\/$/, "");

const CDN_PATHS = /^\/(img|brand|catalogs)\//;

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  if (ASSET_CDN && CDN_PATHS.test(path)) return ASSET_CDN + path;
  return `${BASE_PATH}${path}`;
}
