import type { Locale } from "@/i18n/config";
import type { Dict } from "@/content/dict";
import { site } from "@/content/site";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "./shared";

export function Contact({ locale, d }: { locale: Locale; d: Dict }) {
  const c = d.contact;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, d, "contact", d.nav.contact)} />
      <Breadcrumb d={d} locale={locale} name={d.nav.contact} />
      <section className="wrap grid gap-14 pb-24 pt-10 lg:grid-cols-12 lg:pt-14">
        <div className="lg:col-span-4">
          <h1 className="display">{c.h1}</h1>
          <p className="lead mt-6">{c.lead}</p>
          <dl className="mt-10 space-y-6 border-t border-line pt-6">
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
                {site.city}, {site.country}
              </dd>
              <dd className="mt-1 text-[0.95rem] text-muted">{c.hours}</dd>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <div className="bg-card p-6 md:p-10">
            <ContactForm d={d} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
