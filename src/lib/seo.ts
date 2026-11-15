import type { Metadata } from "next";
import { locales, hrefLang, ogLocale, href, type Locale, type PageKey } from "@/i18n/config";
import { site } from "@/content/site";
import { IS_PREVIEW } from "./asset";

export function abs(path: string) {
  return `${site.url}${path}`;
}

export function alternates(key: PageKey, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[hrefLang[l]] = abs(href(l, key));
  languages["x-default"] = abs(href("es", key));
  return { canonical: abs(href(locale, key)), languages };
}

export function pageMetadata(opts: {
  locale: Locale;
  key: PageKey;
  title: string;
  description: string;
  image?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const { locale, key, title, description, image = "/img/star-termos/lineup.webp" } = opts;
  const fullTitle = opts.absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: alternates(key, locale),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description,
      url: abs(href(locale, key)),
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [{ url: abs(image) }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [abs(image)] },
    ...(IS_PREVIEW ? { robots: { index: false, follow: false } } : {}),
  };
}
