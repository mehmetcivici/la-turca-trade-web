import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDict } from "@/content/dict";
import { pageMetadata } from "@/lib/seo";
import { Home } from "@/views/Home";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDict(locale);
  return pageMetadata({ locale, key: "home", title: `${d.home.title} | La Turca Trade`, description: d.home.description, absoluteTitle: true });
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Home locale={locale} d={getDict(locale)} />;
}
