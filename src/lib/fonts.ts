import { Besley, Manrope } from "next/font/google";

/** Başlıklar: Besley (laturcatrade.com ile aynı). Metin: Manrope. */
export const serif = Besley({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
