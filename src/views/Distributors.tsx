import Link from "@/components/L";
import { Building2, ShoppingCart, Store, UtensilsCrossed, Gift } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, DefList, Faq, PageBanner, SectionHead, Steps } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { CtaBand, crumbs } from "./shared";

const WHO_ICONS = [Building2, Store, UtensilsCrossed, Gift, ShoppingCart];

export function Distributors({ locale, d }: { locale: Locale; d: Dict }) {
  const x = d.dist;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "distributors", d.nav.distributors)} />
      <JsonLd data={faqSchema(x.faq)} />
      <PageBanner
        title={x.h1}
        lead={x.lead}
        kicker="B2B"
        image={{ src: "/img/star-termos/lineup.webp", w: 1582, h: 986, alt: "Star Termos", pos: "object-[70%_60%]" }}
        crumbs={crumbs(d, locale, d.nav.distributors)}
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

      <section className="wrap py-20 md:py-28" aria-labelledby="who">
        <SectionHead id="who" kicker="La Turca Trade" title={x.whoTitle} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {x.who.map((w, i) => {
            const Icon = WHO_ICONS[i % WHO_ICONS.length];
            return (
              <li key={w.t} className="card card-hover p-7">
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

      <section className="bg-navy py-20 text-white md:py-28" aria-labelledby="steps">
        <div className="wrap">
          <SectionHead id="steps" kicker="1 → 6" title={x.stepsTitle} light />
          <div className="mt-12">
            <Steps items={x.steps} light />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="terms">
        <div className="lg:col-span-4">
          <SectionHead id="terms" kicker="FOB · CFR · CIF" title={x.termsTitle} />
        </div>
        <div className="lg:col-span-8">
          <DefList items={x.terms} />
        </div>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="dfaq">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead id="dfaq" kicker="FAQ" title={x.faqTitle} />
          </div>
          <div className="lg:col-span-8">
            <Faq items={x.faq} />
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
