/* eslint-disable @next/next/no-img-element */
import data from "./logo-data.json";
import { asset } from "@/lib/asset";

type Tone = "dark" | "light";

/**
 * Logo dosyaları scripts/make-logo.py ile üretilir (brand/ → public/brand/).
 * HTML'i şişirmemek için satır içi SVG yerine önbelleğe alınan dosya kullanılır.
 */
export function Logo({ tone = "dark", className, title = "La Turca Trade" }: { tone?: Tone; className?: string; title?: string }) {
  const src = tone === "dark" ? "/brand/la-turca-trade-logo.svg" : "/brand/la-turca-trade-logo-beyaz.svg";
  return <img src={asset(src)} alt={title} width={data.w} height={data.h} className={className} decoding="async" />;
}

export function LogoSymbol({ className }: { tone?: Tone; className?: string }) {
  return <img src={asset("/brand/la-turca-trade-sembol-acik.svg")} alt="" width={120} height={120} className={className} decoding="async" />;
}
