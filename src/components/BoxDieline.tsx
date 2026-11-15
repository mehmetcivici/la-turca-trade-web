/** Özel marka kutusunun açılımı (dieline): kesim çizgileri düz, katlama çizgileri kesikli. */
export function BoxDieline({ brand, label }: { brand: string; label: string }) {
  // paneller: yan(90) ön(150) yan(90) arka(150) + yapıştırma payı(22); yükseklik 230
  const y = 70, h = 230, flap = 56;
  const xs = [40, 62, 152, 302, 392, 542];
  const panels = [
    { x: 62, w: 90 }, { x: 152, w: 150 }, { x: 302, w: 90 }, { x: 392, w: 150 },
  ];
  const bars: { x: number; w: number }[] = [];
  let bx = 0;
  const seq = [2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 2, 1, 1, 3, 1, 1, 2];
  seq.forEach((wv, i) => {
    if (i % 2 === 0) bars.push({ x: bx, w: wv * 1.6 });
    bx += wv * 1.6;
  });
  return (
    <svg viewBox="0 0 580 380" className="h-auto w-full" role="img" aria-label={label}>
      <g fill="none" stroke="#263658" strokeWidth={1.4} strokeLinejoin="round">
        {/* yapıştırma payı */}
        <path d={`M62 ${y} L40 ${y + 14} L40 ${y + h - 14} L62 ${y + h}`} />
        {/* gövde dış hattı */}
        <path d={`M62 ${y} H542 V${y + h} H62`} />
        {/* üst ve alt kapaklar */}
        {panels.map((p, i) => (
          <g key={i}>
            <path d={i % 2 === 1 ? `M${p.x} ${y} L${p.x + 6} ${y - flap} H${p.x + p.w - 6} L${p.x + p.w} ${y}` : `M${p.x} ${y} Q${p.x + 4} ${y - flap * 0.7} ${p.x + p.w / 2} ${y - flap * 0.72} Q${p.x + p.w - 4} ${y - flap * 0.7} ${p.x + p.w} ${y}`} />
            <path d={i % 2 === 1 ? `M${p.x} ${y + h} L${p.x + 6} ${y + h + flap} H${p.x + p.w - 6} L${p.x + p.w} ${y + h}` : `M${p.x} ${y + h} Q${p.x + 4} ${y + h + flap * 0.7} ${p.x + p.w / 2} ${y + h + flap * 0.72} Q${p.x + p.w - 4} ${y + h + flap * 0.7} ${p.x + p.w} ${y + h}`} />
          </g>
        ))}
      </g>
      {/* katlama çizgileri */}
      <g stroke="#263658" strokeWidth={1} strokeDasharray="5 4">
        {xs.slice(1, 5).map((x) => (
          <line key={x} x1={x} y1={y} x2={x} y2={y + h} />
        ))}
        <line x1={62} y1={y} x2={542} y2={y} />
        <line x1={62} y1={y + h} x2={542} y2={y + h} />
      </g>
      {/* ön yüz: marka */}
      <g fontFamily="var(--font-serif)" fill="#263658" textAnchor="middle">
        <rect x={172} y={y + 70} width={110} height={52} fill="none" stroke="#C49E58" strokeWidth={1.2} strokeDasharray="2 3" />
        <text x={227} y={y + 104} fontSize={21}>{brand}</text>
        <text x={227} y={y + 190} fontSize={12} fontFamily="var(--font-sans)" fill="#556074">1 L · 1,5 L</text>
        {/* sürahi silueti */}
        <path d={`M219 ${y + 140} h16 l2 6 c8 4 10 10 10 18 v12 h-40 v-12 c0 -8 2 -14 10 -18 z`} fill="none" stroke="#263658" strokeWidth={1.2} />
      </g>
      {/* yan yüz: barkod */}
      <g transform={`translate(${310} ${y + 150})`}>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={34} fill="#263658" />
        ))}
        <text x={bx / 2} y={48} fontSize={10} textAnchor="middle" fontFamily="var(--font-sans)" fill="#263658">EAN-13</text>
      </g>
      {/* arka yüz: metin satırları */}
      <g stroke="#A3ABBA" strokeWidth={3} strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={412} y1={y + 60 + i * 16} x2={412 + (i === 4 ? 60 : 110)} y2={y + 60 + i * 16} />
        ))}
      </g>
    </svg>
  );
}
