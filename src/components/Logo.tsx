/* eslint-disable @next/next/no-img-element */
import { asset } from "@/lib/asset";

type Tone = "dark" | "light";

/**
 * La Turca Trade logosu: LT işareti (brand/la-turca-trade-logo-kaynak.png → scripts/make-logo.py)
 * + "LA TURCA / TRADE" yazısı. Boyut, className'deki font-size ile ölçeklenir (em).
 */
export function Logo({ tone = "dark", className = "", title = "La Turca Trade" }: { tone?: Tone; className?: string; title?: string }) {
  const mark = tone === "dark" ? "/brand/lt-lacivert.png" : "/brand/lt-acik.png";
  const main = tone === "dark" ? "text-navy" : "text-white";
  const sub = tone === "dark" ? "text-copper" : "text-copper-l";
  return (
    <span className={`inline-flex items-center gap-[0.55em] leading-none ${className}`}>
      <img src={asset(mark)} alt={title} width={375} height={229} className="h-[2.55em] w-auto" />
      <span className="flex flex-col" aria-hidden="true">
        <span className={`font-serif text-[1.5em] font-semibold tracking-[0.01em] ${main}`}>LA TURCA</span>
        <span className={`mt-[0.3em] text-[0.62em] font-bold tracking-[0.58em] ${sub}`}>TRADE</span>
      </span>
    </span>
  );
}
