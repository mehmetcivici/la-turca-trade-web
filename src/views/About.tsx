import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { Arrow, Img } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb, CtaBand } from "./shared";

export function About({ locale, d }: { locale: Locale; d: Dict }) {
  const a = d.about;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "about", d.nav.about)} />
      <Breadcrumb d={d} locale={locale} name={d.nav.about} />
      <section className="wrap grid gap-12 pb-20 pt-10 lg:grid-cols-12 lg:pt-14">
        <div className="lg:col-span-7">
          <h1 className="display">{a.h1}</h1>
          <p className="mt-8 font-serif text-[1.4rem] leading-snug text-ink md:text-[1.7rem]">{a.lead}</p>
          <div className="mt-8 space-y-5 text-[1.08rem] leading-relaxed text-ink/85">
            {a.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <Img src="/img/star-termos/scene-red-jug.webp" alt="Star Termos" w={1279} h={966} className="aspect-square w-full rounded-md object-cover" />
          <p className="mt-4 text-sm text-muted">
            La Turca Trade · {d.contact.office}: İstanbul, Türkiye
          </p>
        </div>
      </section>

      <Img src="/img/star-termos/scene-tea-table.webp" alt="Star Termos" w={1378} h={919} className="h-[48vw] max-h-[68vh] w-full object-cover" />

      <section className="wrap py-20 md:py-28" aria-labelledby="commit">
        <h2 id="commit" className="h2">{a.commitTitle}</h2>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {a.commits.map((c) => (
            <li key={c.t} className="border-t border-line py-6">
              <h3 className="font-serif text-[1.22rem] leading-tight">{c.t}</h3>
              <p className="mt-2 text-muted">{c.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="why">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <h2 id="why" className="h2 lg:col-span-4">{a.whyTitle}</h2>
          <div className="space-y-5 text-[1.08rem] leading-relaxed text-ink/85 lg:col-span-7">
            {a.why.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <div className="flex flex-wrap gap-6 pt-4">
              <Link href={href(locale, "starTermos")} className="link-arrow">
                Star Termos <Arrow />
              </Link>
              <Link href={href(locale, "gastroplast")} className="link-arrow">
                Gastroplast <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand d={d} locale={locale} />
    </>
  );
}
