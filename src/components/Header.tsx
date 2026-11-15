import Link from "next/link";
import { href, type Locale, type SubPageKey } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Logo } from "./Logo";
import { LangMenu } from "./LangMenu";
import { NavCloser } from "./NavCloser";

const NAV: SubPageKey[] = ["starTermos", "gastroplast", "distributors", "privateLabel", "catalogs", "about"];

export function Header({ locale, d }: { locale: Locale; d: Dict }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-paper focus:px-3 focus:py-2">
        {d.common.skip}
      </a>
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Link href={href(locale, "home")} className="shrink-0" aria-label="La Turca Trade">
          <Logo className="h-[40px] w-auto md:h-[46px]" />
        </Link>

        <nav aria-label={d.common.menu} className="hidden xl:block">
          <ul className="flex items-center gap-7 text-[0.97rem]">
            {NAV.map((k) => (
              <li key={k}>
                <Link href={href(locale, k)} className="text-ink/85 transition-colors hover:text-copper">
                  {d.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          <LangMenu locale={locale} label={d.common.language} />
          <Link href={href(locale, "contact")} className="btn btn-dark !py-2.5 !text-[0.95rem]">
            {d.common.quote}
          </Link>
        </div>

        {/* Mobil menü: JS gerektirmeyen <details> */}
        <details className="group relative xl:hidden">
          <NavCloser />
          <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-[0.97rem] font-medium [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{d.common.menu}</span>
            <span className="hidden group-open:inline">{d.common.close}</span>
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span className="absolute left-0 top-0 h-px w-5 bg-ink transition-transform group-open:translate-y-1.5 group-open:rotate-45" />
              <span className="absolute left-0 top-3 h-px w-5 bg-ink transition-transform group-open:-translate-y-1.5 group-open:-rotate-45" />
            </span>
          </summary>
          <div className="fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto border-t border-line bg-paper">
            <ul className="wrap py-6">
              {NAV.map((k) => (
                <li key={k} className="border-b border-line">
                  <Link href={href(locale, k)} className="block py-4 font-serif text-3xl">
                    {d.nav[k]}
                  </Link>
                </li>
              ))}
              <li className="border-b border-line">
                <Link href={href(locale, "contact")} className="block py-4 font-serif text-3xl">
                  {d.nav.contact}
                </Link>
              </li>
            </ul>
            <div className="wrap flex flex-wrap items-center justify-between gap-4 pb-10">
              <LangMenu locale={locale} label={d.common.language} />
              <Link href={href(locale, "contact")} className="btn btn-dark">
                {d.common.quote}
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
