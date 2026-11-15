import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { catalogs, site } from "@/content/site";
import { asset } from "@/lib/asset";
import { starSeries, gastroCategories, type StarSeries, type GastroCategory } from "@/content/products";
import { Arrow, Download, Img } from "@/components/ui";

export function SeriesCard({ s, d }: { s: StarSeries; d: Dict }) {
  const detail = d.products.details[s.id];
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="overflow-hidden bg-paper-2">
        <Img src={s.image} alt={`Star Termos ${s.name} — ${d.products.materials[s.material]}`} w={900} h={900} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
          <h3 className="font-serif text-xl leading-tight text-navy">{s.name}</h3>
          <span className="chip tabular shrink-0 whitespace-nowrap">{s.capacity}</span>
        </div>
        <p className="mt-2 text-[0.92rem] leading-snug text-muted">
          {d.products.materials[s.material]}
          {detail ? ` · ${detail}` : ""}
        </p>
      </div>
    </article>
  );
}

export function SeriesGrid({ d, ids }: { d: Dict; ids?: string[] }) {
  const list = ids ? ids.map((id) => starSeries.find((s) => s.id === id)!).filter(Boolean) : starSeries;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {list.map((s) => (
        <SeriesCard key={s.id} s={s} d={d} />
      ))}
    </div>
  );
}

export function CategoryCard({ c, d, showCodes = false }: { c: GastroCategory; d: Dict; showCodes?: boolean }) {
  const t = d.products.gastro[c.id];
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="overflow-hidden bg-white">
        <Img src={c.image} alt={`Gastroplast — ${t.t}`} w={840} h={840} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl leading-tight text-navy">{t.t}</h3>
        <p className="mt-2 text-[0.95rem] text-muted">{t.d}</p>
        {showCodes && c.codes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {c.codes.map((code) => (
              <span key={code} className="chip tabular">{code}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function CategoryGrid({ d, ids, showCodes = false }: { d: Dict; ids?: string[]; showCodes?: boolean }) {
  const list = ids ? gastroCategories.filter((c) => ids.includes(c.id)) : gastroCategories;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {list.map((c) => (
        <CategoryCard key={c.id} c={c} d={d} showCodes={showCodes} />
      ))}
    </div>
  );
}

export function CatalogCards({ d, locale }: { d: Dict; locale: Locale }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {catalogs.map((c) => (
        <article key={c.id} className="card card-hover grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-6 p-6">
          <a href={asset(c.file)} target="_blank" rel="noopener" className="block overflow-hidden rounded-lg bg-paper-2 shadow-soft">
            <Img src={c.cover} alt={`${c.brand} — ${d.nav.catalogs}`} w={c.coverW} h={c.coverH} className="w-full" />
          </a>
          <div>
            <p className="eyebrow">PDF · {c.year}</p>
            <h3 className="mt-2 font-serif text-2xl leading-tight text-navy">{c.brand}</h3>
            <ul className="mt-3 space-y-1 text-[0.93rem] text-muted">
              <li>
                {d.cat.langLabel}: <span className="font-semibold text-ink">{c.lang}</span>
              </li>
              <li className="tabular">
                {c.pages} {d.common.pages} · {String(c.sizeMb).replace(".", locale === "en" ? "." : ",")} MB
              </li>
            </ul>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a href={asset(c.file)} download className="btn btn-dark !py-2.5">
                <Download /> {d.common.download}
              </a>
              <a href={asset(c.file)} target="_blank" rel="noopener" className="link-arrow text-[0.93rem] text-navy">
                {d.common.open} <Arrow />
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CtaBand({ d, locale }: { d: Dict; locale: Locale }) {
  return (
    <section className="wrap py-16 md:py-24">
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy px-7 py-12 text-white md:px-14 md:py-16">
        <Img src="/img/star-termos/scene-tea-table.webp" alt="" w={1378} h={919} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/95 to-navy/60" />
        <div className="grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <h2 className="h2 text-white">{d.home.cta.title}</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">{d.home.cta.lead}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:col-span-4 md:items-end">
            <Link href={href(locale, "contact")} className="btn btn-amber">
              {d.common.quote} <Arrow />
            </Link>
            {site.email && (
              <a href={`mailto:${site.email}`} className="font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">
                {site.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function crumbs(d: Dict, locale: Locale, current: string) {
  return { home: { label: d.common.home, href: href(locale, "home") }, current };
}
