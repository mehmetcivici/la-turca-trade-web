export const locales = ["es", "pt", "en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const localeNames: Record<Locale, string> = {
  es: "Español",
  pt: "Português",
  en: "English",
  tr: "Türkçe",
};

/** hreflang değerleri: İspanyolca tüm Latin Amerika'yı, Portekizce Brezilya'yı hedefler. */
export const hrefLang: Record<Locale, string> = { es: "es", pt: "pt-BR", en: "en", tr: "tr" };
export const ogLocale: Record<Locale, string> = { es: "es_419", pt: "pt_BR", en: "en_US", tr: "tr_TR" };

export type PageKey =
  | "home"
  | "starTermos"
  | "gastroplast"
  | "distributors"
  | "privateLabel"
  | "catalogs"
  | "about"
  | "contact";

export type SubPageKey = Exclude<PageKey, "home">;

/** Her dilde yerelleştirilmiş adresler (SEO için). */
export const slugs: Record<SubPageKey, Record<Locale, string>> = {
  starTermos: { es: "star-termos", pt: "star-termos", en: "star-termos", tr: "star-termos" },
  gastroplast: { es: "gastroplast", pt: "gastroplast", en: "gastroplast", tr: "gastroplast" },
  distributors: { es: "distribuidores", pt: "distribuidores", en: "distributors", tr: "distributorler" },
  privateLabel: { es: "marca-propia", pt: "marca-propria", en: "private-label", tr: "ozel-marka" },
  catalogs: { es: "catalogos", pt: "catalogos", en: "catalogs", tr: "kataloglar" },
  about: { es: "nosotros", pt: "sobre-nos", en: "about", tr: "hakkimizda" },
  contact: { es: "contacto", pt: "contato", en: "contact", tr: "iletisim" },
};

export const subPages = Object.keys(slugs) as SubPageKey[];

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export function href(locale: Locale, key: PageKey, hash?: string): string {
  const base = key === "home" ? `/${locale}/` : `/${locale}/${slugs[key][locale]}/`;
  return hash ? `${base}#${hash}` : base;
}

export function pageFromSlug(locale: Locale, slug: string): SubPageKey | undefined {
  return subPages.find((k) => slugs[k][locale] === slug);
}

/** /es/contacto/ → { locale: "es", key: "contact" } */
export function parsePath(pathname: string): { locale: Locale; key: PageKey } | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length || !isLocale(parts[0])) return undefined;
  const locale = parts[0];
  if (parts.length === 1) return { locale, key: "home" };
  const key = pageFromSlug(locale, parts[1]);
  return key ? { locale, key } : undefined;
}
