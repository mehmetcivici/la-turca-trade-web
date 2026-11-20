import type { Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { PageBanner, SectionHead } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { CatalogCards, crumbs } from "./shared";
import { altFor } from "@/content/alts";

export function Catalogs({ locale, d }: { locale: Locale; d: Dict }) {
  const c = d.cat;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "catalogs", d.nav.catalogs)} />
      <PageBanner
        title={c.h1}
        lead={c.lead}
        kicker="PDF"
        image={{ src: "/img/star-termos/scene-pastel-jugs.webp", w: 1374, h: 962, alt: altFor("/img/star-termos/scene-pastel-jugs.webp", locale, "Star Termos") }}
        crumbs={crumbs(d, locale, d.nav.catalogs)}
      />
      <section className="wrap py-20 md:py-24">
        <CatalogCards d={d} locale={locale} />
      </section>
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="price">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead id="price" kicker="USD · FOB · CIF" title={c.priceTitle} lead={c.priceLead} />
          </div>
          <div className="card p-6 md:p-10 lg:col-span-8">
            <ContactForm d={d} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
