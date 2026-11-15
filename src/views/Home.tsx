import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { starLoading } from "@/content/products";
import { Arrow, Img, Ledger, SectionHead } from "@/components/ui";
import { ATLANTIC_PORTS, PACIFIC_PORTS } from "@/content/routes";
import { ContainerFigure } from "@/components/ContainerFigure";
import { BoxDieline } from "@/components/BoxDieline";
import { CatalogCards, CategoryGrid, CtaBand, SeriesGrid } from "./shared";

export function LoadingTable({ d, locale }: { d: Dict; locale: Locale }) {
  const nf = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : locale);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/70 text-[0.9rem] text-muted">
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
              <td className="py-4 pr-4">{d.products.loading[r.key]}</td>
              <td className="tabular py-4 pr-4 text-right">{r.perBox}</td>
              <td className="tabular py-4 pr-4 text-right">{nf.format(r.boxes40)}</td>
              <td className="tabular py-4 text-right font-serif text-2xl text-navy">{nf.format(r.hc40)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Home({ locale, d }: { locale: Locale; d: Dict }) {
  const h = d.home;
  const dec = locale === "en" ? "." : ",";
  return (
    <>
      {/* Açılış */}
      <section className="wrap pt-12 md:pt-20">
        <p className="kicker">{h.hero.kicker}</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1 className="display lg:col-span-8">{h.hero.h1}</h1>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="text-lg leading-relaxed text-muted">{h.hero.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={href(locale, "contact")} className="btn btn-dark">
                {d.common.priceList} <Arrow />
              </Link>
              <Link href={href(locale, "catalogs")} className="btn btn-line">
                {d.common.catalogs}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <figure className="mt-12 md:mt-16">
        <Img src="/img/star-termos/lineup.webp" alt={h.hero.caption} w={1582} h={986} priority className="h-[56vw] max-h-[78vh] min-h-[320px] w-full object-cover object-[50%_58%]" />
        <figcaption className="wrap mt-3 text-sm text-muted">{h.hero.caption}</figcaption>
      </figure>

      <section className="wrap py-14 md:py-20">
        <Ledger items={h.facts} />
      </section>

      {/* Üreticiler */}
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="makers">
        <div className="wrap">
          <SectionHead id="makers" title={h.makers.title} lead={h.makers.lead} />
          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-12">
            {[
              { key: "starTermos" as const, logo: "/img/brands/star-termos.webp", lw: 500, lh: 150, img: "/img/star-termos/scene-tea-table.webp", iw: 1378, ih: 919, data: h.star },
              { key: "gastroplast" as const, logo: "/img/brands/gastroplast.webp", lw: 600, lh: 231, img: "/img/gastroplast/scene-condiment.webp", iw: 1600, ih: 900, data: h.gastro },
            ].map((m) => (
              <article key={m.key} className="flex flex-col">
                <Link href={href(locale, m.key)} className="block overflow-hidden">
                  <Img src={m.img} alt={d.nav[m.key]} w={m.iw} h={m.ih} className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]" />
                </Link>
                <div className="mt-7 flex items-center justify-between gap-6">
                  <h3 className="h3">{d.nav[m.key]}</h3>
                  <Img src={m.logo} alt="" w={m.lw} h={m.lh} className="h-9 w-auto" />
                </div>
                <p className="mt-4 text-muted">{m.data.lead}</p>
                <ul className="mt-5 grid gap-x-6 sm:grid-cols-2">
                  {m.data.facts.map((f) => (
                    <li key={f} className="flex gap-3 border-t border-line py-2.5 text-[0.97rem]">
                      <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href(locale, m.key)} className="link-arrow mt-6 self-start">
                  {m.data.link} <Arrow />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Star Termos serileri */}
      <section className="wrap py-20 md:py-28" aria-labelledby="star-line">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead id="star-line" kicker="Star Termos" title={h.starLine.title} lead={h.starLine.lead} />
          <Link href={href(locale, "starTermos")} className="link-arrow shrink-0">
            {d.common.seeAll} <Arrow />
          </Link>
        </div>
        <div className="mt-12">
          <SeriesGrid d={d} ids={["elegant", "east", "mimoza", "kastel", "horeca", "camping", "trailmate", "thermbox"]} />
        </div>
      </section>

      {/* Ara fotoğraf */}
      <section className="grid md:grid-cols-2">
        <Img src="/img/star-termos/scene-pastel-jugs.webp" alt="Star Termos" w={1374} h={962} className="aspect-[4/3] h-full w-full object-cover" />
        <Img src="/img/gastroplast/scene-pool.webp" alt="Gastroplast" w={874} h={1080} className="aspect-[4/3] h-full w-full object-cover" />
      </section>

      {/* Gastroplast */}
      <section className="wrap py-20 md:py-28" aria-labelledby="gastro-line">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead id="gastro-line" kicker="Gastroplast" title={h.gastroLine.title} lead={h.gastroLine.lead} />
          <Link href={href(locale, "gastroplast")} className="link-arrow shrink-0">
            {d.common.seeAll} <Arrow />
          </Link>
        </div>
        <div className="mt-12">
          <CategoryGrid d={d} ids={["gnPc", "storage", "bakery", "dispensers", "bar", "transport"]} />
        </div>
      </section>

      {/* Konteyner */}
      <section className="border-y border-line bg-card py-20 md:py-28" aria-labelledby="container">
        <div className="wrap">
          <SectionHead id="container" title={h.container.title} lead={h.container.lead} />
          <div className="-mx-5 mt-12 overflow-x-auto px-5 md:mx-0 md:px-0">
            <div className="min-w-[720px]">
              <ContainerFigure dec={dec} caption={h.container.figure} />
            </div>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-12">
            <h3 className="h3 lg:col-span-4">{h.container.tableTitle}</h3>
            <div className="lg:col-span-8">
              <LoadingTable d={d} locale={locale} />
              <p className="mt-4 text-sm text-muted">{h.container.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rotalar */}
      <section className="wrap py-20 md:py-28" aria-labelledby="routes">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHead id="routes" title={h.routes.title} lead={h.routes.lead} className="lg:col-span-6" />
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6">
            <div>
              <h3 className="font-sans text-sm font-medium text-copper">{h.routes.atlantic}</h3>
              <p className="mt-2 font-serif text-[1.45rem] leading-snug">{ATLANTIC_PORTS.join(" · ")}</p>
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium text-copper">{h.routes.pacific}</h3>
              <p className="mt-2 font-serif text-[1.45rem] leading-snug">{PACIFIC_PORTS.join(" · ")}</p>
            </div>
          </div>
        </div>
        <div className="-mx-5 mt-12 overflow-x-auto border-t border-line px-5 pt-8 md:mx-0 md:px-0">
          <Img src={`/img/map/routes-${locale}.svg`} alt={h.routes.mapAlt} w={1200} h={940} className="w-full min-w-[760px]" />
        </div>
      </section>

      {/* Özel marka */}
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="pl">
        <div className="wrap grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead id="pl" title={h.pl.title} lead={h.pl.lead} />
            <Link href={href(locale, "privateLabel")} className="link-arrow mt-8">
              {h.pl.link} <Arrow />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-[1.3fr_1fr] lg:col-span-7">
            <div className="flex items-center bg-card p-5">
              <BoxDieline brand={d.pl.mock} label={d.pl.whatTitle} />
            </div>
            <Img src="/img/star-termos/steel-jug.webp" alt="Star Termos Horeca" w={900} h={900} className="aspect-[4/5] h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Kataloglar */}
      <section className="wrap py-20 md:py-28" aria-labelledby="catalogs">
        <SectionHead id="catalogs" title={h.catalogs.title} lead={h.catalogs.lead} />
        <div className="mt-12">
          <CatalogCards d={d} locale={locale} />
        </div>
      </section>

      {/* Çalışma şekli */}
      <section className="bg-navy py-20 text-paper md:py-28" aria-labelledby="how">
        <div className="wrap">
          <SectionHead id="how" title={h.how.title} light />
          <ul className="mt-12 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
            {h.how.items.map((it) => (
              <li key={it.t} className="border-t border-navy-line py-7">
                <h3 className="font-serif text-[1.65rem] leading-tight">{it.t}</h3>
                <p className="mt-2 text-paper/70">{it.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
