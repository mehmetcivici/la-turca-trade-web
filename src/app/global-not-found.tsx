import type { Metadata } from "next";
import { asset } from "@/lib/asset";
import "./globals.css";
import { serif, sans } from "@/lib/fonts";
import { locales } from "@/i18n/config";
import { getDict } from "@/content/dict";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "404 — La Turca Trade",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <main className="grid min-h-svh place-items-center px-5">
          <div className="w-full max-w-xl">
            <a href={asset("/es/")} aria-label="La Turca Trade">
              <Logo className="text-[22px]" />
            </a>
            <p className="mt-14 font-serif text-8xl text-copper">404</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {locales.map((l) => {
                const d = getDict(l);
                return (
                  <li key={l} lang={l} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                    <span className="font-serif text-2xl">{d.notFound.title}</span>
                    <a href={asset(`/${l}/`)} className="text-[0.95rem] text-muted underline hover:text-copper">
                      {d.notFound.back}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </main>
      </body>
    </html>
  );
}
