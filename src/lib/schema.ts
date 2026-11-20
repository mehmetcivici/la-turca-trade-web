import { site, manufacturers } from "@/content/site";
import { href, hrefLang, type Locale, type PageKey } from "@/i18n/config";
import { abs } from "./seo";
import type { Dict } from "@/content/dict";

export function orgSchema(locale: Locale, d: Dict) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#org`,
    name: site.name,
    url: abs(href(locale, "home")),
    logo: abs("/brand/lt-lacivert.png"),
    description: d.meta.siteDescription,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address || undefined,
      postalCode: site.postalCode || undefined,
      addressLocality: site.city,
      addressCountry: "TR",
    },
    contactPoint: site.email || site.phone ? [{
      "@type": "ContactPoint",
      contactType: "sales",
      email: site.email || undefined,
      telephone: site.phone || undefined,
      availableLanguage: ["Spanish", "Portuguese", "English", "Turkish"],
      areaServed: site.areaServed,
    }] : undefined,
    areaServed: site.areaServed.map((c) => ({ "@type": "Country", name: c })),
    knowsLanguage: ["es", "pt", "en", "tr"],
    brand: [
      { "@type": "Brand", name: manufacturers.starTermos.name },
      { "@type": "Brand", name: manufacturers.gastroplast.name },
    ],
    sameAs: [site.linkedin, site.instagram].filter(Boolean),
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    inLanguage: hrefLang[locale],
    publisher: { "@id": `${site.url}/#org` },
  };
}

export function breadcrumbSchema(locale: Locale, d: Dict, key: PageKey, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: d.common.home, item: abs(href(locale, "home")) },
      { "@type": "ListItem", position: 2, name, item: abs(href(locale, key)) },
    ],
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
