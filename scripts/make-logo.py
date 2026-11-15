"""Logo dosyalarını üretir. Kaynak: brand/la-turca-trade-logo-kaynak.png
(laturcatrade.com'daki şeffaf, açık renkli LT logosu).

Çıktılar:
  brand/ ve public/brand/:
    lt-acik.png     : kırpılmış açık sürüm (koyu zeminler için)
    lt-lacivert.png : lacivert + altın sürüm (açık zeminler için)
  src/app/icon.png (512) ve src/app/apple-icon.png (180): lacivert karo üzerinde açık logo

Kullanım: python3 -I scripts/make-logo.py
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, GOLD = (0x26, 0x36, 0x58), (0xC4, 0x9E, 0x58)

src = Image.open(os.path.join(ROOT, "brand/la-turca-trade-logo-kaynak.png")).convert("RGBA")
bb = src.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
pad = 6
light = src.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))

# Lacivert sürüm: krem alanlar laciverte, ok altına. İnce il sınırları MaxFilter ile yok sayılır.
lum = light.convert("RGB").convert("L").filter(ImageFilter.MaxFilter(3))
navy = Image.new("RGBA", light.size)
s, l, d = light.load(), lum.load(), navy.load()
for y in range(light.height):
    for x in range(light.width):
        r, g, b, a = s[x, y]
        if a == 0:
            d[x, y] = (0, 0, 0, 0)
            continue
        t = max(0.0, min(1.0, (l[x, y] / 255 - 0.70) / 0.16))
        d[x, y] = (*[round(GOLD[i] * (1 - t) + NAVY[i] * t) for i in range(3)], a)

for folder in ("brand", "public/brand"):
    os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
    light.save(os.path.join(ROOT, folder, "lt-acik.png"), optimize=True)
    navy.save(os.path.join(ROOT, folder, "lt-lacivert.png"), optimize=True)

def tile(size):
    t = Image.new("RGBA", (size, size), (*NAVY, 255))
    m = light.copy()
    m.thumbnail((int(size * 0.86), int(size * 0.86)), Image.LANCZOS)
    t.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return t

tile(512).save(os.path.join(ROOT, "src/app/icon.png"))
tile(180).convert("RGB").save(os.path.join(ROOT, "src/app/apple-icon.png"))
tile(512).save(os.path.join(ROOT, "brand/lt-ikon-512.png"))
print("ok", light.size)
