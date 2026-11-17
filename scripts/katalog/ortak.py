"""
Katalog dönüştürücü ortak kütüphanesi (Star Termos ve Gastroplast).

- Sayfayı 200 dpi görüntüye çevirir, macOS Vision ile OCR yapar (sonuçlar _cache/ altında saklanır).
- Bir metin satırının üstünü arka plan rengiyle kapatıp yerine çeviriyi aynı renk/boyut/harf aralığıyla yazar.
- Sayfadaki boş alana La Turca Trade logosu koyar.

Gereksinimler: pip install pymupdf segno pillow  ·  macOS (Vision OCR için swiftc).
"""
from __future__ import annotations

import io
import json
import os
import re
import statistics
import subprocess
from dataclasses import dataclass

import pymupdf
from PIL import Image

KOK = os.path.dirname(os.path.abspath(__file__))
PROJE = os.path.dirname(os.path.dirname(KOK))
FONT_DIR = os.path.join(KOK, "fonts")
CACHE = os.path.join(KOK, "_cache")
BIN = os.path.join(KOK, "_bin")
DPI = 200

FONTS = {
    "light": os.path.join(FONT_DIR, "Montserrat-Light.ttf"),
    "regular": os.path.join(FONT_DIR, "Montserrat-Regular.ttf"),
    "semibold": os.path.join(FONT_DIR, "Montserrat-SemiBold.ttf"),
}
_font_obj: dict[str, pymupdf.Font] = {}


def font(kind: str = "light") -> pymupdf.Font:
    if kind not in _font_obj:
        _font_obj[kind] = pymupdf.Font(fontfile=FONTS[kind])
    return _font_obj[kind]


def site_bilgisi() -> dict:
    with open(os.path.join(PROJE, "content", "site.json"), encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- OCR
def ocr_araci() -> str:
    os.makedirs(BIN, exist_ok=True)
    exe = os.path.join(BIN, "ocr")
    src = os.path.join(KOK, "ocr.swift")
    if not os.path.exists(exe) or os.path.getmtime(exe) < os.path.getmtime(src):
        subprocess.run(["swiftc", "-O", src, "-o", exe], check=True)
    return exe


@dataclass
class Satir:
    t: str
    x: float  # normalleştirilmiş (0..1), sol üst köken
    y: float
    w: float
    h: float

    def rect(self, W: float, H: float, pad: float = 0) -> pymupdf.Rect:
        return pymupdf.Rect(self.x * W - pad, self.y * H - pad, (self.x + self.w) * W + pad, (self.y + self.h) * H + pad)


def sayfa_goruntu(doc_path: str, sayfa: int, etiket: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    png = os.path.join(CACHE, f"{etiket}-{sayfa:03d}.png")
    if not os.path.exists(png):
        doc = pymupdf.open(doc_path)
        pix = doc[sayfa].get_pixmap(dpi=DPI)
        pix.save(png)
    return png


def ocr(doc_path: str, sayfa: int, etiket: str) -> list[Satir]:
    png = sayfa_goruntu(doc_path, sayfa, etiket)
    js = png[:-4] + ".json"
    if not os.path.exists(js):
        out = subprocess.run([ocr_araci(), png], check=True, capture_output=True).stdout
        with open(js, "wb") as f:
            f.write(out)
    with open(js, encoding="utf-8") as f:
        return [Satir(r["t"].strip(), r["x"], r["y"], r["w"], r["h"]) for r in json.load(f) if r["t"].strip()]


# ---------------------------------------------------------------- renk ölçümü
def _lum(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def arka_plan(img: Image.Image, box_px, pad: int = 5):
    """Kutunun çevresindeki halkanın medyan rengi ve tekdüzeliği (std)."""
    x0, y0, x1, y1 = [int(v) for v in box_px]
    W, H = img.size
    px = []
    for x in range(max(0, x0 - pad), min(W, x1 + pad), 2):
        for y in (max(0, y0 - pad), min(H - 1, y1 + pad)):
            px.append(img.getpixel((x, y))[:3])
    for y in range(max(0, y0 - pad), min(H, y1 + pad), 2):
        for x in (max(0, x0 - pad), min(W - 1, x1 + pad)):
            px.append(img.getpixel((x, y))[:3])
    if not px:
        return (255, 255, 255), 999
    med = tuple(int(statistics.median(p[i] for p in px)) for i in range(3))
    sd = statistics.pstdev([_lum(p) for p in px])
    return med, sd


def yazi_rengi(img: Image.Image, box_px, bg, varsayilan=(52, 60, 65)):
    x0, y0, x1, y1 = [int(v) for v in box_px]
    px = []
    for x in range(max(0, x0), min(img.size[0], x1), 1):
        for y in range(max(0, y0), min(img.size[1], y1), 1):
            c = img.getpixel((x, y))[:3]
            if abs(_lum(c) - _lum(bg)) > 32:
                px.append(c)
    if len(px) < 8:
        return varsayilan
    # en kontrastlı %40'lık kısım: kenar yumuşatma piksellerini ele
    px.sort(key=lambda c: -abs(_lum(c) - _lum(bg)))
    core = px[: max(4, len(px) * 4 // 10)]
    return tuple(int(statistics.median(c[i] for c in core)) for i in range(3))


def bos_sag_sinir(img: Image.Image, box_px, bg, limit_px: int) -> int:
    """Kutunun sağından, arka plandan farklı içerik başlayana kadar olan x (px)."""
    x0, y0, x1, y1 = [int(v) for v in box_px]
    ys = [int(y0 + (y1 - y0) * k) for k in (0.2, 0.5, 0.8)]
    run = 0
    for x in range(int(x1) + 3, min(limit_px, img.size[0] - 1)):
        diff = max(abs(_lum(img.getpixel((x, y))[:3]) - _lum(bg)) for y in ys)
        run = run + 1 if diff > 28 else 0
        if run >= 4:
            return x - 6
    return min(limit_px, img.size[0] - 1)


# ---------------------------------------------------------------- yazı
def rgb01(c):
    return tuple(v / 255 for v in c)


@dataclass
class Yazi:
    rect: pymupdf.Rect          # kapatılacak alan (pt)
    text: str
    size: float
    color: tuple
    bg: tuple
    track: float = 0.0
    align: str = "left"         # left | center
    weight: str = "light"
    x: float | None = None      # yazının başlayacağı x (pt), yoksa rect.x0
    baseline: float | None = None


def genislik(text: str, size: float, track: float = 0.0, weight: str = "light") -> float:
    f = font(weight)
    return f.text_length(text, fontsize=size) + track * max(0, len(text) - 1)


def yaz(page: pymupdf.Page, y: Yazi) -> None:
    f = font(y.weight)
    tw = pymupdf.TextWriter(page.rect, color=rgb01(y.color))
    w = genislik(y.text, y.size, y.track, y.weight)
    if y.align == "center":
        x = (y.rect.x0 + y.rect.x1) / 2 - w / 2
    else:
        x = y.x if y.x is not None else y.rect.x0
    base = y.baseline if y.baseline is not None else (y.rect.y0 + y.rect.y1) / 2 + 0.35 * y.size
    if y.track:
        for ch in y.text:
            tw.append((x, base), ch, font=f, fontsize=y.size)
            x += f.text_length(ch, fontsize=y.size) + y.track
    else:
        tw.append((x, base), y.text, font=f, fontsize=y.size)
    tw.write_text(page)


def uygula(page: pymupdf.Page, yazilar: list[Yazi], gercek_metni_sil: bool = True) -> None:
    """Önce alanlardaki gerçek metni sil (aranabilir eski metin kalmasın), sonra kapat ve yaz."""
    if gercek_metni_sil and yazilar:
        for y in yazilar:
            page.add_redact_annot(y.rect, fill=False)
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    for y in yazilar:
        page.draw_rect(y.rect, color=None, fill=rgb01(y.bg), overlay=True)
    for y in yazilar:
        yaz(page, y)


# ---------------------------------------------------------------- logo
LOGO_KOYU = os.path.join(PROJE, "brand", "la-turca-trade-yatay.png")
LOGO_ACIK = os.path.join(PROJE, "brand", "la-turca-trade-yatay-acik.png")


def logo_yeri(img: Image.Image, W: float, H: float, w_pt: float, h_pt: float, adaylar, pad_pt: float = 6):
    """Adaylardan (normalleştirilmiş sol üst noktalar) ilk tekdüze olanı bul."""
    sx = img.size[0] / W
    for nx, ny in adaylar:
        x0, y0 = nx * W, ny * H
        box = (x0 - pad_pt, y0 - pad_pt, x0 + w_pt + pad_pt, y0 + h_pt + pad_pt)
        if box[0] < 0 or box[1] < 0 or box[2] > W or box[3] > H:
            continue
        bx = [int(v * sx) for v in box]
        px = [img.getpixel((x, y))[:3] for x in range(bx[0], bx[2], 3) for y in range(bx[1], bx[3], 3)]
        if not px:
            continue
        lums = [_lum(c) for c in px]
        ort = statistics.mean(lums)
        if statistics.pstdev(lums) < 5.0 and max(abs(v - ort) for v in lums) < 32:
            return pymupdf.Rect(x0, y0, x0 + w_pt, y0 + h_pt), statistics.mean(lums)
    return None, None


def logo_koy(page: pymupdf.Page, rect: pymupdf.Rect, acik_zemin: bool) -> None:
    page.insert_image(rect, filename=LOGO_KOYU if acik_zemin else LOGO_ACIK, keep_proportion=True, overlay=True)


def logo_boyutu(w_pt: float) -> tuple[float, float]:
    im = Image.open(LOGO_KOYU)
    return w_pt, w_pt * im.size[1] / im.size[0]


# ---------------------------------------------------------------- QR
def qr_png(url: str, renk="#263658", arka="#FFFFFF") -> bytes:
    import segno

    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=12, border=1, dark=renk, light=arka)
    return buf.getvalue()


def norm(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- mürekkep (görüntüden gerçek yazı sınırı)
PX = DPI / 72.0
_pil_cache: dict = {}


def pil_font(kind: str):
    from PIL import ImageFont

    if kind not in _pil_cache:
        _pil_cache[kind] = ImageFont.truetype(FONTS[kind], 200)
    return _pil_cache[kind]


def murekkep_orani(text: str, kind: str):
    """Metnin 1 pt boyuttaki mürekkep kutusu (sol, üst, sağ, alt) — taban çizgisine göre, harf aralığı 0."""
    l, t, r, b = pil_font(kind).getbbox(text, anchor="ls")
    return l / 200, t / 200, r / 200, b / 200


def murekkep(img: Image.Image, rect_pt, bg, esik: int = 45, uzat_pt: float = 0, pad_px: int = 2):
    """rect_pt içindeki (isteğe bağlı yatayda uzatılmış) gerçek yazı piksellerinin kutusu (pt). Yoksa None."""
    W, H = img.size
    bl = _lum(bg)
    x0 = max(0, int((rect_pt[0] - uzat_pt) * PX))
    x1 = min(W - 1, int((rect_pt[2] + uzat_pt) * PX))
    y0 = max(0, int(rect_pt[1] * PX) - pad_px)
    y1 = min(H - 1, int(rect_pt[3] * PX) + pad_px)
    # yatay çizgi (ayraç) satırlarını yok say: kutunun iç genişliğinin büyük kısmında kesintisiz mürekkep
    ix0, ix1 = max(0, int(rect_pt[0] * PX)), min(W - 1, int(rect_pt[2] * PX))
    satirlar = []
    for y in range(y0, y1 + 1):
        dolu = sum(abs(_lum(img.getpixel((x, y))[:3]) - bl) > esik for x in range(ix0, ix1 + 1))
        if ix1 > ix0 and dolu / (ix1 - ix0 + 1) > 0.8:
            continue
        satirlar.append(y)
    cols = []
    for x in range(x0, x1 + 1):
        if any(abs(_lum(img.getpixel((x, y))[:3]) - bl) > esik for y in satirlar):
            cols.append(x)
    if not cols:
        return None
    # kutunun içindeki ilk/son mürekkepten başlayıp boşluk sınırına kadar genişlet
    ix0, ix1 = int(rect_pt[0] * PX), int(rect_pt[2] * PX)
    inner = [c for c in cols if ix0 <= c <= ix1] or cols
    gap = max(8, int((y1 - y0) * 1.1))
    a, b = inner[0], inner[-1]
    for c in sorted((c for c in cols if c < a), reverse=True):
        if a - c > gap:
            break
        a = c
    for c in sorted(c for c in cols if c > b):
        if c - b > gap:
            break
        b = c
    rows = [y for y in satirlar if any(abs(_lum(img.getpixel((x, y))[:3]) - bl) > esik for x in range(a, b + 1, 1))]
    if not rows:
        return None
    return pymupdf.Rect(a / PX, rows[0] / PX, (b + 1) / PX, (rows[-1] + 1) / PX)


def tekduze(img: Image.Image, rect_pt, bg, tol: int = 16, oran: float = 0.985) -> bool:
    """Alan arka plan rengiyle mi dolu (yazı/görsel yok)?"""
    W, H = img.size
    bl = _lum(bg)
    x0, y0 = max(0, int(rect_pt[0] * PX)), max(0, int(rect_pt[1] * PX))
    x1, y1 = min(W - 1, int(rect_pt[2] * PX)), min(H - 1, int(rect_pt[3] * PX))
    n = ok = 0
    for x in range(x0, x1 + 1, 2):
        for y in range(y0, y1 + 1, 2):
            n += 1
            ok += abs(_lum(img.getpixel((x, y))[:3]) - bl) <= tol
    return n == 0 or ok / n >= oran


def kosular(img: Image.Image, rect_pt, bg, esik: int = 45, bosluk_px: int = 3):
    """rect içindeki mürekkep sütun koşuları [(x0, x1), ...] (pt)."""
    W, H = img.size
    bl = _lum(bg)
    x0, x1 = max(0, int(rect_pt[0] * PX)), min(W - 1, int(rect_pt[2] * PX))
    y0, y1 = max(0, int(rect_pt[1] * PX)), min(H - 1, int(rect_pt[3] * PX))
    out, a, son = [], None, None
    for x in range(x0, x1 + 1):
        ink = any(abs(_lum(img.getpixel((x, y))[:3]) - bl) > esik for y in range(y0, y1 + 1))
        if ink:
            if a is None:
                a = x
            elif x - son > bosluk_px:
                out.append((a / PX, (son + 1) / PX))
                a = x
            son = x
    if a is not None:
        out.append((a / PX, (son + 1) / PX))
    return out


def halka_orani(img: Image.Image, box_px, bg, pad: int = 4, tol: int = 20) -> float:
    """Kutunun çevresindeki halkada zemin rengine yakın piksel oranı."""
    x0, y0, x1, y1 = [int(v) for v in box_px]
    W, H = img.size
    bl = _lum(bg)
    px_ = []
    for x in range(max(0, x0 - pad), min(W, x1 + pad), 2):
        for y in (max(0, y0 - pad), min(H - 1, y1 + pad)):
            px_.append(img.getpixel((x, y))[:3])
    for y in range(max(0, y0 - pad), min(H, y1 + pad), 2):
        for x in (max(0, x0 - pad), min(W - 1, x1 + pad)):
            px_.append(img.getpixel((x, y))[:3])
    if not px_:
        return 0.0
    return sum(abs(_lum(c) - bl) <= tol for c in px_) / len(px_)
