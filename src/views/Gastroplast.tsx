import { type Locale } from "@/i18n/config";
import { asset } from "@/lib/asset";
import type { Dict } from "@/content/dict";
import { catalogs, manufacturers } from "@/content/site";
import { gastroCategories, gnSizes, gnDepths, gnPerBox, gnCode } from "@/content/products";
import { Arrow, Download, Img, Ledger, SectionHead } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb, CategoryGrid, CtaBand } from "./shared";

export function Gastroplast({ locale, d }: { locale: Locale; d: Dict }) {
  const g = d.gastro;
  const cat = catalogs.find((c) => c.id === "gastroplast")!;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "gastroplast", "Gastroplast")} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: g.catsTitle + " — Gastroplast",
          itemListElement: gastroCategories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: d.products.gastro[c.id].t })),
        }}
      />
      <Breadcrumb d={d} locale={locale} name="Gastroplast" />

      <section className="wrap grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:pb-24 lg:pt-14">
        <div className="lg:col-span-6 lg:pr-6">
          <p className="kicker">{g.sub}</p>
          <h1 className="display mt-4">{g.h1}</h1>
          <div className="mt-8 space-y-5 text-[1.08rem] leading-relaxed text-ink/85">
            {g.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">{g.brands}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href={asset(cat.file)} download className="btn btn-dark">
              <Download /> {d.common.download}
            </a>
            <a href={manufacturers.gastroplast.web} target="_blank" rel="noopener" className="link-arrow text-[0.95rem]">
              {d.common.officialSite} <Arrow />
            </a>
          </div>
        </div>
        <div className="lg:col-span-6">
          <Img src="/img/gastroplast/gn-pc-black.webp" alt={d.products.gastro.gnPc.t} w={800} h={800} priority className="aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <section className="wrap pb-16">
        <Ledger items={g.facts} />
      </section>

      <section className="wrap pb-20 md:pb-28" aria-labelledby="cats">
        <h2 id="cats" className="h2">{g.catsTitle}</h2>
        <div className="mt-10">
          <CategoryGrid d={d} showCodes />
        </div>
      </section>

      <section className="border-y border-line bg-card py-20 md:py-28" aria-labelledby="gn">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead id="gn" title={g.gnTitle} lead={g.gnLead} />
            <Img src="/img/gastroplast/gn-pc-clear.webp" alt={g.gnTitle} w={840} h={839} className="mt-8 hidden w-4/5 lg:block" />
          </div>
          <div className="overflow-x-auto lg:col-span-8">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">{g.gnTitle}</caption>
              <thead>
                <tr className="border-b border-ink/70 text-[0.9rem] text-muted">
                  <th scope="col" className="py-3 pr-4 font-medium">{g.gnSize}</th>
                  {gnDepths.map((dp) => (
                    <th key={dp} scope="col" className="py-3 pr-4 font-medium">
                      {dp} mm
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gnSizes.map((sz) => (
                  <tr key={sz} className="border-b border-line">
                    <th scope="row" className="py-4 pr-4 font-serif text-xl font-normal text-navy">GN {sz}</th>
                    {gnDepths.map((dp, i) => {
                      const n = gnPerBox[sz][i];
                      return (
                        <td key={dp} className="py-4 pr-4 align-top">
                          {n ? (
                            <>
                              <span className="tabular block text-[0.95rem]">{gnCode(sz, dp)}</span>
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
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <Img src="/img/gastroplast/scene-sauce-cake.webp" alt={d.products.gastro.dispensers.t} w={1600} h={900} className="aspect-[4/3] h-full w-full object-cover object-right" />
        <Img src="/img/gastroplast/scene-fruit.webp" alt={d.products.gastro.storage.t} w={1600} h={900} className="aspect-[4/3] h-full w-full object-cover" />
      </section>

      <section className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="gcerts">
        <div className="lg:col-span-7">
          <h2 id="gcerts" className="h2">{g.certTitle}</h2>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {g.certs.map((c) => (
              <li key={c.t} className="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <span className="font-serif text-xl text-navy">{c.t}</span>
                <span className="self-center text-muted">{c.d}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-12 font-sans text-sm font-medium text-copper">{g.fairsTitle}</h3>
          <p className="mt-2 font-serif text-xl">{g.fairs.join(" · ")}</p>
          <p className="mt-8 text-sm text-muted">
            {d.common.source}:{" "}
            <a href={manufacturers.gastroplast.web} target="_blank" rel="noopener" className="underline hover:text-copper">
              gastroplast.com
            </a>{" "}
            · Gastroplast catalog
          </p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <Img src="/img/gastroplast/nsf-listing.webp" alt="NSF International — Gastroplast official listing" w={700} h={945} className="w-full bg-white shadow-[0_18px_40px_-24px_rgba(27,34,48,0.45)]" />
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
