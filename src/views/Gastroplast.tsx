import Link from "@/components/L";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { catalogFor, catalogs } from "@/content/site";
import { asset } from "@/lib/asset";
import { gastroCategories, gnSizes, gnDepths, gnPerBox, gnCode, tx } from "@/content/products";
import { Arrow, Check, Download, Img, PageBanner, SectionHead, Stats } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { CategoryGrid, CtaBand, crumbs } from "./shared";
import { altFor } from "@/content/alts";

export function Gastroplast({ locale, d }: { locale: Locale; d: Dict }) {
  const g = d.gastro;
  const cat = catalogFor(catalogs.find((c) => c.id === "gastroplast")!, locale);
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "gastroplast", "Gastroplast")} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: g.catsTitle + " — Gastroplast",
          itemListElement: gastroCategories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: tx(c.title, locale) })),
        }}
      />
      <PageBanner
        title={g.h1}
        kicker={g.sub}
        lead={d.home.gastro.lead}
        image={{ src: "/img/gastroplast/scene-condiment.webp", w: 1600, h: 900, alt: altFor("/img/gastroplast/scene-condiment.webp", locale, "Gastroplast") }}
        crumbs={crumbs(d, locale, "Gastroplast")}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={asset(cat.file)} download target="_blank" rel="noopener" className="btn btn-amber">
            <Download /> {d.common.download}
          </a>
          <Link href={href(locale, "contact")} className="btn btn-light">
            {d.common.quote}
          </Link>
        </div>
      </PageBanner>
      <div className="wrap relative z-10 -mt-10">
        <Stats items={g.facts} className="shadow-soft" />
      </div>

      <section className="wrap grid items-center gap-10 py-20 md:py-24 lg:grid-cols-12">
        <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink/85 lg:col-span-7">
          {g.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p className="text-sm text-muted">{g.brands}</p>
        </div>
        <div className="lg:col-span-5">
          <Img src="/img/gastroplast/gn-pc-black.webp" alt={altFor("/img/gastroplast/gn-pc-black.webp", locale, g.gnTitle)} w={800} h={800} className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="cats">
        <div className="wrap">
          <SectionHead id="cats" kicker="Gastroplast" title={g.catsTitle} />
          <div className="mt-10">
            <CategoryGrid d={d} locale={locale} showCodes />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-6 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="gn">
        <div className="lg:col-span-4">
          <SectionHead id="gn" kicker="GN · PC" title={g.gnTitle} lead={g.gnLead} />
          <Img src="/img/gastroplast/gn-pc-clear.webp" alt={altFor("/img/gastroplast/gn-pc-clear.webp", locale, g.gnTitle)} w={840} h={839} className="mt-8 hidden w-4/5 rounded-2xl lg:block" />
        </div>
        <div className="card overflow-x-auto p-6 md:p-8 lg:col-span-8">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">{g.gnTitle}</caption>
            <thead>
              <tr className="border-b border-line text-[0.85rem] uppercase tracking-[0.05em] text-muted">
                <th scope="col" className="py-3 pr-4 font-bold">{g.gnSize}</th>
                {gnDepths.map((dp) => (
                  <th key={dp} scope="col" className="py-3 pr-4 font-bold">
                    {dp} mm
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gnSizes.map((sz) => (
                <tr key={sz} className="border-b border-line last:border-0">
                  <th scope="row" className="py-4 pr-4 font-serif text-xl font-medium text-navy">GN {sz}</th>
                  {gnDepths.map((dp, i) => {
                    const n = gnPerBox[sz][i];
                    return (
                      <td key={dp} className="py-4 pr-4 align-top">
                        {n ? (
                          <>
                            <span className="tabular block text-[0.93rem] font-semibold">{gnCode(sz, dp)}</span>
                            <span className="tabular block text-sm text-muted">
                              {n} {d.common.perBox.toLowerCase()}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-muted">{g.gnNote}</p>
        </div>
      </section>

      <section className="bg-navy py-20 text-white md:py-28" aria-labelledby="gcerts">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionHead id="gcerts" kicker="NSF · FDA · EU" title={g.certTitle} light />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {g.certs.map((c) => (
                <li key={c.t} className="flex items-start gap-3 rounded-xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber text-navy-2">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <span className="block font-bold">{c.t}</span>
                    <span className="text-[0.93rem] text-white/70">{c.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 font-sans text-sm font-bold uppercase tracking-[0.06em] text-copper-l">{g.fairsTitle}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.fairs.map((f) => (
                <li key={f} className="rounded-full bg-white/10 px-3 py-1 text-sm">{f}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-white/60">
              {d.common.source}: Gastroplast catalog
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Img src="/img/gastroplast/nsf-listing.webp" alt="NSF International — Gastroplast official listing" w={700} h={945} className="w-full rounded-lg bg-white shadow-soft" />
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
