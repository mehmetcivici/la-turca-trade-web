import Link from "next/link";
import { Stamp, Palette, Package, FileText } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, Img, PageBanner, SectionHead, Steps } from "@/components/ui";
import { BoxDieline } from "@/components/BoxDieline";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { CtaBand, crumbs } from "./shared";

const ICONS = [Stamp, Palette, Package, FileText];

export function PrivateLabel({ locale, d }: { locale: Locale; d: Dict }) {
  const p = d.pl;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "privateLabel", d.nav.privateLabel)} />
      <PageBanner
        title={p.h1}
        lead={p.lead}
        kicker="OEM · ODM"
        image={{ src: "/img/star-termos/travel-mugs.webp", w: 900, h: 900, alt: "Star Termos", pos: "object-center" }}
        crumbs={crumbs(d, locale, d.nav.privateLabel)}
      >
        <Link href={href(locale, "contact")} className="btn btn-amber mt-8">
          {d.common.quote} <Arrow />
        </Link>
      </PageBanner>

      <section className="wrap grid gap-6 py-20 md:grid-cols-12 md:py-24">
        <div className="card flex items-center p-6 md:col-span-7 md:p-10">
          <BoxDieline brand={p.mock} label={p.whatTitle} />
        </div>
        <div className="grid grid-cols-2 gap-6 md:col-span-5 md:grid-cols-1">
          <Img src="/img/star-termos/steel-jug.webp" alt="Star Termos" w={900} h={900} className="aspect-square h-full w-full rounded-2xl object-cover md:aspect-[16/10]" />
          <Img src="/img/star-termos/thermbox-family.webp" alt="Star Termos Thermbox" w={900} h={900} className="aspect-square h-full w-full rounded-2xl object-cover md:aspect-[16/10]" />
        </div>
      </section>

      <section className="wrap pb-20 md:pb-28" aria-labelledby="what">
        <SectionHead id="what" kicker={p.mock} title={p.whatTitle} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.what.map((w, i) => {
            const Icon = ICONS[i % ICONS.length];
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

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="plsteps">
        <div className="wrap">
          <SectionHead id="plsteps" kicker="1 → 4" title={p.stepsTitle} />
          <div className="mt-12">
            <Steps items={p.steps} />
          </div>
          <div className="mt-8 max-w-3xl space-y-2 rounded-xl border-l-4 border-amber bg-white p-5 text-muted">
            <p>{p.note}</p>
            <p>{p.gastroNote}</p>
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
