/**
 * 40' HC konteynerin yan kesiti: sol tarafta 60 × 45 × 32,5 cm kolilerin istifi, sağda oluklu duvar.
 * Ölçüler: iç uzunluk 12,03 m, iç yükseklik 2,69 m, yaklaşık 76 m³.
 */
export function ContainerFigure({ dec = ",", caption }: { dec?: string; caption: string }) {
  const X = 60, Y = 40, L = 960, Hh = 215; // iç alan (12,03 m × 2,69 m ölçekli)
  const rows = 8; // 2,69 / 0,325 ≈ 8 kat; 12,03 / 0,60 ≈ 20 sıra
  const cw = L / 20.05, rh = Hh / 8.28;
  const cut = 13; // kesitte görünen sütun sayısı
  const n = (v: string) => v.replace(".", dec);
  const ribs = [];
  for (let x = X + cut * cw + 14; x < X + L - 8; x += 13) ribs.push(x);
  return (
    <figure className="m-0">
      <svg viewBox="0 0 1150 330" className="h-auto w-full" role="img" aria-label={caption}>
        <g fill="none" stroke="#1F2F4A" strokeWidth={1.6}>
          {/* dış gövde */}
          <rect x={X - 12} y={Y - 12} width={L + 24} height={Hh + 24} />
          {/* köşe dökümleri */}
          {[[X - 12, Y - 12], [X + L - 4, Y - 12], [X - 12, Y + Hh - 4], [X + L - 4, Y + Hh - 4]].map(([cx, cy], i) => (
            <rect key={i} x={cx} y={cy} width={16} height={16} fill="#1F2F4A" />
          ))}
          {/* oluklu duvar */}
          {ribs.map((x) => (
            <line key={x} x1={x} y1={Y} x2={x} y2={Y + Hh} strokeWidth={0.8} stroke="#7d8698" />
          ))}
          {/* kesit çizgisi */}
          <path d={`M${X + cut * cw + 6} ${Y - 12} l -6 18 l 10 22 l -8 26 l 9 30 l -9 28 l 8 26 l -7 30 l 8 26 l -6 24 l 3 ${Hh + 24 - 230}`} stroke="#1F2F4A" strokeWidth={1.4} />
        </g>
        {/* koliler */}
        <g stroke="#1F2F4A" strokeWidth={0.7}>
          {Array.from({ length: rows }).flatMap((_, r) =>
            Array.from({ length: cut }).map((__, c) => (
              <rect
                key={`${r}-${c}`}
                x={X + c * cw + 0.6}
                y={Y + Hh - (r + 1) * rh + 0.6}
                width={cw - 1.2}
                height={rh - 1.2}
                fill={(r + c) % 5 === 0 ? "#C9B490" : "#E3D6C1"}
              />
            )),
          )}
        </g>
        {/* ölçü çizgileri */}
        <g stroke="#B4643C" strokeWidth={1.2} fill="#B4643C" fontFamily="var(--font-sans)" fontSize={15}>
          <line x1={X} y1={Y + Hh + 44} x2={X + L} y2={Y + Hh + 44} />
          <line x1={X} y1={Y + Hh + 36} x2={X} y2={Y + Hh + 52} />
          <line x1={X + L} y1={Y + Hh + 36} x2={X + L} y2={Y + Hh + 52} />
          <text x={X + L / 2} y={Y + Hh + 70} textAnchor="middle" stroke="none">
            {n("12.03")} m
          </text>
          <line x1={X + L + 40} y1={Y} x2={X + L + 40} y2={Y + Hh} />
          <line x1={X + L + 32} y1={Y} x2={X + L + 48} y2={Y} />
          <line x1={X + L + 32} y1={Y + Hh} x2={X + L + 48} y2={Y + Hh} />
          <text x={X + L + 52} y={Y + Hh / 2 + 5} stroke="none">
            {n("2.69")} m
          </text>
          <text x={X} y={Y - 22} stroke="none" fill="#1F2F4A" fontSize={14}>
            40&apos; HC · ≈ 76 m³ · {n("2.35")} m
          </text>
        </g>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
