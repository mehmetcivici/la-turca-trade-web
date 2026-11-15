import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, DefList, Faq, Img, PageHero, Steps } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { Breadcrumb, CtaBand } from "./shared";

export function Distributors({ locale, d }: { locale: Locale; d: Dict }) {
  const x = d.dist;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "distributors", d.nav.distributors)} />
      <JsonLd data={faqSchema(x.faq)} />
      <Breadcrumb d={d} locale={locale} name={d.nav.distributors} />
      <PageHero title={x.h1} lead={x.lead}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={href(locale, "contact")} className="btn btn-dark">
            {d.common.priceList} <Arrow />
          </Link>
          <Link href={href(locale, "catalogs")} className="btn btn-line">
            {d.common.catalogs}
          </Link>
        </div>
      </PageHero>

      <Img src="/img/star-termos/lineup.webp" alt="Star Termos" w={1582} h={986} priority className="h-[44vw] max-h-[64vh] w-full object-cover object-[50%_60%]" />

      <section className="wrap py-20 md:py-28" aria-labelledby="who">
        <h2 id="who" className="h2">{x.whoTitle}</h2>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {x.who.map((w) => (
            <li key={w.t} className="border-t border-line py-6">
              <h3 className="font-serif text-[1.22rem] leading-tight">{w.t}</h3>
              <p className="mt-2 text-muted">{w.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-navy py-20 text-paper md:py-28" aria-labelledby="steps">
        <div className="wrap">
          <h2 id="steps" className="h2">{x.stepsTitle}</h2>
          <div className="mt-12">
            <Steps items={x.steps} light />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="terms">
        <h2 id="terms" className="h2 lg:col-span-4">{x.termsTitle}</h2>
        <div className="lg:col-span-8">
          <DefList items={x.terms} />
        </div>
      </section>

      <section className="wrap grid gap-10 pb-20 md:pb-28 lg:grid-cols-12" aria-labelledby="dfaq">
        <h2 id="dfaq" className="h2 lg:col-span-4">{x.faqTitle}</h2>
        <div className="lg:col-span-8">
          <Faq items={x.faq} />
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
