import Link from "next/link";
import { asset } from "@/lib/asset";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { catalogs, manufacturers } from "@/content/site";
import { starGroups, starSeries } from "@/content/products";
import { Arrow, Download, Faq, Img, Ledger, SectionHead } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { Breadcrumb, CtaBand, SeriesCard } from "./shared";
import { LoadingTable } from "./Home";

export function StarTermos({ locale, d }: { locale: Locale; d: Dict }) {
  const s = d.star;
  const cat = catalogs.find((c) => c.id === "star-termos")!;
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
      <Breadcrumb d={d} locale={locale} name="Star Termos" />

      <section className="wrap grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:pb-24 lg:pt-14">
        <div className="lg:col-span-6 lg:pr-6">
          <p className="kicker">{s.sub}</p>
          <h1 className="display mt-4">{s.h1}</h1>
          <div className="mt-8 space-y-5 text-[1.08rem] leading-relaxed text-ink/85">
            {s.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href={asset(cat.file)} download className="btn btn-dark">
              <Download /> {d.common.download}
            </a>
            <a href={manufacturers.starTermos.web} target="_blank" rel="noopener" className="link-arrow text-[0.95rem]">
              {d.common.officialSite} <Arrow />
            </a>
          </div>
        </div>
        <div className="lg:col-span-6">
          <Img src="/img/star-termos/elegant-garden.webp" alt="Star Termos Elegant" w={1100} h={1650} priority className="aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <section className="wrap pb-16">
        <Ledger items={s.facts} />
      </section>

      <section className="wrap pb-20 md:pb-28" aria-labelledby="series">
        <h2 id="series" className="h2">{s.seriesTitle}</h2>
        <div className="mt-6 space-y-20">
          {starGroups.map((g) => {
            const list = starSeries.filter((x) => x.group === g);
            return (
              <div key={g} className="border-t border-line pt-8">
                <div className="grid gap-4 lg:grid-cols-12">
                  <h3 className="h3 lg:col-span-4">{d.products.groups[g].t}</h3>
                  <p className="text-muted lg:col-span-6">{d.products.groups[g].d}</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                  {list.map((x) => (
                    <SeriesCard key={x.id} s={x} d={d} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Img src="/img/star-termos/scene-jugs-stone.webp" alt="Star Termos" w={1283} h={969} className="h-[52vw] max-h-[70vh] w-full object-cover" />

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="loading">
        <div className="lg:col-span-4">
          <SectionHead id="loading" title={s.loadingTitle} lead={s.loadingLead} />
        </div>
        <div className="lg:col-span-8">
          <LoadingTable d={d} locale={locale} />
          <p className="mt-4 text-sm text-muted">{d.home.container.note}</p>
        </div>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="certs">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="certs" className="h2">{s.certTitle}</h2>
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {s.certs.map((c) => (
                <li key={c.t} className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <span className="font-serif text-xl text-navy">{c.t}</span>
                  <span className="self-center text-muted">{c.d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted">{s.certNote}</p>
          </div>
          <div className="flex items-start gap-6 lg:col-span-4 lg:col-start-9">
            <Img src="/img/star-termos/iso-9001.webp" alt="ISO 9001:2015 — Star Termos" w={700} h={990} className="w-2/3 bg-white shadow-[0_18px_40px_-24px_rgba(27,34,48,0.45)]" />
            <Img src="/img/brands/sedex.webp" alt="Sedex" w={600} h={600} className="w-1/4" />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="faq">
        <h2 id="faq" className="h2 lg:col-span-4">{s.faqTitle}</h2>
        <div className="lg:col-span-8">
          <Faq items={s.faq} />
          <p className="mt-6 text-sm text-muted">
            {d.common.source}:{" "}
            <a href={manufacturers.starTermos.web} target="_blank" rel="noopener" className="underline hover:text-copper">
              startermos.com
            </a>{" "}
            · Star Termos E-Katalog 2025
          </p>
          <Link href={href(locale, "privateLabel")} className="link-arrow mt-8">
            {d.nav.privateLabel} <Arrow />
          </Link>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
