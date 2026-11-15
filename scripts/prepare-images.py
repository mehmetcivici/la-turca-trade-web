"""Üretici sitelerinden/kataloglarından alınan görselleri public/img altına WebP olarak hazırlar.
Kullanım: python3 -I scripts/prepare-images.py <indirilen_klasoru> <katalog_render_klasoru>
"""
import sys, os
from PIL import Image, ImageChops

SRC, REN = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "img")

def trim_white(im, thr=242):
    g = im.convert("L").point(lambda p: 255 if p < thr else 0)
    bb = g.getbbox()
    return im.crop(bb) if bb else im

def save(src, dst, max_w=1400, q=78, trim=False, crop=None):
    im = Image.open(src)
    im = im.convert("RGBA").convert("RGB") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")
    if trim: im = trim_white(im)
    if crop: 
        w, h = im.size; l, t, r, b = crop; im = im.crop((int(l*w), int(t*h), int(r*w), int(b*h)))
    if im.width > max_w: im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, dst); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, "WEBP", quality=q, method=6)
    print(f"{dst:40s} {im.size} {os.path.getsize(p)//1024} KB")

st = lambda n: os.path.join(SRC, "startermos", n)
gp = lambda n: os.path.join(SRC, "gastroplast", n)
r = lambda n: os.path.join(REN, n)

# Star Termos — seri görselleri (üretici sitesi /urunlerimiz)
series = {
  "elegant": "Elegant.jpg", "east": "east-serisi.jpg", "dinamik": "dinamik-02-12-2025-10-47-52.png",
  "mimoza": "Mimoza.jpg", "kastel": "kastel.jpg", "zagana": "kastel-ozel-serisi.jpg",
  "morepse": "Morepse-Serisi.jpg", "camping": "camping.jpg", "horeca": "Horeca.jpg",
  "soothe": "sootie.jpg", "locksip": "Locksip-Serisi.jpg", "trailmate": "Trailmate-Serisi-1.jpg",
  "thermbox": "yemek-termosu.jpg", "aqua": "Celik-Mug.jpg", "sport": "WhatsApp-Image-2025-12-17-at-09.06.13.jpeg",
  "steel-jug": "Celik-Termos.jpg", "travel-mugs": "Mug-Modelleri.jpg", "thermbox-family": "THERMBOX-SERISI.jpg",
}
for k, v in series.items(): save(st(v), f"star-termos/{k}.webp", 900)
save(st("4Z2A7894-min.jpg"), "star-termos/lineup.webp", 1600, 80)
save(st("IMG_1540-scaled.jpg"), "star-termos/elegant-garden.webp", 1100, 80)
# Katalog sayfalarından tam sayfa fotoğraflar (beyaz kenar kırpılır)
for p, name in [(18, "tea-table"), (16, "jugs-stone"), (6, "pastel-jugs"), (14, "red-jug"), (10, "living-room"), (12, "cream-jug"), (8, "breakfast")]:
    save(r(f"st{p}.jpg"), f"star-termos/scene-{name}.webp", 1600, 80, trim=True)

# Gastroplast — kategori ve slider görselleri (üretici sitesi)
gcat = {
  "gn-pc-clear": "menu_gn-pc-seffaf-kuvetler-1.webp", "gn-pc-black": "menu_gn-pc-siyah-kuvetler.webp",
  "gn-pp": "menu_gn-pp-gastronom-kuvetler-1.webp", "service": "menu_servis-ekipmanlari-1.webp",
  "glasses-jugs": "menu_bardaklar-ve-surahiler.webp", "dispensers": "menu_dispensirlar-1.webp",
  "ingredient-bin": "menu_erzak-arabasi.webp", "dough-boxes": "menu_hamur-tekneleri-ve-kapagi.webp",
  "scoops": "menu_kurekler-ve-olcu-kaplari.webp", "square-storage": "menu_pc-kare-saklama-kaplari-1.webp",
  "drain-shelves": "menu_polikarbonat-suzgecler.webp", "dome-covers": "menu_fanuslar-tepsiler.webp",
  "ice-buckets": "menu_buz-kovalari.webp", "carry-box": "menu_gn-1-1-carry-box-abs-tasima-kabi.webp",
  "round-storage": "menu_pc-pp-saklama-kaplari.webp",
}
for k, v in gcat.items(): save(gp(v), f"gastroplast/{k}.webp", 840)
for k, v in {"pool-glasses": "slider_-16.webp", "condiment": "slider_-11.webp", "sauce-cake": "slider_-2.webp",
             "fruit": "slider_-21.webp", "squeeze": "slider_-6.webp"}.items():
    save(gp(v), f"gastroplast/scene-{k}.webp", 1600, 80)
save(gp("certificates_nfs.webp"), "gastroplast/nsf-listing.webp", 700)

# Katalog kapakları
save(r("st4.jpg"), "catalogs/star-termos-cover.webp", 900)  # katalog s.4
# Havuz fotoğrafı iki kareli kolaj: yalnızca sağ kare
save(gp("slider_-16.webp"), "gastroplast/scene-pool.webp", 1000, 80, crop=(0.545, 0, 1, 1))
save(r("gp1.jpg"), "catalogs/gastroplast-cover.webp", 700)
# Sertifika küçük görselleri
save(st("3694.-MEHMET-DINCOK-9-14-45-ASCERT-2024-1-4-1_page-0001.jpg"), "star-termos/iso-9001.webp", 700)
