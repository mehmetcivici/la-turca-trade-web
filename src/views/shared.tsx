import Link from "next/link";
import { asset } from "@/lib/asset";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { catalogs, site } from "@/content/site";
import { starSeries, gastroCategories, type StarSeries, type GastroCategory } from "@/content/products";
import { Arrow, Download, Img } from "@/components/ui";

export function SeriesCard({ s, d }: { s: StarSeries; d: Dict }) {
  const detail = d.products.details[s.id];
  return (
    <article className="group">
      <div className="overflow-hidden bg-card">
        <Img src={s.image} alt={`Star Termos ${s.name} — ${d.products.materials[s.material]}`} w={900} h={900} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <h3 className="mt-4 font-serif text-[1.22rem] leading-none">{s.name}</h3>
      <p className="mt-2 text-[0.95rem] text-muted">
        <span className="tabular text-ink">{s.capacity}</span> · {d.products.materials[s.material]}
        {detail ? ` · ${detail}` : ""}
      </p>
    </article>
  );
}

export function SeriesGrid({ d, ids }: { d: Dict; ids?: string[] }) {
  const list = ids ? ids.map((id) => starSeries.find((s) => s.id === id)!).filter(Boolean) : starSeries;
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
      {list.map((s) => (
        <SeriesCard key={s.id} s={s} d={d} />
      ))}
    </div>
  );
}

export function CategoryCard({ c, d, showCodes = false }: { c: GastroCategory; d: Dict; showCodes?: boolean }) {
  const t = d.products.gastro[c.id];
  return (
    <article className="flex flex-col border-t border-line pt-5">
      <div className="overflow-hidden bg-white">
        <Img src={c.image} alt={`Gastroplast — ${t.t}`} w={840} h={840} className="aspect-[4/3] w-full object-cover" />
      </div>
      <h3 className="mt-5 font-serif text-[1.22rem] leading-tight">{t.t}</h3>
      <p className="mt-2 text-muted">{t.d}</p>
      {showCodes && c.codes.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          {d.common.code}: <span className="tabular text-ink">{c.codes.join(" · ")}</span>
        </p>
      )}
    </article>
  );
}

export function CategoryGrid({ d, ids, showCodes = false }: { d: Dict; ids?: string[]; showCodes?: boolean }) {
  const list = ids ? gastroCategories.filter((c) => ids.includes(c.id)) : gastroCategories;
  return (
    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <CategoryCard key={c.id} c={c} d={d} showCodes={showCodes} />
      ))}
    </div>
  );
}

export function CatalogCards({ d, locale }: { d: Dict; locale: Locale }) {
  void locale;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {catalogs.map((c) => (
        <article key={c.id} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-end gap-6 border-t border-line pt-6">
          <a href={asset(c.file)} target="_blank" rel="noopener" className="block bg-white shadow-[0_18px_40px_-24px_rgba(27,34,48,0.45)] transition-transform hover:-translate-y-1">
            <Img src={c.cover} alt={`${c.brand} — ${d.nav.catalogs}`} w={c.coverW} h={c.coverH} className="w-full" />
          </a>
          <div>
            <h3 className="font-serif text-2xl leading-tight">{c.brand}</h3>
            <dl className="mt-3 space-y-1 text-[0.95rem] text-muted">
              <div>
                <dt className="inline">{d.cat.yearLabel}: </dt>
                <dd className="inline tabular text-ink">{c.year}</dd>
              </div>
              <div>
                <dt className="inline">{d.cat.langLabel}: </dt>
                <dd className="inline text-ink">{c.lang}</dd>
              </div>
              <div className="tabular">
                {c.pages} {d.common.pages} · PDF {String(c.sizeMb).replace(".", locale === "en" ? "." : ",")} MB
              </div>
            </dl>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a href={asset(c.file)} download className="btn btn-dark !py-2.5">
                <Download /> {d.common.download}
              </a>
              <a href={asset(c.file)} target="_blank" rel="noopener" className="link-arrow text-[0.95rem]">
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
    <section className="bg-amber text-navy-2">
      <div className="wrap grid gap-8 py-16 md:grid-cols-12 md:items-end md:py-20">
        <div className="md:col-span-8">
          <h2 className="h2">{d.home.cta.title}</h2>
          <p className="mt-4 max-w-2xl text-lg text-navy-2/80">{d.home.cta.lead}</p>
        </div>
        <div className="flex flex-col items-start gap-4 md:col-span-4 md:items-end">
          <Link href={href(locale, "contact")} className="btn btn-dark">
            {d.common.quote} <Arrow />
          </Link>
          {site.email && (
            <a href={`mailto:${site.email}`} className="border-b border-navy-2/50 pb-0.5 font-semibold text-navy-2 hover:border-navy-2">
              {site.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumb({ d, locale, name }: { d: Dict; locale: Locale; name: string }) {
  return (
    <nav aria-label="breadcrumb" className="wrap pt-8 text-sm text-muted">
      <Link href={href(locale, "home")} className="hover:text-copper">
        {d.common.home}
      </Link>
      <span className="mx-2" aria-hidden="true">/</span>
      <span aria-current="page" className="text-ink">{name}</span>
    </nav>
  );
}
