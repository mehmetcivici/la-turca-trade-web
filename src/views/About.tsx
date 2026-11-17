import Link from "@/components/L";
import { ShieldCheck, Camera, Clock, CalendarCheck } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, Img, PageBanner, SectionHead } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { CtaBand, crumbs } from "./shared";

const ICONS = [ShieldCheck, Camera, Clock, CalendarCheck];

export function About({ locale, d }: { locale: Locale; d: Dict }) {
  const a = d.about;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "about", d.nav.about)} />
      <PageBanner
        title={a.h1}
        lead={a.lead}
        kicker={`${d.contact.office} · İstanbul`}
        image={{ src: "/img/star-termos/scene-tea-table.webp", w: 1378, h: 919, alt: "Star Termos" }}
        crumbs={crumbs(d, locale, d.nav.about)}
      />

      <section className="wrap grid items-center gap-10 py-20 md:py-24 lg:grid-cols-12">
        <div className="space-y-5 text-[1.08rem] leading-relaxed text-ink/85 lg:col-span-7">
          {a.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <div className="lg:col-span-5">
          <Img src="/img/star-termos/scene-red-jug.webp" alt="Star Termos" w={1279} h={966} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="commit">
        <div className="wrap">
          <SectionHead id="commit" kicker="La Turca Trade" title={a.commitTitle} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {a.commits.map((c, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li key={c.t} className="card card-hover p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-copper-l">
                    <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl leading-tight text-navy">{c.t}</h3>
                  <p className="mt-2 text-muted">{c.d}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="why">
        <div className="lg:col-span-4">
          <SectionHead id="why" kicker="Türkiye" title={a.whyTitle} />
        </div>
        <div className="space-y-5 text-[1.08rem] leading-relaxed text-ink/85 lg:col-span-7">
          {a.why.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href={href(locale, "starTermos")} className="btn btn-dark">
              Star Termos <Arrow />
            </Link>
            <Link href={href(locale, "gastroplast")} className="btn btn-line text-navy">
              Gastroplast <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
