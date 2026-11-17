"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";

export interface Loadable {
  id: string;
  code: string;
  brand: string;
  name: Record<Locale, string>;
  perBox: number;
  box: number[]; // cm: uzunluk, genişlik, yükseklik
}

export interface CalcText {
  title: string;
  lead: string;
  container: string;
  product: string;
  custom: string;
  customName: string;
  qty: string;
  unitPcs: string;
  unitBoxes: string;
  perBox: string;
  boxCm: string;
  boxes: string;
  volume: string;
  add: string;
  remove: string;
  total: string;
  used: string;
  free: string;
  fits: string;
  tight: string;
  over: string;
  fillMore: string;
  note: string;
  quote: string;
  empty: string;
  loadText: string;
}

/** Standart iç ölçüler (m). */
const CONTAINERS = [
  { id: "20dc", name: "20' DC", l: 5.898, w: 2.352, h: 2.393 },
  { id: "40dc", name: "40' DC", l: 12.032, w: 2.352, h: 2.393 },
  { id: "40hc", name: "40' HC", l: 12.032, w: 2.352, h: 2.698 },
] as const;
type ContainerId = (typeof CONTAINERS)[number]["id"];

/** Pratik yükleme sınırı: koli arası boşluklar, palet/istif kaybı. */
const PRACTICAL = 0.85;
const COLORS = ["#263658", "#C49E58", "#4F7A74", "#B5643C", "#7B6FA8", "#5B8DB8", "#9AA35A", "#A35A7A"];

interface Line {
  key: number;
  item: string; // loadable id ya da "custom"
  qty: number;
  unit: "pcs" | "box";
  cName: string;
  cPer: number;
  cL: number;
  cW: number;
  cH: number;
}

let seq = 0;
const newLine = (item: string, qty: number): Line => ({ key: ++seq, item, qty, unit: "pcs", cName: "", cPer: 12, cL: 50, cW: 40, cH: 40 });

const fmtLocale = (l: Locale) => (l === "pt" ? "pt-BR" : l === "es" ? "es-ES" : l);

export function LoadCalculator({ t, items, locale, contactHref }: { t: CalcText; items: Loadable[]; locale: Locale; contactHref: string }) {
  const [cid, setCid] = useState<ContainerId>("40hc");
  const [lines, setLines] = useState<Line[]>(() => [newLine(items[0]?.id ?? "custom", 3000), newLine(items.find((i) => i.id === "tb-6175")?.id ?? items[1]?.id ?? "custom", 6000)]);
  const nf = useMemo(() => new Intl.NumberFormat(fmtLocale(locale), { maximumFractionDigits: 0 }), [locale]);
  const nf1 = useMemo(() => new Intl.NumberFormat(fmtLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }), [locale]);
  const c = CONTAINERS.find((x) => x.id === cid)!;
  const cap = c.l * c.w * c.h;

  const rows = lines.map((ln, i) => {
    const it = items.find((x) => x.id === ln.item);
    const per = Math.max(1, Math.round(it ? it.perBox : ln.cPer || 1));
    const [L, W, H] = it ? it.box : [ln.cL, ln.cW, ln.cH];
    const boxVol = Math.max(0, (L * W * H) / 1e6);
    const qty = Math.max(0, Math.floor(ln.qty || 0));
    const boxes = ln.unit === "box" ? qty : Math.ceil(qty / per);
    const units = ln.unit === "box" ? qty * per : qty;
    const label = it ? `${it.code} · ${it.name[locale] || it.name.es}` : ln.cName || t.custom;
    return { ln, it, per, boxVol, boxes, units, vol: boxes * boxVol, label, color: COLORS[i % COLORS.length] };
  });
  const total = rows.reduce((a, r) => a + r.vol, 0);
  const fill = total / cap;
  const needed = Math.max(1, Math.ceil(total / (cap * PRACTICAL)));
  const status = total === 0 ? "empty" : fill <= PRACTICAL ? "fits" : fill <= 1 ? "tight" : "over";
  const freePractical = Math.max(0, cap * PRACTICAL - total);
  const first = rows.find((r) => r.boxVol > 0 && r.it);
  const moreUnits = first ? Math.floor(freePractical / first.boxVol) * first.per : 0;

  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const summary = [
    `${t.loadText} — ${c.name}`,
    ...rows.filter((r) => r.boxes > 0).map((r) => `• ${r.label}: ${nf.format(r.units)} ${t.unitPcs} (${nf.format(r.boxes)} ${t.unitBoxes}, ${nf1.format(r.vol)} m³)`),
    `${t.total}: ${nf1.format(total)} m³ · ${nf.format(Math.round(fill * 100))} % ${t.used}`,
  ].join("\n");

  const msg = (s: string) => s.replace("{c}", c.name).replace("{n}", nf.format(needed));
  const brands = Array.from(new Set(items.map((i) => i.brand)));

  // Çizim
  const VW = 640, VH = 150, PX = 14, PY = 18, IW = VW - PX * 2, IH = VH - PY * 2;
  let x = PX;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Girdi */}
      <div className="rounded-2xl bg-white p-5 text-ink md:p-7 lg:col-span-7">
        <fieldset>
          <legend className="text-sm font-bold uppercase tracking-[0.06em] text-copper">{t.container}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {CONTAINERS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setCid(k.id)}
                aria-pressed={cid === k.id}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${cid === k.id ? "border-navy bg-navy text-white" : "border-line hover:border-navy"}`}
              >
                <span className="block font-bold">{k.name}</span>
                <span className={`tabular block text-xs ${cid === k.id ? "text-white/70" : "text-muted"}`}>≈ {nf1.format(k.l * k.w * k.h)} m³</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.ln.key} className="rounded-xl border border-line p-4" style={{ borderLeft: `5px solid ${r.color}` }}>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="text-sm font-semibold">
                  {t.product}
                  <select
                    value={r.ln.item}
                    onChange={(e) => update(r.ln.key, { item: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2.5 font-medium"
                  >
                    {brands.map((b) => (
                      <optgroup key={b} label={b}>
                        {items.filter((i) => i.brand === b).map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.code} · {i.name[locale] || i.name.es}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">{t.custom}</option>
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <label className="text-sm font-semibold">
                    {t.qty}
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={r.ln.qty || ""}
                      onChange={(e) => update(r.ln.key, { qty: Number(e.target.value) })}
                      className="tabular mt-1 block w-28 rounded-lg border border-line px-3 py-2.5 font-medium"
                    />
                  </label>
                  <select
                    aria-label={t.qty}
                    value={r.ln.unit}
                    onChange={(e) => update(r.ln.key, { unit: e.target.value as Line["unit"] })}
                    className="rounded-lg border border-line bg-white px-2 py-2.5 font-medium"
                  >
                    <option value="pcs">{t.unitPcs}</option>
                    <option value="box">{t.unitBoxes}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setLines((ls) => ls.filter((l) => l.key !== r.ln.key))}
                    title={t.remove}
                    aria-label={t.remove}
                    className="h-[46px] rounded-lg border border-line px-3 text-muted hover:border-navy hover:text-navy"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {!r.it && (
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <label className="text-sm font-semibold">
                    {t.customName}
                    <input value={r.ln.cName} onChange={(e) => update(r.ln.key, { cName: e.target.value })} className="mt-1 block w-full rounded-lg border border-line px-3 py-2" />
                  </label>
                  <label className="text-sm font-semibold">
                    {t.perBox}
                    <input type="number" min={1} value={r.ln.cPer || ""} onChange={(e) => update(r.ln.key, { cPer: Number(e.target.value) })} className="tabular mt-1 block w-24 rounded-lg border border-line px-3 py-2" />
                  </label>
                  <fieldset className="text-sm font-semibold">
                    <legend>{t.boxCm}</legend>
                    <div className="mt-1 flex items-center gap-1">
                      {(["cL", "cW", "cH"] as const).map((k, i) => (
                        <span key={k} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted">×</span>}
                          <input type="number" min={1} aria-label={`${t.boxCm} ${i + 1}`} value={r.ln[k] || ""} onChange={(e) => update(r.ln.key, { [k]: Number(e.target.value) } as Partial<Line>)} className="tabular w-16 rounded-lg border border-line px-2 py-2" />
                        </span>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}
              <p className="tabular mt-3 text-sm text-muted">
                {nf.format(r.boxes)} {t.unitBoxes} · {nf.format(r.units)} {t.unitPcs} · {nf1.format(r.vol)} m³
                {r.it && <> · {r.it.box.map((v) => nf1.format(v)).join(" × ")} cm · {r.per}/{t.unitBoxes}</>}
              </p>
            </div>
          ))}
          <button type="button" onClick={() => setLines((ls) => [...ls, newLine(items[0]?.id ?? "custom", 1000)])} className="btn btn-line text-navy">
            {t.add}
          </button>
        </div>
      </div>

      {/* Sonuç */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 rounded-2xl bg-white p-5 text-ink md:p-7">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={`${c.name}: ${nf.format(Math.round(fill * 100))} %`}>
            <rect x={PX - 6} y={PY - 6} width={IW + 12} height={IH + 12} fill="none" stroke="#263658" strokeWidth={2} rx={3} />
            <rect x={PX} y={PY} width={IW} height={IH} fill="#F4F1EA" />
            {rows.map((r) => {
              const w = Math.min(IW - (x - PX), (r.vol / cap) * IW);
              const el = w > 0 ? <rect key={r.ln.key} x={x} y={PY} width={w} height={IH} fill={r.color} opacity={0.92} /> : null;
              x += Math.max(0, w);
              return el;
            })}
            <line x1={PX + IW * PRACTICAL} y1={PY - 10} x2={PX + IW * PRACTICAL} y2={PY + IH + 10} stroke="#B5643C" strokeWidth={2} strokeDasharray="5 4" />
            <text x={PX + IW * PRACTICAL} y={PY - 8} textAnchor="middle" fontSize={11} fill="#8E6A28" fontFamily="var(--font-sans)">85 %</text>
            {fill > 1 && <text x={PX + IW - 8} y={PY + IH / 2 + 6} textAnchor="end" fontSize={18} fontWeight={700} fill="#fff" fontFamily="var(--font-sans)">+{nf.format(Math.round((fill - 1) * 100))} %</text>}
          </svg>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{c.name}</p>
              <p className="tabular font-serif text-4xl text-navy">
                {nf.format(Math.round(fill * 100))} <span className="text-2xl">%</span>
              </p>
            </div>
            <div className="text-right text-sm text-muted">
              <p className="tabular">
                {t.total}: <b className="text-ink">{nf1.format(total)} m³</b>
              </p>
              <p className="tabular">
                {t.free}: <b className="text-ink">{nf1.format(Math.max(0, cap - total))} m³</b>
              </p>
            </div>
          </div>

          <p
            className={`mt-4 rounded-xl px-4 py-3 text-[0.95rem] font-semibold ${
              status === "fits" ? "bg-[#e3f1e9] text-[#1f7a4d]" : status === "tight" ? "bg-[#fbf0d9] text-[#7a5200]" : status === "over" ? "bg-[#f9e1df] text-[#b3261e]" : "bg-paper-2 text-muted"
            }`}
          >
            {status === "empty" ? t.empty : status === "fits" ? msg(t.fits) : status === "tight" ? t.tight : msg(t.over)}
          </p>
          {status === "fits" && first && moreUnits > 0 && (
            <p className="mt-2 text-sm text-muted">{t.fillMore.replace("{n}", nf.format(moreUnits)).replace("{p}", first.it!.code)}</p>
          )}

          <ul className="mt-5 space-y-2 text-sm">
            {rows.filter((r) => r.vol > 0).map((r) => (
              <li key={r.ln.key} className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: r.color }} />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                <span className="tabular text-muted">{nf.format(Math.round((r.vol / cap) * 100))} %</span>
              </li>
            ))}
          </ul>

          <a href={`${contactHref}?carga=${encodeURIComponent(summary)}`} className="btn btn-dark mt-6 w-full">
            {t.quote} →
          </a>
          <p className="mt-4 text-xs leading-relaxed text-muted">{t.note}</p>
        </div>
      </div>
    </div>
  );
}
