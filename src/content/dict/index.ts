/**
 * Site metinleri content/dict/*.json dosyalarındadır (yönetim panelinden düzenlenir).
 * Eksik bir alan olursa İspanyolca (ana dil) değer kullanılır; derleme kırılmaz.
 */
import type { Locale } from "@/i18n/config";
import es from "../../../content/dict/es.json";
import pt from "../../../content/dict/pt.json";
import en from "../../../content/dict/en.json";
import tr from "../../../content/dict/tr.json";

export type Dict = typeof es;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** base'deki eksik anahtarları over ile tamamlar (diziler olduğu gibi over'dan alınır). */
function fill<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || over === null ? base : over) as T;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(base)) out[k] = k in over ? fill((base as Record<string, unknown>)[k], over[k]) : (base as Record<string, unknown>)[k];
  for (const k of Object.keys(over)) if (!(k in out)) out[k] = over[k];
  return out as T;
}

const dicts: Record<Locale, Dict> = {
  es,
  pt: fill(es, pt),
  en: fill(es, en),
  tr: fill(es, tr),
};

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}
