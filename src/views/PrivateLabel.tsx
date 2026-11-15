import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, Img, PageHero, Steps } from "@/components/ui";
import { BoxDieline } from "@/components/BoxDieline";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb, CtaBand } from "./shared";

export function PrivateLabel({ locale, d }: { locale: Locale; d: Dict }) {
  const p = d.pl;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "privateLabel", d.nav.privateLabel)} />
      <Breadcrumb d={d} locale={locale} name={d.nav.privateLabel} />
      <PageHero title={p.h1} lead={p.lead}>
        <Link href={href(locale, "contact")} className="btn btn-dark mt-8">
          {d.common.quote} <Arrow />
        </Link>
      </PageHero>

      <section className="wrap grid gap-6 pb-20 md:grid-cols-12">
        <div className="flex items-center bg-card p-6 md:col-span-7 md:p-10">
          <BoxDieline brand={p.mock} label={p.whatTitle} />
        </div>
        <div className="grid grid-cols-2 gap-6 md:col-span-5 md:grid-cols-1">
          <Img src="/img/star-termos/travel-mugs.webp" alt="Star Termos" w={900} h={900} className="aspect-square h-full w-full object-cover md:aspect-[16/10]" />
          <Img src="/img/star-termos/thermbox-family.webp" alt="Star Termos Thermbox" w={900} h={900} className="aspect-square h-full w-full object-cover md:aspect-[16/10]" />
        </div>
      </section>

      <section className="wrap pb-20 md:pb-28" aria-labelledby="what">
        <h2 id="what" className="h2">{p.whatTitle}</h2>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {p.what.map((w) => (
            <li key={w.t} className="border-t border-line py-6">
              <h3 className="font-serif text-[1.6rem] leading-tight">{w.t}</h3>
              <p className="mt-2 text-muted">{w.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="plsteps">
        <div className="wrap">
          <h2 id="plsteps" className="h2">{p.stepsTitle}</h2>
          <div className="mt-12">
            <Steps items={p.steps} />
          </div>
          <div className="mt-10 max-w-3xl space-y-3 border-l-2 border-copper pl-5 text-muted">
            <p>{p.note}</p>
            <p>{p.gastroNote}</p>
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
