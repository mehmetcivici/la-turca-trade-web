"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { locales, href, parsePath, type Locale } from "@/i18n/config";
import { BASE_PATH } from "@/lib/asset";

const TEXT: Record<Locale, { msg: string; go: string }> = {
  es: { msg: "Este sitio también está en español", go: "Ver en español" },
  pt: { msg: "Este site também está em português", go: "Ver em português" },
  en: { msg: "This site is also available in English", go: "View in English" },
  tr: { msg: "Bu site Türkçe olarak da mevcut", go: "Türkçe görüntüle" },
};
const KEY = "ltt-lang-ok";

/** Tarayıcı dili sayfanın dilinden farklıysa küçük bir öneri gösterir (yönlendirmez). */
export function LangSuggest({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const [target, setTarget] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => (l || "").slice(0, 2).toLowerCase());
    const pick = langs.find((l) => (locales as readonly string[]).includes(l)) as Locale | undefined;
    if (pick && pick !== locale) setTarget(pick);
  }, [locale]);

  if (!target) return null;
  const key = parsePath(pathname.replace(BASE_PATH, "") || "/")?.key ?? "home";
  const remember = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
  };
  return (
    <div lang={target} className="bg-navy-2 text-white">
      <div className="wrap flex items-center justify-between gap-4 py-2 text-[0.9rem]">
        <span>{TEXT[target].msg}</span>
        <span className="flex items-center gap-3">
          <a href={`${BASE_PATH}${href(target, key)}`} onClick={remember} className="font-bold text-copper-l underline-offset-4 hover:underline">
            {TEXT[target].go} →
          </a>
          <button type="button" aria-label="×" onClick={() => { remember(); setTarget(null); }} className="px-1 text-white/60 hover:text-white">
            ✕
          </button>
        </span>
      </div>
    </div>
  );
}
