import type { Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { site } from "@/content/site";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { PageBanner } from "@/components/ui";
import { crumbs } from "./shared";

export function Contact({ locale, d }: { locale: Locale; d: Dict }) {
  const c = d.contact;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "contact", d.nav.contact)} />
      <PageBanner
        title={c.h1}
        lead={c.lead}
        kicker="ES · PT · EN · TR"
        image={{ src: "/img/star-termos/lineup.webp", w: 1582, h: 986, alt: "Star Termos", pos: "object-[70%_60%]" }}
        crumbs={crumbs(d, locale, d.nav.contact)}
      />
      <section className="wrap grid gap-8 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <dl className="card space-y-6 p-7">
            {site.email && (
              <div>
                <dt className="text-sm text-muted">{c.direct}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className="font-serif text-xl hover:text-copper">
                    {site.email}
                  </a>
                </dd>
              </div>
            )}
            {site.phone && (
              <div>
                <dt className="text-sm text-muted">{d.form.phone}</dt>
                <dd className="mt-1">
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-lg hover:text-copper">
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            {site.whatsapp && (
              <div>
                <dt className="text-sm text-muted">WhatsApp</dt>
                <dd className="mt-1">
                  <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener" className="text-lg hover:text-copper">
                    +{site.whatsapp}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted">{c.office}</dt>
              <dd className="mt-1 text-lg">
                {site.address && <>{site.address}<br /></>}
                {site.postalCode && `${site.postalCode} `}{site.city}, {site.country}
              </dd>
              <dd className="mt-1 text-[0.95rem] text-muted">{c.hours}</dd>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-8">
          <div className="card p-6 shadow-soft md:p-10">
            <ContactForm d={d} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
