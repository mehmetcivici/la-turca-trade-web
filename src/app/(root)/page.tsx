import { locales, localeNames } from "@/i18n/config";
import { getDict } from "@/content/dict";
import { Logo } from "@/components/Logo";
import { asset, BASE_PATH } from "@/lib/asset";

/**
 * Kök adres. Apache .htaccess tarayıcı diline göre yönlendirir; bu sayfa yalnızca yönlendirme
 * çalışmazsa görünür (JS ile dil algılar, yoksa bağlantılar).
 */
const detect = `(function(){try{var b=${JSON.stringify(BASE_PATH)};var l=(navigator.languages&&navigator.languages[0]||navigator.language||'es').toLowerCase().slice(0,2);var m={pt:1,en:1,tr:1,es:1};location.replace(b+'/'+(m[l]?l:'es')+'/');}catch(e){}})();`;

export default function RootPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <script dangerouslySetInnerHTML={{ __html: detect }} />
      <div className="w-full max-w-md text-center">
        <Logo className="mx-auto h-16 w-auto" />
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {locales.map((l) => (
            <li key={l}>
              <a href={asset(`/${l}/`)} hrefLang={l} lang={l} className="flex items-baseline justify-between py-4 font-serif text-2xl hover:text-copper">
                {localeNames[l]}
                <span className="font-sans text-sm text-muted">{getDict(l).langPage.lead}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
