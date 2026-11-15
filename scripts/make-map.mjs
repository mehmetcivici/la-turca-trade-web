// Ambarlı → Güney Amerika rota haritasını her dil için statik SVG olarak üretir:
// public/img/map/routes-{es,pt,en,tr}.svg  (sayfa HTML'ini şişirmemek için ayrı dosya)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { geoMercator, geoPath } from "d3-geo";
import { line, curveCatmullRom } from "d3-shape";
import { feature } from "topojson-client";
import { W, H, ORIGIN, TRUNK, ATLANTIC, PACIFIC, SPURS, PORTS, TARGET, TURKEY } from "../src/content/routes.ts";

const world = JSON.parse(readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"));
const countries = feature(world, world.objects.countries);

const projection = geoMercator()
  .fitExtent([[10, 10], [W - 10, H - 10]], { type: "MultiPoint", coordinates: [[-90, -43], [36, 46]] })
  .clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(1);
const p = (c) => projection(c);
const curve = line().x((c) => p(c)[0].toFixed(1)).y((c) => p(c)[1].toFixed(1)).curve(curveCatmullRom.alpha(0.5));

const labels = {
  es: { origin: "Estambul · Ambarlı", title: "Rutas marítimas desde Estambul hacia puertos de Sudamérica" },
  pt: { origin: "Istambul · Ambarlı", title: "Rotas marítimas de Istambul para portos da América do Sul" },
  en: { origin: "Istanbul · Ambarlı", title: "Sea routes from Istanbul to South American ports" },
  tr: { origin: "İstanbul · Ambarlı", title: "İstanbul'dan Güney Amerika limanlarına deniz yolları" },
};

// Ülkeleri renk grubuna göre tek path'te birleştir (dosya boyutu için)
const groups = { base: [], target: [], tr: [] };
for (const f of countries.features) {
  const d = path(f);
  if (!d) continue;
  const id = String(f.id ?? "");
  (id === TURKEY ? groups.tr : TARGET.has(id) ? groups.target : groups.base).push(d);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const FONT = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

mkdirSync("public/img/map", { recursive: true });
for (const [loc, t] of Object.entries(labels)) {
  const o = p(ORIGIN);
  const ports = PORTS.map((port) => {
    const [x, y] = p(port.at);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#F5F0E8" stroke="#1F2F4A" stroke-width="2"/>` +
      `<text x="${(x + port.dx).toFixed(1)}" y="${(y + port.dy).toFixed(1)}" text-anchor="${port.anchor}" class="l">${esc(port.name)}<tspan class="c" dx="5">${port.cc}</tspan></text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.title)}">
<title>${esc(t.title)}</title>
<style>.l{font:17px ${FONT};fill:#1B2230;paint-order:stroke;stroke:#F5F0E8;stroke-width:4px;stroke-linejoin:round}.c{font-size:13px;fill:#5D6270}.o{font-size:19px;font-weight:600}</style>
<g stroke="#F5F0E8" stroke-width=".6"><path fill="#E5DACA" d="${groups.base.join("")}"/><path fill="#D3C0A0" d="${groups.target.join("")}"/><path fill="#B4643C" d="${groups.tr.join("")}"/></g>
<g fill="none" stroke="#1F2F4A" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="${curve(TRUNK)}"/><path d="${curve(ATLANTIC)}"/><path d="${curve(PACIFIC)}"/>${SPURS.map((s) => `<path d="${curve(s)}" stroke-width="1.4" stroke-dasharray="3 4"/>`).join("")}</g>
${ports}
<circle cx="${o[0].toFixed(1)}" cy="${o[1].toFixed(1)}" r="8" fill="#1F2F4A"/><circle cx="${o[0].toFixed(1)}" cy="${o[1].toFixed(1)}" r="3" fill="#F5F0E8"/>
<text x="${(o[0] - 14).toFixed(1)}" y="${(o[1] - 16).toFixed(1)}" text-anchor="end" class="l o">${esc(t.origin)}</text>
</svg>`;
  writeFileSync(`public/img/map/routes-${loc}.svg`, svg);
  console.log(`harita: routes-${loc}.svg ${(svg.length / 1024).toFixed(0)} KB`);
}
