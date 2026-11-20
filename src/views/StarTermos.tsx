import Link from "@/components/L";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { catalogFor, catalogs, manufacturers } from "@/content/site";
import { asset } from "@/lib/asset";
import { starGroups, starSeries } from "@/content/products";
import { Arrow, Check, Download, Faq, Img, PageBanner, SectionHead, Stats } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { CtaBand, SeriesCard, crumbs } from "./shared";
import { LoadingTable } from "./Home";
import { altFor } from "@/content/alts";

export function StarTermos({ locale, d }: { locale: Locale; d: Dict }) {
  const s = d.star;
  const cat = catalogFor(catalogs.find((c) => c.id === "star-termos")!, locale);
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "starTermos", "Star Termos")} />
      <JsonLd data={faqSchema(s.faq)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: s.seriesTitle + " — Star Termos",
          itemListElement: starSeries.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: `Star Termos ${x.name} ${x.capacity}` })),
        }}
      />
      <PageBanner
        title={s.h1}
        kicker={s.sub}
        lead={d.home.star.lead}
        image={{ src: "/img/star-termos/scene-jugs-stone.webp", w: 1283, h: 969, alt: altFor("/img/star-termos/scene-jugs-stone.webp", locale, "Star Termos") }}
        crumbs={crumbs(d, locale, "Star Termos")}
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
        <Stats items={s.facts} className="shadow-soft" />
      </div>

      <section className="wrap grid items-center gap-10 py-20 md:py-24 lg:grid-cols-12">
        <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink/85 lg:col-span-7">
          {s.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <a href={manufacturers.starTermos.web} target="_blank" rel="noopener" className="link-arrow text-navy">
            {d.common.officialSite} <Arrow />
          </a>
        </div>
        <div className="lg:col-span-5">
          <Img src="/img/star-termos/elegant-garden.webp" alt="Star Termos Elegant" w={1100} h={1650} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="series">
        <div className="wrap">
          <SectionHead id="series" kicker="Star Termos" title={s.seriesTitle} />
          <div className="mt-10 space-y-16">
            {starGroups.map((g) => (
              <div key={g}>
                <div className="flex flex-col gap-1 border-l-4 border-amber pl-4">
                  <h3 className="h3 text-navy">{d.products.groups[g].t}</h3>
                  <p className="text-muted">{d.products.groups[g].d}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                  {starSeries.filter((x) => x.group === g).map((x) => (
                    <SeriesCard key={x.id} s={x} d={d} locale={locale} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap grid gap-6 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="loading">
        <div className="lg:col-span-4">
          <SectionHead id="loading" kicker="40' HC" title={s.loadingTitle} lead={s.loadingLead} />
        </div>
        <div className="card p-6 md:p-8 lg:col-span-8">
          <LoadingTable d={d} locale={locale} />
          <p className="mt-4 text-sm text-muted">{d.home.container.note}</p>
        </div>
      </section>

      <section className="bg-navy py-20 text-white md:py-28" aria-labelledby="certs">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionHead id="certs" kicker="ISO · Sedex" title={s.certTitle} light />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {s.certs.map((c) => (
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
            <p className="mt-6 text-sm text-white/60">{s.certNote}</p>
          </div>
          <div className="flex items-end gap-5 lg:col-span-4 lg:col-start-9">
            <Img src="/img/star-termos/iso-9001.webp" alt="ISO 9001:2015 — Star Termos" w={700} h={990} className="w-2/3 rounded-lg bg-white shadow-soft" />
            <Img src="/img/brands/sedex.webp" alt="Sedex" w={600} h={600} className="w-1/4 rounded-lg bg-white p-2" />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="faq">
        <div className="lg:col-span-4">
          <SectionHead id="faq" kicker="FAQ" title={s.faqTitle} />
          <p className="mt-6 text-sm text-muted">
            {d.common.source}:{" "}
            <a href={manufacturers.starTermos.web} target="_blank" rel="noopener" className="underline hover:text-copper">
              startermos.com
            </a>{" "}
            · Star Termos E-Katalog 2025
          </p>
          <Link href={href(locale, "privateLabel")} className="btn btn-dark mt-6">
            {d.nav.privateLabel} <Arrow />
          </Link>
        </div>
        <div className="lg:col-span-8">
          <Faq items={s.faq} />
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
