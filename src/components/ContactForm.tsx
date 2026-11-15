"use client";

import { useState, type FormEvent } from "react";
import { asset } from "@/lib/asset";
import type { Dict } from "@/content/dict";
import type { Locale } from "@/i18n/config";
import { site } from "@/content/site";

const COUNTRY_ORDER = ["AR", "BO", "BR", "CL", "CO", "EC", "PY", "PE", "UY", "VE", "MX", "PA", "CR", "DO", "GT"];

type State = "idle" | "sending" | "ok" | "error";

const field =
  "mt-1.5 block w-full rounded-[2px] border border-line bg-card px-3.5 py-3 text-ink placeholder:text-muted/60 focus:border-navy focus:outline-none";
const lab = "block text-[0.95rem] font-medium";

export function ContactForm({ d, locale, compact = false }: { d: Dict; locale: Locale; compact?: boolean }) {
  const [state, setState] = useState<State>("idle");
  const f = d.form;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("lang", locale);
    data.set("page", window.location.pathname);
    setState("sending");
    try {
      const res = await fetch(asset(site.formEndpoint), { method: "POST", body: data, headers: { Accept: "application/json" } });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) throw new Error("send");
      form.reset();
      setState("ok");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div role="status" className="border-l-2 border-copper bg-card px-6 py-8">
        <p className="font-serif text-xl leading-snug">{f.ok}</p>
      </div>
    );
  }

  const countries = COUNTRY_ORDER.map((c) => ({ c, n: d.countries[c] })).sort((a, b) => a.n.localeCompare(b.n, locale));

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      {/* bot tuzağı */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className={lab}>
        {f.name} <span className="text-copper">*</span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className={lab}>
        {f.company} <span className="text-copper">*</span>
        <input name="company" required autoComplete="organization" className={field} />
      </label>
      <label className={lab}>
        {f.email} <span className="text-copper">*</span>
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className={lab}>
        {f.phone}
        <input name="phone" type="tel" autoComplete="tel" className={field} />
      </label>
      <label className={lab}>
        {f.country} <span className="text-copper">*</span>
        <select name="country" required defaultValue="" className={field}>
          <option value="" disabled>
            {f.countryPlaceholder}
          </option>
          {countries.map(({ c, n }) => (
            <option key={c} value={n}>
              {n}
            </option>
          ))}
          <option value="—">{f.otherCountry}</option>
        </select>
      </label>
      <label className={lab}>
        {f.type}
        <select name="type" defaultValue={f.types[0]} className={field}>
          {f.types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      {!compact && (
        <fieldset className="sm:col-span-2">
          <legend className={lab}>{f.interest}</legend>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {f.interests.map((t) => (
              <label key={t} className="inline-flex items-center gap-2 text-[0.98rem]">
                <input type="checkbox" name="interest" value={t} className="h-4 w-4 accent-[#263658]" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className={`${lab} sm:col-span-2`}>
        {f.message}
        <textarea name="message" rows={compact ? 3 : 5} placeholder={f.messagePlaceholder} className={field} />
      </label>

      <label className="flex items-start gap-3 text-[0.93rem] text-muted sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#263658]" />
        <span>{f.consent}</span>
      </label>

      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn btn-dark disabled:opacity-60">
          {state === "sending" ? f.sending : f.send}
        </button>
        {state === "error" && (
          <p role="alert" className="text-[0.95rem] text-copper">
            {f.error}{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
