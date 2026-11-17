import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import { locales, subPages, href, hrefLang, type Locale, type PageKey } from "@/i18n/config";
import { abs } from "@/lib/seo";

export const dynamic = "force-static";

/** Sayfanın içeriğini etkileyen dosyalar → git'teki son değişiklik tarihi = gerçek lastmod. */
const SOURCES: Record<PageKey, string[]> = {
  home: ["content/products.json", "content/site.json", "src/views/Home.tsx", "src/components/LoadCalculator.tsx"],
  starTermos: ["content/products.json", "src/views/StarTermos.tsx"],
  gastroplast: ["content/products.json", "src/views/Gastroplast.tsx"],
  distributors: ["src/views/Distributors.tsx"],
  privateLabel: ["src/views/PrivateLabel.tsx"],
  catalogs: ["content/site.json", "kataloglar", "src/views/Catalogs.tsx"],
  about: ["src/views/About.tsx"],
  contact: ["content/site.json", "src/views/Contact.tsx"],
  guide: ["content/products.json", "src/views/Guide.tsx"],
};

const cache = new Map<string, Date | undefined>();
function lastChange(paths: string[]): Date | undefined {
  const key = paths.join("|");
  if (cache.has(key)) return cache.get(key);
  let d: Date | undefined;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    d = out ? new Date(out) : undefined;
  } catch {
    d = undefined;
  }
  cache.set(key, d);
  return d;
}

function lastmod(key: PageKey, l: Locale): Date | undefined {
  return lastChange([`content/dict/${l}.json`, ...SOURCES[key]]);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const keys: PageKey[] = ["home", ...subPages];
  return keys.flatMap((key) =>
    locales.map((l) => ({
      url: abs(href(l, key)),
      lastModified: lastmod(key, l),
      changeFrequency: key === "home" || key === "catalogs" ? ("monthly" as const) : ("yearly" as const),
      priority: key === "home" ? 1 : key === "starTermos" || key === "gastroplast" || key === "distributors" || key === "guide" ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries([...locales.map((x) => [hrefLang[x], abs(href(x, key))]), ["x-default", abs(href("es", key))]]),
      },
    })),
  );
}
