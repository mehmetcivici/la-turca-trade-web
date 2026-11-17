import Link from "@/components/L";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { starLoading, tx, loadables } from "@/content/products";
import { LoadCalculator } from "@/components/LoadCalculator";
import { asset } from "@/lib/asset";
import { BadgeDollarSign, ClipboardCheck, FileText, MessagesSquare, PackageOpen, Ship } from "lucide-react";
import { Arrow, Check, Img, SectionHead, Stats } from "@/components/ui";
import { ATLANTIC_PORTS, PACIFIC_PORTS } from "@/content/routes";
import { BoxDieline } from "@/components/BoxDieline";
import { CatalogCards, CategoryGrid, CtaBand, SeriesGrid } from "./shared";

export function LoadingTable({ d, locale }: { d: Dict; locale: Locale }) {
  const nf = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : locale);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-[0.9rem] text-muted">
            <th className="py-3 pr-4 font-medium">{d.common.code}</th>
            <th className="py-3 pr-4 font-medium" />
            <th className="py-3 pr-4 text-right font-medium">{d.common.perBox}</th>
            <th className="py-3 pr-4 text-right font-medium">{d.common.boxes}</th>
            <th className="py-3 text-right font-medium">{d.common.units}</th>
          </tr>
        </thead>
        <tbody>
          {starLoading.map((r) => (
            <tr key={r.code} className="border-b border-line">
              <td className="tabular py-4 pr-4 text-[0.95rem] text-muted">{r.code}</td>
              <td className="py-4 pr-4">{tx(r.label, locale)}</td>
              <td className="tabular py-4 pr-4 text-right">{r.perBox}</td>
              <td className="tabular py-4 pr-4 text-right">{nf.format(r.boxes40)}</td>
              <td className="tabular py-4 text-right font-serif text-xl text-navy">{nf.format(r.hc40)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Home({ locale, d }: { locale: Locale; d: Dict }) {
  const h = d.home;
  const icons = [BadgeDollarSign, PackageOpen, ClipboardCheck, FileText, MessagesSquare, Ship];
  const makers = [
    { key: "starTermos" as const, logo: "/img/brands/star-termos.webp", lw: 500, lh: 150, img: "/img/star-termos/scene-tea-table.webp", iw: 1378, ih: 919, data: h.star },
    { key: "gastroplast" as const, logo: "/img/brands/gastroplast.webp", lw: 600, lh: 231, img: "/img/gastroplast/scene-condiment.webp", iw: 1600, ih: 900, data: h.gastro },
  ];
  return (
    <>
      {/* Açılış: tam ekran fotoğraf */}
      <section className="relative isolate overflow-hidden bg-navy">
        <Img src="/img/star-termos/lineup.webp" alt={h.hero.caption} w={1582} h={986} priority className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_60%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-2 via-navy/85 to-navy/10" />
        <div className="absolute inset-0 -z-10 bg-navy/70 md:hidden" />
        <div className="wrap flex min-h-[600px] items-center pb-36 pt-20 md:min-h-[78vh] md:pb-44">
          <div className="max-w-3xl text-white">
            <p className="eyebrow eyebrow-light">{h.hero.kicker}</p>
            <h1 className="mt-5 font-serif text-[clamp(2.1rem,3.9vw,3.6rem)] font-medium leading-[1.1] text-white">{h.hero.h1}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{h.hero.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={href(locale, "contact")} className="btn btn-amber">
                {d.common.priceList} <Arrow />
              </Link>
              <Link href={href(locale, "catalogs")} className="btn btn-light">
                {d.common.catalogs}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap relative z-10 -mt-24 md:-mt-28">
        <Stats items={h.facts} className="shadow-soft" />
      </div>

      {/* Üreticiler */}
      <section className="wrap py-20 md:py-28" aria-labelledby="makers">
        <SectionHead id="makers" kicker="Star Termos · Gastroplast" title={h.makers.title} lead={h.makers.lead} center />
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {makers.map((m) => (
            <article key={m.key} className="card card-hover flex flex-col overflow-hidden">
              <Link href={href(locale, m.key)} className="relative block overflow-hidden">
                <Img src={m.img} alt={d.nav[m.key]} w={m.iw} h={m.ih} className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
                <span className="absolute left-5 top-5 rounded-lg bg-white/95 px-3 py-2 shadow-soft">
                  <Img src={m.logo} alt={d.nav[m.key]} w={m.lw} h={m.lh} className="h-7 w-auto" />
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-7 md:p-8">
                <h3 className="h3 text-navy">{d.nav[m.key]}</h3>
                <p className="mt-3 text-muted">{m.data.lead}</p>
                <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {m.data.facts.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.96rem]">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber/20 text-copper">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href={href(locale, m.key)} className="btn btn-dark">
                    {m.data.link} <Arrow />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Star Termos serileri */}
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="star-line">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead id="star-line" kicker="Star Termos" title={h.starLine.title} lead={h.starLine.lead} />
            <Link href={href(locale, "starTermos")} className="btn btn-dark shrink-0">
              {d.common.seeAll} <Arrow />
            </Link>
          </div>
          <div className="mt-12">
            <SeriesGrid d={d} locale={locale} featured />
          </div>
        </div>
      </section>

      {/* Gastroplast */}
      <section className="wrap py-20 md:py-28" aria-labelledby="gastro-line">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead id="gastro-line" kicker="Gastroplast" title={h.gastroLine.title} lead={h.gastroLine.lead} />
          <Link href={href(locale, "gastroplast")} className="btn btn-dark shrink-0">
            {d.common.seeAll} <Arrow />
          </Link>
        </div>
        <div className="mt-12">
          <CategoryGrid d={d} locale={locale} featured />
        </div>
      </section>

      {/* Konteyner */}
      <section className="bg-navy py-20 text-white md:py-28" aria-labelledby="container">
        <div className="wrap">
          <SectionHead id="container" kicker={d.calc.title} title={h.container.title} lead={h.container.lead} light />
          <div className="mt-12">
            <LoadCalculator t={d.calc} items={loadables} locale={locale} contactHref={asset(href(locale, "contact"))} />
          </div>
        </div>
      </section>

      {/* Rotalar */}
      <section className="wrap py-20 md:py-28" aria-labelledby="routes">
        <SectionHead id="routes" kicker={h.routes.origin} title={h.routes.title} lead={h.routes.lead} />
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="card overflow-x-auto p-4 md:p-6 lg:col-span-9">
            <Img src={`/img/map/routes-${locale}.svg`} alt={h.routes.mapAlt} w={1200} h={940} className="w-full min-w-[640px]" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1 lg:content-start">
            {[{ t: h.routes.atlantic, p: ATLANTIC_PORTS }, { t: h.routes.pacific, p: PACIFIC_PORTS }].map((g) => (
              <div key={g.t} className="card p-6">
                <h3 className="font-sans text-sm font-bold uppercase tracking-[0.06em] text-copper">{g.t}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.p.map((port) => (
                    <li key={port} className="chip">{port}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özel marka */}
      <section className="wrap pb-20 md:pb-28" aria-labelledby="pl">
        <div className="grid overflow-hidden rounded-3xl bg-paper-2 lg:grid-cols-2">
          <div className="p-8 md:p-12 lg:p-14">
            <SectionHead id="pl" kicker="OEM · ODM" title={h.pl.title} lead={h.pl.lead} />
            <Link href={href(locale, "privateLabel")} className="btn btn-dark mt-8">
              {h.pl.link} <Arrow />
            </Link>
          </div>
          <div className="grid grid-cols-[1.25fr_1fr] gap-4 p-4 md:p-6 lg:pl-0">
            <div className="flex items-center rounded-2xl bg-white p-4">
              <BoxDieline brand={d.pl.mock} label={d.pl.whatTitle} />
            </div>
            <Img src="/img/star-termos/steel-jug.webp" alt="Star Termos Horeca" w={900} h={900} className="h-full w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>

      {/* Kataloglar */}
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="catalogs">
        <div className="wrap">
          <SectionHead id="catalogs" kicker="PDF" title={h.catalogs.title} lead={h.catalogs.lead} />
          <div className="mt-12">
            <CatalogCards d={d} locale={locale} />
          </div>
        </div>
      </section>

      {/* Çalışma şekli */}
      <section className="wrap py-20 md:py-28" aria-labelledby="how">
        <SectionHead id="how" kicker="La Turca Trade" title={h.how.title} center />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {h.how.items.map((it, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={it.t} className="card card-hover p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-copper-l">
                  <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-xl leading-tight text-navy">{it.t}</h3>
                <p className="mt-2 text-muted">{it.d}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
