import Link from "@/components/L";
import { Award, Factory, Layers, Ship } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { starGroups, starSeries, gastroCategories, tx } from "@/content/products";
import { Arrow, Check, DefList, Faq, Img, PageBanner, SectionHead, Steps } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { CatalogCards, CtaBand, crumbs } from "./shared";
import { altFor, logoAlt } from "@/content/alts";

const WHY_ICONS = [Factory, Award, Layers, Ship];

/** "Türk termos üreticileri" rehberi: alıcının aradığı bilgiyi veren giriş sayfası. */
export function Guide({ locale, d }: { locale: Locale; d: Dict }) {
  const g = d.guide;
  const makers = [
    { key: "starTermos" as const, logo: "/img/brands/star-termos.webp", lw: 500, lh: 150, img: "/img/star-termos/scene-tea-table.webp", iw: 1378, ih: 919, data: d.home.star },
    { key: "gastroplast" as const, logo: "/img/brands/gastroplast.webp", lw: 600, lh: 231, img: "/img/gastroplast/gn-pc-black.webp", iw: 800, ih: 800, data: d.home.gastro },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "guide", d.nav.guide)} />
      <JsonLd data={faqSchema(g.faq)} />
      <PageBanner
        title={g.h1}
        kicker={g.kicker}
        lead={g.lead}
        image={{ src: "/img/star-termos/scene-jugs-stone.webp", w: 1283, h: 969, alt: altFor("/img/star-termos/scene-jugs-stone.webp", locale, "Star Termos") }}
        crumbs={crumbs(d, locale, d.nav.guide)}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={href(locale, "contact")} className="btn btn-amber">
            {d.common.priceList} <Arrow />
          </Link>
          <Link href={href(locale, "catalogs")} className="btn btn-light">
            {d.common.catalogs}
          </Link>
        </div>
      </PageBanner>

      {/* Neden Türkiye */}
      <section className="wrap py-20 md:py-24" aria-labelledby="why">
        <SectionHead id="why" kicker={g.kicker} title={g.whyTitle} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {g.why.map((w, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <li key={w.t} className="card p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-copper-l">
                  <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-xl leading-tight text-navy">{w.t}</h3>
                <p className="mt-2 text-muted">{w.d}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Üreticiler */}
      <section className="bg-paper-2 py-20 md:py-24" aria-labelledby="makers">
        <div className="wrap">
          <SectionHead id="makers" title={g.makersTitle} lead={g.makersLead} />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {makers.map((m) => (
              <article key={m.key} className="card grid overflow-hidden sm:grid-cols-[2fr_3fr]">
                <Img src={m.img} alt={altFor(m.img, locale, d.nav[m.key])} w={m.iw} h={m.ih} className="h-full min-h-48 w-full object-cover" />
                <div className="p-6">
                  <Img src={m.logo} alt={logoAlt(d.nav[m.key], locale)} w={m.lw} h={m.lh} className="h-8 w-auto" />
                  <p className="mt-4 text-[0.95rem] text-muted">{m.data.lead}</p>
                  <ul className="mt-4 space-y-2">
                    {m.data.facts.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.93rem]">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber/20 text-copper"><Check className="h-3.5 w-3.5" /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={href(locale, m.key)} className="link-arrow mt-5 text-navy">
                    {m.data.link} <Arrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ürün yelpazesi */}
      <section className="wrap py-20 md:py-24" aria-labelledby="range">
        <SectionHead id="range" title={g.rangeTitle} lead={g.rangeLead} />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <h3 className="font-serif text-2xl text-navy">Star Termos</h3>
            <dl className="mt-4 divide-y divide-line">
              {starGroups.map((gr) => (
                <div key={gr} className="py-3">
                  <dt className="font-bold">{d.products.groups[gr].t}</dt>
                  <dd className="mt-1 text-[0.95rem] text-muted">
                    {starSeries.filter((s) => s.group === gr).map((s) => `${s.name} (${s.capacity})`).join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
            <Link href={href(locale, "starTermos")} className="link-arrow mt-4 text-navy">{d.home.star.link} <Arrow /></Link>
          </div>
          <div className="card p-7">
            <h3 className="font-serif text-2xl text-navy">Gastroplast</h3>
            <dl className="mt-4 divide-y divide-line">
              {gastroCategories.map((c) => (
                <div key={c.id} className="py-3">
                  <dt className="font-bold">{tx(c.title, locale)}</dt>
                  <dd className="mt-1 text-[0.95rem] text-muted">{tx(c.desc, locale)}</dd>
                </div>
              ))}
            </dl>
            <Link href={href(locale, "gastroplast")} className="link-arrow mt-4 text-navy">{d.home.gastro.link} <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* Adım adım ithalat */}
      <section className="bg-navy py-20 text-white md:py-24" aria-labelledby="steps">
        <div className="wrap">
          <SectionHead id="steps" kicker="FOB · CFR · CIF" title={g.stepsTitle} light />
          <div className="mt-12">
            <Steps items={g.steps} light />
          </div>
        </div>
      </section>

      {/* Koşullar + hesaplayıcı */}
      <section className="wrap grid gap-10 py-20 md:py-24 lg:grid-cols-12" aria-labelledby="terms">
        <div className="lg:col-span-7">
          <SectionHead id="terms" title={g.termsTitle} />
          <div className="mt-8">
            <DefList items={d.dist.terms} />
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl bg-paper-2 p-7">
            <h2 className="h3 text-navy">{g.calcTitle}</h2>
            <p className="mt-3 text-muted">{g.calcLead}</p>
            <Link href={href(locale, "home", "container")} className="btn btn-dark mt-6">
              {g.calcLink} <Arrow />
            </Link>
          </div>
        </aside>
      </section>

      {/* Kataloglar */}
      <section className="bg-paper-2 py-20 md:py-24" aria-labelledby="cats">
        <div className="wrap">
          <SectionHead id="cats" kicker="PDF" title={d.home.catalogs.title} lead={d.home.catalogs.lead} />
          <div className="mt-10">
            <CatalogCards d={d} locale={locale} />
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="wrap grid gap-10 py-20 md:py-24 lg:grid-cols-12" aria-labelledby="gfaq">
        <div className="lg:col-span-4">
          <SectionHead id="gfaq" kicker="FAQ" title={g.faqTitle} />
        </div>
        <div className="lg:col-span-8">
          <Faq items={g.faq} />
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
