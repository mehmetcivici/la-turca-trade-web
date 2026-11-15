// kataloglar/ klasöründeki PDF'leri public/catalogs/ altına kopyalar.
// Yeni katalog geldiğinde aynı dosya adıyla kataloglar/ içine koymanız yeterli.
import { mkdirSync, readdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const src = "kataloglar";
const dst = join("public", "catalogs");
mkdirSync(dst, { recursive: true });
for (const f of readdirSync(src)) {
  if (!f.toLowerCase().endsWith(".pdf")) continue;
  const a = join(src, f), b = join(dst, f);
  if (existsSync(b) && statSync(b).size === statSync(a).size && statSync(b).mtimeMs >= statSync(a).mtimeMs) continue;
  copyFileSync(a, b);
  console.log("katalog kopyalandı:", f);
}
