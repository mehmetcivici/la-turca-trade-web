import type { Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { PageHero } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb, CatalogCards } from "./shared";

export function Catalogs({ locale, d }: { locale: Locale; d: Dict }) {
  const c = d.cat;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "catalogs", d.nav.catalogs)} />
      <Breadcrumb d={d} locale={locale} name={d.nav.catalogs} />
      <PageHero title={c.h1} lead={c.lead} />
      <section className="wrap pb-20 md:pb-28">
        <CatalogCards d={d} locale={locale} />
      </section>
      <section className="bg-paper-2 py-20 md:py-28" aria-labelledby="price">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="price" className="h2">{c.priceTitle}</h2>
            <p className="lead mt-5">{c.priceLead}</p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm d={d} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
