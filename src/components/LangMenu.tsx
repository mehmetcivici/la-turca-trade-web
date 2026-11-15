"use client";

import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";
import { locales, localeNames, href, parsePath, type Locale } from "@/i18n/config";

/** Aynı sayfanın diğer dillerdeki karşılığına bağlantı verir. */
export function LangMenu({ locale, label, tone = "dark" }: { locale: Locale; label: string; tone?: "dark" | "light" }) {
  const pathname = usePathname() || `/${locale}/`;
  const parsed = parsePath(pathname);
  const key = parsed?.key ?? "home";
  return (
    <nav aria-label={label} className="flex items-center gap-1 text-sm">
      {locales.map((l) => (
        <a
          key={l}
          href={asset(href(l, key))}
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
