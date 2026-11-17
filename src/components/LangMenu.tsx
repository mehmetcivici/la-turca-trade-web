"use client";

import { usePathname } from "next/navigation";
import { asset, BASE_PATH } from "@/lib/asset";
import { locales, localeNames, href, parsePath, type Locale } from "@/i18n/config";

/** Aynı sayfanın diğer dillerdeki karşılığına bağlantı verir. */
export function LangMenu({ locale, label, tone = "dark", compact = false }: { locale: Locale; label: string; tone?: "dark" | "light"; compact?: boolean }) {
  const pathname = usePathname() || `/${locale}/`;
  const parsed = parsePath(pathname.replace(BASE_PATH, "") || "/");
  const key = parsed?.key ?? "home";
  if (compact) {
    return (
      <details className="group relative">
        <summary aria-label={label} className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-bold uppercase text-ink hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
          {locale}
          <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </summary>
        <ul className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-md border border-line bg-paper py-1 shadow-lg">
          {locales.map((l) => (
            <li key={l}>
              <a href={asset(href(l, key))} onClick={() => { try { localStorage.setItem("ltt-lang-ok", "1"); } catch {} }} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className={"flex items-center justify-between px-4 py-2 text-[0.95rem] hover:bg-paper-2 " + (l === locale ? "font-bold text-navy" : "text-ink")}>
                {localeNames[l]}
                <span className="text-xs uppercase text-muted">{l}</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  }
  return (
    <nav aria-label={label} className="flex items-center gap-1 text-sm">
      {locales.map((l) => (
        <a
          key={l}
          href={asset(href(l, key))}
          onClick={() => { try { localStorage.setItem("ltt-lang-ok", "1"); } catch {} }}
          hrefLang={l}
          lang={l}
          title={localeNames[l]}
          aria-current={l === locale ? "true" : undefined}
          className={
            "px-1.5 py-1 uppercase tracking-wide transition-colors " +
            (l === locale
              ? tone === "dark"
                ? "text-ink font-semibold"
                : "text-paper font-semibold"
              : tone === "dark"
                ? "text-muted hover:text-copper"
                : "text-paper/60 hover:text-paper")
          }
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
