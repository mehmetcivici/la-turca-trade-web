import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import { serif, sans } from "@/lib/fonts";
import { site } from "@/content/site";
import { BASE_PATH } from "@/lib/asset";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "La Turca Trade — Star Termos · Gastroplast",
  robots: { index: false, follow: true },
  verification: site.googleVerification ? { google: site.googleVerification } : undefined,
  alternates: {
    languages: { es: "/es/", "pt-BR": "/pt/", en: "/en/", tr: "/tr/", "x-default": "/es/" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Dil seçimi tarayıcıda: CSS/font beklemeden hemen yönlendir */}
        <script dangerouslySetInnerHTML={{ __html: langRedirect(BASE_PATH) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

function langRedirect(base: string) {
  return `(function(){try{var b=${JSON.stringify(base)};var l=(navigator.languages&&navigator.languages[0]||navigator.language||'es').toLowerCase().slice(0,2);var m={pt:1,en:1,tr:1,es:1};location.replace(b+'/'+(m[l]?l:'es')+'/');}catch(e){}})();`;
}
