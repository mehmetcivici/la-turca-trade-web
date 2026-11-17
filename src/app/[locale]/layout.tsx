import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { serif, sans } from "@/lib/fonts";
import { locales, isLocale, hrefLang } from "@/i18n/config";
import { getDict } from "@/content/dict";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LangSuggest } from "@/components/LangSuggest";
import { ASSET_CDN } from "@/lib/asset";
import { JsonLd } from "@/components/JsonLd";
import { orgSchema, websiteSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  formatDetection: { telephone: false },
  verification: site.googleVerification ? { google: site.googleVerification } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#1F2F4A",
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  return (
    <html lang={hrefLang[locale]} className={`${serif.variable} ${sans.variable}`}>
      <head>{ASSET_CDN ? <link rel="preconnect" href={new URL(ASSET_CDN).origin} crossOrigin="anonymous" /> : null}</head>
      <body>
        <LangSuggest locale={locale} />
        <JsonLd data={orgSchema(locale, d)} />
        <JsonLd data={websiteSchema(locale)} />
        <Header locale={locale} d={d} />
        <main id="main">{children}</main>
        <Footer locale={locale} d={d} />
      </body>
    </html>
  );
}
