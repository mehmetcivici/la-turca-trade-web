import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, slugs, subPages, isLocale, pageFromSlug, type Locale, type SubPageKey } from "@/i18n/config";
import { getDict, type Dict } from "@/content/dict";
import { pageMetadata } from "@/lib/seo";
import { StarTermos } from "@/views/StarTermos";
import { Gastroplast } from "@/views/Gastroplast";
import { Distributors } from "@/views/Distributors";
import { PrivateLabel } from "@/views/PrivateLabel";
import { Catalogs } from "@/views/Catalogs";
import { About } from "@/views/About";
import { Contact } from "@/views/Contact";
import { Guide } from "@/views/Guide";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => subPages.map((k) => ({ locale, slug: slugs[k][locale] })));
}

function meta(key: SubPageKey, d: Dict) {
  switch (key) {
    case "starTermos": return { t: d.star.title, s: d.star.description, img: "/img/star-termos/scene-tea-table.webp" };
    case "gastroplast": return { t: d.gastro.title, s: d.gastro.description, img: "/img/gastroplast/scene-pool.webp" };
    case "distributors": return { t: d.dist.title, s: d.dist.description, img: "/img/star-termos/lineup.webp" };
    case "privateLabel": return { t: d.pl.title, s: d.pl.description, img: "/img/star-termos/travel-mugs.webp" };
    case "catalogs": return { t: d.cat.title, s: d.cat.description, img: "/img/catalogs/gastroplast-cover.webp" };
    case "about": return { t: d.about.title, s: d.about.description, img: "/img/star-termos/scene-jugs-stone.webp" };
    case "contact": return { t: d.contact.title, s: d.contact.description, img: "/img/star-termos/lineup.webp" };
    case "guide": return { t: d.guide.title, s: d.guide.description, img: "/img/star-termos/scene-jugs-stone.webp" };
  }
}

async function resolve(params: Promise<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;
  const key = pageFromSlug(locale, slug);
  return key ? { locale, key } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const d = getDict(r.locale);
  const m = meta(r.key, d);
  return pageMetadata({ locale: r.locale, key: r.key, title: m.t, description: m.s, image: m.img });
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const r = await resolve(params);
  if (!r) notFound();
  const { locale, key } = r as { locale: Locale; key: SubPageKey };
  const d = getDict(locale);
  const props = { locale, d };
  switch (key) {
    case "starTermos": return <StarTermos {...props} />;
    case "gastroplast": return <Gastroplast {...props} />;
    case "distributors": return <Distributors {...props} />;
    case "privateLabel": return <PrivateLabel {...props} />;
    case "catalogs": return <Catalogs {...props} />;
    case "about": return <About {...props} />;
    case "contact": return <Contact {...props} />;
    case "guide": return <Guide {...props} />;
  }
}
