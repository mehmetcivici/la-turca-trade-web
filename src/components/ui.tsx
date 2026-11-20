import type { ReactNode } from "react";
import Link from "@/components/L";
import { asset } from "@/lib/asset";

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  );
}

export function Download({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M10 3v10M5.5 8.5 10 13l4.5-4.5M4 17h12" />
    </svg>
  );
}

export function Check({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M4.5 10.5 8 14l7.5-8" />
    </svg>
  );
}

/** scripts/make-responsive.py ile aynı kural: /img altındaki WebP'lerin 640 ve 1080 px sürümleri. */
const VARIANTS = [640, 1080];
function srcSet(src: string, w: number): string | undefined {
  if (!src.startsWith("/img/") || !src.endsWith(".webp")) return undefined;
  const vs = VARIANTS.filter((v) => w > v + 100);
  if (!vs.length) return undefined;
  return [...vs.map((v) => `${asset(src.replace(/\.webp$/, `-${v}w.webp`))} ${v}w`), `${asset(src)} ${w}w`].join(", ");
}

export function Img({
  src, alt, w, h, className = "", priority = false, sizes = "100vw",
}: { src: string; alt: string; w: number; h: number; className?: string; priority?: boolean; sizes?: string }) {
  const set = srcSet(src, w);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} srcSet={set} sizes={set ? sizes : undefined} alt={alt} width={w} height={h} className={className} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />
  );
}

export function SectionHead({
  title,
  lead,
  kicker,
  id,
  className = "",
  light = false,
  center = false,
}: {
  title: string;
  lead?: string;
  kicker?: string;
  id?: string;
  className?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`}>
      {kicker && <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{kicker}</p>}
      <h2 id={id} className={`h2 ${kicker ? "mt-3" : ""} ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {lead && <p className={`mt-4 text-[1.08rem] leading-relaxed ${light ? "text-white/75" : "text-muted"}`}>{lead}</p>}
    </div>
  );
}

/** Rakam kartları. */
export function Stats({ items, className = "" }: { items: { v: string; l: string }[]; className?: string }) {
  return (
    <dl className={`grid overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {items.map((f, i) => (
        <div key={f.v} className={`p-6 md:p-7 ${i > 0 ? "border-t border-line sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""} border-line`}>
          <dt className="font-serif text-[1.55rem] leading-tight text-navy">{f.v}</dt>
          <dd className="mt-2 text-[0.95rem] leading-snug text-muted">{f.l}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Eski adla uyumluluk. */
export const Ledger = Stats;

export function Steps({ items, light = false }: { items: { t: string; d: string }[]; light?: boolean }) {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <li key={s.t} className={`rounded-2xl p-7 ${light ? "bg-white/[0.06] ring-1 ring-white/10" : "card"}`}>
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-amber font-bold text-navy-2">
            {i + 1}
          </span>
          <h3 className={`mt-5 font-serif text-xl leading-tight ${light ? "text-white" : "text-navy"}`}>{s.t}</h3>
          <p className={`mt-2 ${light ? "text-white/70" : "text-muted"}`}>{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function DefList({ items }: { items: { t: string; d: string }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((x) => (
        <div key={x.t} className="card p-6">
          <dt className="text-sm font-bold uppercase tracking-[0.06em] text-copper">{x.t}</dt>
          <dd className="mt-2 text-ink/85">{x.d}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="group card px-6 py-5 open:shadow-soft">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[1.05rem] font-bold text-navy [&::-webkit-details-marker]:hidden">
            {f.q}
            <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper-2 text-copper transition-transform group-open:rotate-45">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 4v12M4 10h12" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** İç sayfa başlık bandı: lacivert zemin + sağda fotoğraf + kırıntı yolu. */
export function PageBanner({
  title,
  lead,
  kicker,
  image,
  crumbs,
  children,
}: {
  title: string;
  lead?: string;
  kicker?: string;
  image: { src: string; w: number; h: number; alt: string; pos?: string };
  crumbs: { home: { label: string; href: string }; current: string };
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <Img src={image.src} alt={image.alt} w={image.w} h={image.h} priority className={`absolute inset-0 -z-20 h-full w-full object-cover ${image.pos ?? "object-center"}`} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
      <div className="absolute inset-0 -z-10 bg-navy/60 md:hidden" />
      <div className="wrap py-16 md:py-24">
        <nav aria-label="breadcrumb" className="text-sm text-white/65">
          <Link href={crumbs.home.href} className="hover:text-white">
            {crumbs.home.label}
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span aria-current="page" className="text-white">{crumbs.current}</span>
        </nav>
        <div className="mt-8 max-w-3xl">
          {kicker && <p className="eyebrow eyebrow-light">{kicker}</p>}
          <h1 className="display mt-4 text-white">{title}</h1>
          {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Geriye dönük uyumluluk (kullanılmıyorsa silinebilir). */
export function PageHero({ title, lead, children }: { kicker?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="wrap pb-14 pt-14">
      <h1 className="display max-w-5xl text-navy">{title}</h1>
      {lead && <p className="mt-6 max-w-3xl text-lg text-muted">{lead}</p>}
      {children}
    </section>
  );
}
