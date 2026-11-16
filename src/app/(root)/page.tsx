import { locales, localeNames } from "@/i18n/config";
import { getDict } from "@/content/dict";
import { Logo } from "@/components/Logo";
import { asset } from "@/lib/asset";

/** Kök adres: dil seçimi. Yönlendirme betiği (root)/layout.tsx içinde, <head>'de çalışır. */

export default function RootPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="w-full max-w-md text-center">
        <Logo className="text-[28px]" />
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {locales.map((l) => (
            <li key={l}>
              <a href={asset(`/${l}/`)} hrefLang={l} lang={l} className="flex items-baseline justify-between py-4 font-serif text-2xl hover:text-copper">
                {localeNames[l]}
                <span className="font-sans text-sm text-muted">{getDict(l).langPage.lead}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
