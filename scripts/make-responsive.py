#!/usr/bin/env python3
"""
public/img altındaki geniş WebP görsellerin küçük sürümlerini üretir: ad-640w.webp, ad-1080w.webp.
Img bileşeni (src/components/ui.tsx) aynı kuralla srcset yazar; telefon küçük dosyayı indirir (LCP).
Kural: genişliği V + 100 px'ten büyük her görsel için V ∈ {640, 1080}. Yeni görsel ekleyince tekrar çalıştırın.
"""
import pathlib, re
from PIL import Image

KOK = pathlib.Path(__file__).resolve().parent.parent / "public" / "img"
VARYANT = (640, 1080)
n = 0
for p in sorted(KOK.rglob("*.webp")):
    if re.search(r"-\d+w\.webp$", p.name):
        continue
    im = Image.open(p)
    w, h = im.size
    for v in VARYANT:
        if w <= v + 100:
            continue
        out = p.with_name(f"{p.stem}-{v}w.webp")
        if out.exists() and out.stat().st_mtime >= p.stat().st_mtime:
            continue
        im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB").resize((v, round(h * v / w)), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
        n += 1
print(f"{n} küçük sürüm üretildi")
