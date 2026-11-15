/**
 * Alt klasörde yayın (ör. GitHub Pages: /la-turca-trade-web) için yol öneki.
 * cPanel / kendi alan adında boştur. next/link bunu kendisi ekler; düz <a>/<img> için asset() kullanılır.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

export function asset(path: string): string {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
