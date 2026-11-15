import type { Locale } from "@/i18n/config";
import es, { type Dict } from "./es";
import pt from "./pt";
import en from "./en";
import tr from "./tr";

const dicts: Record<Locale, Dict> = { es, pt, en, tr };

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}
export type { Dict };
