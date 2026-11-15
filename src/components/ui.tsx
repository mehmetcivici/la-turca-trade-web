import type { ReactNode } from "react";
import { asset } from "@/lib/asset";

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  );
}

export function Download({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M10 3v10M5.5 8.5 10 13l4.5-4.5M4 17h12" />
    </svg>
  );
}

export function SectionHead({ title, lead, kicker, id, className = "", light = false }: { title: string; lead?: string; kicker?: string; id?: string; className?: string; light?: boolean }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {kicker && <p className={light ? "kicker !text-copper-l" : "kicker"}>{kicker}</p>}
      <h2 id={id} className={`h2 ${kicker ? "mt-3" : ""}`}>
        {title}
      </h2>
      {lead && <p className={`mt-5 ${light ? "text-lg leading-relaxed text-paper/75" : "lead"}`}>{lead}</p>}
    </div>
  );
}

/** Hairline'lı bilgi satırı (sayaç değil, düz tablo). */
export function Ledger({ items, cols = 4, light = false }: { items: { v: string; l: string }[]; cols?: 2 | 3 | 4; light?: boolean }) {
  const grid = cols === 4 ? "lg:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <dl className={`grid gap-x-10 sm:grid-cols-2 ${grid}`}>
      {items.map((f) => (
        <div key={f.v} className={`border-t py-6 ${light ? "border-navy-line" : "border-line"}`}>
          <dt className={`font-serif text-[1.9rem] leading-[1.05] ${light ? "text-paper" : "text-navy"}`}>{f.v}</dt>
          <dd className={`mt-2 text-[0.98rem] leading-snug ${light ? "text-paper/70" : "text-muted"}`}>{f.l}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Steps({ items, light = false }: { items: { t: string; d: string }[]; light?: boolean }) {
  return (
    <ol className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <li key={s.t} className={`relative border-t py-7 pl-12 ${light ? "border-navy-line" : "border-line"}`}>
          <span
            aria-hidden="true"
            className={`absolute left-0 top-7 grid h-8 w-8 place-items-center rounded-full border font-serif text-lg ${light ? "border-copper-l text-copper-l" : "border-copper text-copper"}`}
          >
            {i + 1}
          </span>
          <h3 className={`font-serif text-2xl leading-tight ${light ? "text-paper" : ""}`}>{s.t}</h3>
          <p className={`mt-2 ${light ? "text-paper/70" : "text-muted"}`}>{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function DefList({ items }: { items: { t: string; d: string }[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((x) => (
        <div key={x.t} className="grid gap-1 py-5 md:grid-cols-[14rem_1fr] md:gap-8">
          <dt className="font-medium text-ink">{x.t}</dt>
          <dd className="text-muted">{x.d}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-[1.45rem] leading-snug [&::-webkit-details-marker]:hidden">
            {f.q}
            <span aria-hidden="true" className="mt-2 grid h-6 w-6 shrink-0 place-items-center text-copper transition-transform group-open:rotate-45">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M10 3v14M3 10h14" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function PageHero({ kicker, title, lead, children }: { kicker?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="wrap pb-14 pt-14 md:pb-20 md:pt-24">
      {kicker && <p className="kicker">{kicker}</p>}
      <h1 className="display mt-4 max-w-5xl">{title}</h1>
      {lead && <p className="lead mt-6 max-w-3xl">{lead}</p>}
      {children}
    </section>
  );
}

export function Img({ src, alt, w, h, className = "", priority = false }: { src: string; alt: string; w: number; h: number; className?: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt={alt} width={w} height={h} className={className} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />
  );
}
