import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import { serif, sans } from "@/lib/fonts";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "La Turca Trade — Star Termos · Gastroplast",
  robots: { index: false, follow: true },
  alternates: {
    languages: { es: "/es/", "pt-BR": "/pt/", en: "/en/", tr: "/tr/", "x-default": "/es/" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
