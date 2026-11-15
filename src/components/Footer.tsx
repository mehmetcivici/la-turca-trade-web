import Link from "next/link";
import { href, subPages, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { site, manufacturers } from "@/content/site";
import { Logo } from "./Logo";
import { LangMenu } from "./LangMenu";

export function Footer({ locale, d }: { locale: Locale; d: Dict }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy text-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo tone="light" className="text-[22px]" />
          <p className="mt-6 max-w-md text-paper/75">{d.footer.blurb}</p>
          {site.email && (
            <p className="mt-6">
              <span className="block text-sm text-paper/55">{d.footer.write}</span>
              <a href={`mailto:${site.email}`} className="font-serif text-xl hover:text-copper-l">
                {site.email}
              </a>
            </p>
          )}
          {site.phone && (
            <p className="mt-2">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-paper/85 hover:text-copper-l">
                {site.phone}
              </a>
            </p>
          )}
        </div>
        <div className="md:col-span-3 md:col-start-7">
          <h2 className="font-sans text-sm font-medium text-paper/55">{d.footer.pages}</h2>
          <ul className="mt-4 space-y-2">
            {subPages.map((k) => (
              <li key={k}>
                <Link href={href(locale, k)} className="text-paper/85 hover:text-copper-l">
                  {d.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="font-sans text-sm font-medium text-paper/55">{d.footer.makers}</h2>
          <ul className="mt-4 space-y-4">
            {Object.values(manufacturers).map((m) => (
              <li key={m.name}>
                <a href={m.web} target="_blank" rel="noopener" className="text-paper/85 hover:text-copper-l">
                  {m.name}
                </a>
                <span className="block text-sm text-paper/50">{m.address}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 -ml-1.5">
            <LangMenu locale={locale} label={d.common.language} tone="light" />
          </div>
        </div>
      </div>
      <div className="border-t border-navy-line">
        <div className="wrap flex flex-col gap-3 py-6 text-sm text-paper/55 md:flex-row md:justify-between">
          <p>
            © {year} {site.name}. {d.footer.rights} · {d.common.madeIn}
          </p>
          <p className="max-w-2xl md:text-right">{d.footer.brandsNote}</p>
        </div>
      </div>
    </footer>
  );
}
