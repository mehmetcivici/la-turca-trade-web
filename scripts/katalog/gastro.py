#!/usr/bin/env python3
"""
Gastroplast kataloğunu La Turca Trade için hazırlar.

    python3 scripts/katalog/gastro.py            # es + pt + en
    python3 scripts/katalog/gastro.py es         # tek dil

Katalog Türkçe/İngilizce iki dillidir. es/pt sürümünde Türkçe satırlar hedef dile çevrilir, İngilizce ikizleri
olduğu gibi kalır (yerleşim bozulmaz). Çeviriler ceviri/gastro-<dil>.json dosyalarındadır: anahtar özgün Türkçe
satır (ya da "sayfa|satır" sayfaya özel), değer çeviri (null = dokunma, "" = sil). Yeni katalog geldiğinde eksik satırlar listelenir.

Her dil: son sayfadaki üretici iletişim şeridi La Turca Trade (Güney Amerika satış ofisi) bilgileriyle değişir,
kapaktaki web adresi www.laturcatrade.com olur, boş köşelere La Turca Trade logosu konur.
"""
from __future__ import annotations

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import PROJE, logo_boyutu, logo_koy, logo_yeri, qr_png, rgb01, site_bilgisi  # noqa: E402
import pymupdf  # noqa: E402
from PIL import Image  # noqa: E402

KOK = os.path.dirname(os.path.abspath(__file__))
KAYNAK = os.path.join(PROJE, "kataloglar", "gastroplast-catalogo.pdf")
CIKTI = os.path.join(PROJE, "kataloglar", "gastroplast-catalogo-{dil}.pdf")
CEVIRI = os.path.join(KOK, "ceviri", "gastro-{dil}.json")
DILLER = ("es", "pt", "en")
FD = os.path.join(KOK, "fonts")

ARKA = {
    "es": {"ofis": "Oficina de ventas para Sudamérica", "sehir": "Estambul, Turquía"},
    "pt": {"ofis": "Escritório de vendas para a América do Sul", "sehir": "Istambul, Turquia"},
    "en": {"ofis": "South America sales office", "sehir": "Istanbul, Türkiye"},
}
LACIVERT = (0x26 / 255, 0x36 / 255, 0x58 / 255)
GRI = (0.33, 0.35, 0.38)


# ---------------------------------------------------------------- yazı tipi eşlemesi (özgün → açık lisanslı benzeri)
def yedek_font(ad: str) -> str:
    a = ad.lower()
    if "compress" in a or "gothamcondensed" in a or "condensed" in a or "cond" in a or "cn" in a:
        if "bold" in a or "bol" in a or "demi" in a:
            f = "BarlowCondensed-SemiBold"
        elif "medium" in a:
            f = "BarlowCondensed-Medium"
        elif "light" in a or "lt" in a:
            f = "BarlowCondensed-Light"
        else:
            f = "BarlowCondensed-Regular"
    elif "gotham" in a or "avantgarde" in a or "centurygothic" in a or "futura" in a or "colaborate" in a:
        if "extralight" in a:
            f = "Montserrat-ExtraLight"
        elif "light" in a:
            f = "Montserrat-Light"
        elif "bold" in a or "ultra" in a or "demi" in a:
            f = "Montserrat-SemiBold"
        else:
            f = "Montserrat-Regular"
    elif "slab" in a:
        f = "ZillaSlab-Light" if "100" in a or "light" in a else "ZillaSlab-Regular"
    elif "bold" in a:
        f = "Barlow-SemiBold"
    elif "light" in a:
        f = "Barlow-Light"
    elif any(k in a for k in ("helvetica", "arial", "akkurat", "univers", "din", "myriad", "times")):
        f = "Barlow-Regular"
    else:
        f = "BarlowCondensed-Regular"
    return os.path.join(FD, f + ".ttf")


_fonts: dict[str, pymupdf.Font] = {}


def F(path: str) -> pymupdf.Font:
    if path not in _fonts:
        _fonts[path] = pymupdf.Font(fontfile=path)
    return _fonts[path]


def norm(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- satırlar
def satirlar(page: pymupdf.Page):
    out = []
    for b in page.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            if abs(l["dir"][1]) > 0.01:
                continue  # döndürülmüş metin
            spans = [s for s in l["spans"] if any(c["c"].strip() for c in s["chars"])]
            if not spans:
                continue
            text = norm("".join(c["c"] for s in l["spans"] for c in s["chars"]))
            chars = [c for s in spans for c in s["chars"] if c["c"].strip()]
            # baskın stil: en çok karakter taşıyan span
            ana = max(spans, key=lambda s: sum(1 for c in s["chars"] if c["c"].strip()))
            out.append({
                "text": text, "spans": spans, "ana": ana,
                "x0": chars[0]["bbox"][0], "x1": chars[-1]["bbox"][2],
                "y0": min(c["bbox"][1] for c in chars), "y1": max(c["bbox"][3] for c in chars),
                "ox": chars[0]["origin"][0], "base": ana["origin"][1],
            })
    return out


def sag_komsu(s, hepsi, W) -> float:
    sinir = W - 12
    for o in hepsi:
        if o is s or o["x0"] < s["x1"] - 1:
            continue
        if min(o["y1"], s["y1"]) - max(o["y0"], s["y0"]) > 0.3 * (s["y1"] - s["y0"]):
            sinir = min(sinir, o["x0"] - 2.5)
    return sinir


def ortali(s, hepsi) -> bool:
    """Ortalanmış başlık mı? Yakınındaki satırlarla aynı merkezi paylaşıyor ama sol kenarları farklı."""
    h = s["y1"] - s["y0"]
    m = (s["x0"] + s["x1"]) / 2
    for o in hepsi:
        if o is s or abs(o["y0"] - s["y0"]) > 3.2 * h:
            continue
        if abs((o["x0"] + o["x1"]) / 2 - m) < 3 and abs(o["x0"] - s["x0"]) > 6:
            return True
    return False


def yaz(page, text, x, base, size, fontpath, color, sx=1.0):
    tw = pymupdf.TextWriter(page.rect, color=color)
    tw.append((x, base), text, font=F(fontpath), fontsize=size)
    tw.write_text(page, morph=(pymupdf.Point(x, base), pymupdf.Matrix(sx, 1)) if abs(sx - 1) > 0.005 else None)


BOS_KIRPMA = re.compile(rb"(-?[\d.]+)\s+(-?[\d.]+)\s+m\s+W\s+n")


def kirpma_onar(doc):
    """InDesign'ın 'x y m W n' (boş kırpma) komutlarını '0 0 re' biçimine çevirir.
    PyMuPDF redaksiyonu içerik akışını yeniden yazarken bu boş kırpmayı atıyor; o zaman kırpılması gereken
    degrade tüm sayfaya yayılıyor. Dikdörtgen biçimi aynı anlama gelir ve korunur."""
    hedef = set()
    for page in doc:
        hedef.update(page.get_contents())
    for x in range(1, doc.xref_length()):
        try:
            if doc.xref_get_key(x, "Subtype")[1] == "/Form":
                hedef.add(x)
        except Exception:
            pass
    n = 0
    for x in hedef:
        try:
            st = doc.xref_stream(x)
        except Exception:
            continue
        if not st or b"W" not in st:
            continue
        yeni, k = BOS_KIRPMA.subn(rb"\1 \2 0 0 re W n", st)
        if k:
            doc.update_stream(x, yeni)
            n += k
    return n


def cevir_sayfa(page, tablo: dict, eksik: set):
    W = page.rect.width
    hepsi = satirlar(page)
    isler = []
    for s in hepsi:
        anahtar = f"{page.number + 1}|{s['text']}"  # sayfaya özel çeviri önce
        if anahtar not in tablo and s["text"] not in tablo:
            if TR_RE.search(s["text"]):
                eksik.add(s["text"])
            continue
        yeni = tablo.get(anahtar, tablo.get(s["text"]))
        if yeni is None:
            continue
        isler.append((s, norm(yeni)))
    if not isler:
        return 0
    # 1) eski metni sil (yalnız bu satırların karakterleri; her span kendi taban çizgisinde)
    for s, _ in isler:
        for sp in s["spans"]:
            ch = [c for c in sp["chars"] if c["c"].strip()]
            if not ch:
                continue
            by = ch[0]["origin"][1]
            sz = sp["size"]
            page.add_redact_annot(pymupdf.Rect(ch[0]["bbox"][0] + 0.2, by - 0.45 * sz, ch[-1]["bbox"][2] - 0.2, by - 0.2 * sz),
                                  fill=False, cross_out=False)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    # 2) yeni metni yaz
    for s, yeni in isler:
        if not yeni:
            continue
        ana = s["ana"]
        fp = yedek_font(ana["font"])
        size = ana["size"]
        c = ana["color"]
        color = ((c >> 16) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255)
        f = F(fp)
        eski_w = max(1.0, s["x1"] - s["x0"])
        dogal_eski = f.text_length(s["text"], fontsize=size)
        sx_dogal = min(1.12, max(0.55, eski_w / dogal_eski)) if dogal_eski else 1.0
        izin = min(eski_w * 1.12, sag_komsu(s, hepsi, W) - s["x0"])
        izin = max(izin, eski_w)
        w_yeni = f.text_length(yeni, fontsize=size)
        sx = min(sx_dogal, izin / w_yeni) if w_yeni else sx_dogal
        if sx < sx_dogal * 0.72:  # çok sıkışacaksa biraz da küçült
            k = max(0.8, sx / (sx_dogal * 0.72))
            size *= k
            sx = min(sx_dogal, izin / (w_yeni * k))
        x = s["ox"]
        w_son = f.text_length(yeni, fontsize=size) * sx
        if ortali(s, hepsi):
            x = (s["x0"] + s["x1"]) / 2 - w_son / 2
        elif s["y1"] < 62 and s["x1"] > 0.82 * W and s["x0"] > 0.5 * W:  # sağ üstteki sayfa başlığı sağa yaslı
            x = s["x1"] - f.text_length(yeni, fontsize=size) * sx
        yaz(page, yeni, x, s["base"], size, fp, color, sx)
    return len(isler)


TR_RE = re.compile(r"[çğıöşüÇĞİÖŞÜ]")


# ---------------------------------------------------------------- kapak / arka kapak / logo
def kapak(page, dil):
    for s in satirlar(page):
        if "gastroplast.com" in s["text"].lower():
            ana = s["ana"]
            c = ana["color"]
            page.add_redact_annot(pymupdf.Rect(s["x0"], s["y0"], s["x1"], s["y1"]), fill=False, cross_out=False)
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
            yaz(page, "www.laturcatrade.com", s["ox"], s["base"], ana["size"], yedek_font(ana["font"]),
                ((c >> 16) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255))
    # sol alt marka şeridinin üstünde, kapak fotoğrafının içinde değil: kapakta sağ üstte logo plakası
    W, H = page.rect.width, page.rect.height
    lw, lh = logo_boyutu(118)
    x, y = W - 34 - lw, H - 108
    plaka = pymupdf.Rect(x - 10, y - 8, x + lw + 10, y + lh + 20)
    page.draw_rect(plaka, color=None, fill=(1, 1, 1), radius=0.12, overlay=True)
    logo_koy(page, pymupdf.Rect(x, y, x + lw, y + lh), acik_zemin=True)
    t = ARKA[dil]["ofis"].upper()
    f = F(os.path.join(FD, "Montserrat-Regular.ttf"))
    size = 5.6
    tr = 0.55
    w = f.text_length(t, fontsize=size) + tr * (len(t) - 1)
    tw = pymupdf.TextWriter(page.rect, color=LACIVERT)
    cx = x + lw / 2 - w / 2
    for ch in t:
        tw.append((cx, y + lh + 11), ch, font=f, fontsize=size)
        cx += f.text_length(ch, fontsize=size) + tr
    tw.write_text(page)


def arka_kapak(page, dil, site):
    W, H = page.rect.width, page.rect.height
    alan = pymupdf.Rect(28, 712, W - 28, 806)
    page.add_redact_annot(alan, fill=(1, 1, 1), cross_out=False)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    a = ARKA[dil]
    # sol: logo + ofis
    lw, lh = logo_boyutu(150)
    x0, y0 = 40, 726
    logo_koy(page, pymupdf.Rect(x0, y0, x0 + lw, y0 + lh), acik_zemin=True)
    fr = os.path.join(FD, "Montserrat-Regular.ttf")
    fl = os.path.join(FD, "Montserrat-Light.ttf")
    fs = os.path.join(FD, "Montserrat-SemiBold.ttf")
    yaz(page, a["ofis"].upper(), x0 + 1, y0 + lh + 14, 6.6, fs, LACIVERT)
    yaz(page, "Gastroplast · Star Termos", x0 + 1, y0 + lh + 25, 7.4, fl, GRI)
    # orta: iletişim
    xm = 300
    satir = [x for x in [site.get("email"), "www.laturcatrade.com", site.get("phone"),
                         ("WhatsApp " + site["whatsapp"]) if site.get("whatsapp") else None] if x]
    y = 738
    for t in satir:
        yaz(page, t, xm, y, 9, fr, LACIVERT)
        y += 13
    yaz(page, ", ".join(x for x in [site.get("address"), a["sehir"]] if x), xm, y + 2, 8, fl, GRI)
    # sağ: QR
    q = 62
    r = pymupdf.Rect(W - 40 - q, 730, W - 40, 730 + q)
    page.insert_image(r, stream=qr_png(f"{site['url'].rstrip('/')}/{dil}/"), overlay=True)
    page.draw_line((xm - 14, 728), (xm - 14, 800), color=(0.8, 0.8, 0.82), width=0.6, overlay=True)


def logo_ekle(page, pi) -> str | None:
    W, H = page.rect.width, page.rect.height
    pix = page.get_pixmap(dpi=72)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    lw, lh = logo_boyutu(82)
    mx, my = 26 / W, 22 / H
    adaylar = [
        (mx, my), (1 - mx - lw / W, my), (0.3, my), (0.5 - lw / 2 / W, my),
        (mx, 1 - my - lh / H), (1 - mx - lw / W, 1 - my - lh / H), (0.3, 1 - my - lh / H), (0.5 - lw / 2 / W, 1 - my - lh / H),
    ]
    r, lum = logo_yeri(img, W, H, lw, lh, adaylar, pad_pt=6)
    if r is None:
        return None
    logo_koy(page, r, acik_zemin=lum > 120)
    return f"{r.x0 / W:.2f},{r.y0 / H:.2f}"


# ---------------------------------------------------------------- ana akış
def uret(dil: str):
    site = site_bilgisi()
    tablo = {}
    if dil != "en":
        with open(CEVIRI.format(dil=dil), encoding="utf-8") as f:
            tablo = json.load(f)
    doc = pymupdf.open(KAYNAK)
    kirpma_onar(doc)
    n = len(doc)
    eksik: set = set()
    toplam = 0
    logolar = 0
    for pi in range(n):
        page = doc[pi]
        if dil != "en" and pi != n - 1:
            toplam += cevir_sayfa(page, tablo, eksik)
        if pi == 0:
            kapak(page, dil)
        elif pi == n - 1:
            arka_kapak(page, dil, site)
        else:
            logolar += logo_ekle(page, pi) is not None
    doc.set_metadata({**doc.metadata, "title": f"Gastroplast — Catálogo ({dil.upper()}) · La Turca Trade",
                      "author": "La Turca Trade", "producer": "La Turca Trade", "creator": "La Turca Trade"})
    out = CIKTI.format(dil=dil)
    doc.save(out, garbage=4, deflate=True, deflate_fonts=True)
    print(f"→ {out}  ({os.path.getsize(out) / 1e6:.1f} MB)  çevrilen satır: {toplam}  logo: {logolar}/{n - 2}")
    if eksik:
        print(f"  ! çevirisi olmayan {len(eksik)} Türkçe satır:", list(eksik)[:10])


if __name__ == "__main__":
    for d in (sys.argv[1:] or DILLER):
        uret(d)
