import type { MetadataRoute } from "next";
import { locales, subPages, href, hrefLang, type PageKey } from "@/i18n/config";
import { abs } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const keys: PageKey[] = ["home", ...subPages];
  const now = new Date();
  return keys.flatMap((key) =>
    locales.map((l) => ({
      url: abs(href(l, key)),
      lastModified: now,
      changeFrequency: key === "home" || key === "catalogs" ? ("monthly" as const) : ("yearly" as const),
      priority: key === "home" ? 1 : key === "starTermos" || key === "gastroplast" || key === "distributors" ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries([...locales.map((x) => [hrefLang[x], abs(href(x, key))]), ["x-default", abs(href("es", key))]]),
      },
    })),
  );
}
