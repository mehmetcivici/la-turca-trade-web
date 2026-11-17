// kataloglar/ klasöründeki PDF'leri public/catalogs/ altına kopyalar.
// - Dile göre hazırlanmış sürümler (…-es.pdf, …-pt.pdf, …-en.pdf) varsa üreticinin özgün dosyası yayımlanmaz
//   (özgün dosyada üreticinin iletişim bilgileri var; kaynak olarak kataloglar/ içinde kalır).
// - Yeni katalog: kataloglar/ içine koyun; La Turca Trade sürümleri için scripts/katalog/README.md.
import { mkdirSync, readdirSync, copyFileSync, statSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = "kataloglar";
const dst = join("public", "catalogs");
mkdirSync(dst, { recursive: true });
const pdfs = readdirSync(src).filter((f) => f.toLowerCase().endsWith(".pdf"));
const yerel = /-(es|pt|en)\.pdf$/i;
const yayinla = pdfs.filter((f) => yerel.test(f) || !pdfs.some((g) => yerel.test(g) && g.replace(yerel, ".pdf") === f));
for (const f of yayinla) {
  const a = join(src, f), b = join(dst, f);
  if (existsSync(b) && statSync(b).size === statSync(a).size && statSync(b).mtimeMs >= statSync(a).mtimeMs) continue;
  copyFileSync(a, b);
  console.log("katalog kopyalandı:", f);
}
for (const f of readdirSync(dst)) {
  if (f.toLowerCase().endsWith(".pdf") && !yayinla.includes(f)) {
    rmSync(join(dst, f));
    console.log("yayımlanmayan katalog kaldırıldı:", f);
  }
}
