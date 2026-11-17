#!/usr/bin/env python3
"""
Star Termos kataloğunu La Turca Trade için hazırlar.

    python3 scripts/katalog/star.py            # es + pt + en
    python3 scripts/katalog/star.py es         # tek dil

- es / pt: ürün metinleri, teknik etiketler, ısı değerleri, dipnotlar, "Hakkımızda" sayfası çevrilir.
  Sayılar (ölçü, hacim, barkod) asla yeniden yazılmaz; yalnızca etiketleri çevrilir.
  Konteyner satırları yalnızca çarpım tutuyorsa (kutu × adet = toplam) yeniden yazılır.
- Her dil: üretici iletişim bilgileri arka kapaktan kaldırılır, yerine La Turca Trade (Güney Amerika satış ofisi)
  bilgileri ve QR gelir; www.startermos.com → www.laturcatrade.com; boş köşelere La Turca Trade logosu konur.

Gerçek metin olan satırlar silinip (redaksiyon) yeniden yazılır; vektör/raster satırlar zemin rengiyle kapatılıp
üstüne yazılır. Zemini tekdüze olmayan (fotoğraf üstü) satırlara dokunulmaz.
"""
from __future__ import annotations

import os
import re
import statistics
import sys
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import (  # noqa: E402
    PROJE, PX, Satir, _lum, arka_plan, bos_sag_sinir, font, genislik, logo_boyutu, logo_koy, logo_yeri,
    murekkep, murekkep_orani, kosular, halka_orani, norm, ocr, qr_png, rgb01, sayfa_goruntu, site_bilgisi, tekduze, yazi_rengi, FONTS,
)
import pymupdf  # noqa: E402
from PIL import Image  # noqa: E402

KAYNAK = os.path.join(PROJE, "kataloglar", "star-termos-catalogo-2025.pdf")
CIKTI = os.path.join(PROJE, "kataloglar", "star-termos-catalogo-2025-{dil}.pdf")
ETIKET = "star"
DILLER = ("es", "pt", "en")
LACIVERT = (0x26, 0x36, 0x58)


def up(t: str) -> str:
    return norm(t).upper().replace("İ", "I")


def canon(t: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", up(t))


# ====================================================================== sözlük
ETIKET_RE = [
    ("raw", re.compile(r"^RAW ?MATERIALS?")),
    ("size", re.compile(r"^BOX ?SIZE ?\(? ?CM ?\)?\|?")),
    ("vol", re.compile(r"^BOX ?VOLUME ?\(?M[^)\s:]{0,2}\)?\)?")),
    ("qt", re.compile(r"^[OQ0D]T ?IN ?BOX[.I|]?")),
    ("bar", re.compile(r"^BARCODE")),
]
ETIKET_ASIL = {"raw": "RAW MATERIALS", "size": "BOX SIZE (cm)", "vol": "BOX VOLUME (m³)", "qt": "QT in BOX", "bar": "BARCODE"}
ETIKET_CEV = {
    "es": {"raw": "MATERIALES", "size": "CAJA (cm)", "vol": "VOL. CAJA (m³)", "qt": "UDS./CAJA", "bar": "CÓDIGO EAN"},
    "pt": {"raw": "MATERIAIS", "size": "CAIXA (cm)", "vol": "VOL. CAIXA (m³)", "qt": "UNID./CAIXA", "bar": "CÓDIGO EAN"},
}
ADET = {"es": "uds.", "pt": "unid."}
KUTU = {"es": "cajas", "pt": "caixas"}

MALZEME = {  # canon → (es, pt)
    "PPDOUBLEGLASS": ("PP+Doble vidrio", "PP+Vidro duplo"),
    "ABSDOUBLEGLASS": ("ABS+Doble vidrio", "ABS+Vidro duplo"),
    "PPSTAINLESSSTEEL": ("PP+Acero inoxidable", "PP+Aço inoxidável"),
    "PP304STAINLESSSTEEL": ("PP+Acero inoxidable 304", "PP+Aço inoxidável 304"),
    "PP304STAINLESS": ("P.P.+Inox. 304", "P.P.+Inox. 304"),
    "PCPPSTAINLESSSTEEL": ("PC+PP+Acero inoxidable", "PC+PP+Aço inoxidável"),
}

SERILER = ["MOREPSE", "KASTEL SOFT", "KASTEL SPECIAL", "ZAGANA", "MIMOZA", "DYNAMIC", "EAST", "ELEGANT", "SOOTHE",
           "LOCKSIP", "TRAILMATE", "AQUA", "THERMBOX", "HORECA", "XS", "CAMPING"]
BASLIK = {  # canon → (es, pt)
    "TRANSPARENTMUGS": ("MUGS TRANSPARENTES", "CANECAS TRANSPARENTES"),
    "TRANSPARENTCOLOREDMUGS": ("MUGS TRANSPARENTES DE COLORES", "CANECAS TRANSPARENTES COLORIDAS"),
    "OPAQUECOLOREDMUGS": ("MUGS OPACOS DE COLORES", "CANECAS OPACAS COLORIDAS"),
}

TAM = {  # canon → (es, pt)  — tek satırlık sabit metinler
    "HEATVALUES": ("VALORES TÉRMICOS:", "DESEMPENHO TÉRMICO:"),
    "LEAKPROOFLID": ("Tapa antiderrame", "Tampa antivazamento"),
    "SPECIALDESIGNLOCKINGLID": ("Tapa con cierre especial", "Tampa com trava especial"),
    "NONSLIPBOTTOMBASE": ("Base antideslizante", "Base antiderrapante"),
    "140MLSTAINLESS": ("Vaso de 140 ML", "Copo de 140 ML"),
    "STEELCUP": ("de acero inox.", "de aço inox."),
    "500MLSTAINLESS": ("Cuerpo de 500 ML", "Corpo de 500 ML"),
    "STEELBODY": ("de acero inox.", "de aço inox."),
    "ADJUSTABLEINNER": ("Tapa interior", "Tampa interna"),
    "COVER": ("regulable", "ajustável"),
    "PRODUCTS": ("PRODUCTOS", "PRODUTOS"),
    "NOTES": ("NOTAS", "ANOTAÇÕES"),
    "QUALITY": ("CALIDAD", "QUALIDADE"),
    "SUSTAINABILITY": ("SOSTENIBILIDAD", "SUSTENTABILIDADE"),
    "TREND": ("TENDENCIA", "TENDÊNCIA"),
    "PRACTIC": ("PRÁCTICO", "PRÁTICO"),
    "DESIGN": ("DISEÑO", "DESIGN"),
    "DAILY": ("DIARIO", "DIÁRIO"),
    "LIFE": ("VIDA", "VIDA"),
}

SLOGAN = {"es": "EN CADA MOMENTO DE TU VIDA...", "pt": "EM CADA MOMENTO DA SUA VIDA...", "en": "AT ANY MOMENT OF YOUR LIFE..."}

ACIKLAMA = [  # (desen, es, pt) — {0} yakalanan kapasite
    (r"^([\d.,]+ ?LT) DOUBLE GLASS ?VACUUM FLASK$", "{0} Termo de vacío de doble vidrio", "{0} Garrafa térmica de vidro duplo"),
    (r"^([\d.,]+ ?LT) DOUBLE GLASS ?SOLID BODY VACUUM FLASK$", "{0} Termo de doble vidrio, cuerpo liso", "{0} Garrafa térmica de vidro duplo, corpo liso"),
    (r"^([\d.,]+ ?LT) DOUBLE GLASS ?STRIPED BODY VACUUM FLASK$", "{0} Termo de doble vidrio, cuerpo estriado", "{0} Garrafa térmica de vidro duplo, corpo canelado"),
    (r"^([\d.,]+ ?LT) DOUBLE GLASS CHAMBER$", "{0} Termo con ampolla de doble vidrio", "{0} Garrafa com ampola de vidro duplo"),
    (r"^ROSE ?GOLD HOOPED VACUUM FLASK$", "y aros en oro rosa", "e aros em ouro rosé"),
    (r"^CHROME HOOPED VACUUM FLASK$", "y aros cromados", "e aros cromados"),
    (r"^(\d+) ?ML MUG$", "Mug de {0} ml", "Caneca de {0} ml"),
    (r"^([\d.,]+ ?LT) STAINLESS STEEL THERMOS$", "{0} Termo de acero inoxidable", "{0} Garrafa térmica de aço inox"),
    (r"^([\d.,]+ ?LT) STAINLESS STEEL PICNIC THERMOS$", "{0} Termo de picnic de acero inoxidable", "{0} Garrafa térmica de piquenique inox"),
    (r"^(\S+-\d+) ([FC]) ?HANDLE$", "{0} asa {1}", "{0} alça {1}"),
    # HoReCa / Camping çok satırlı malzeme
    (r"^:? ?P\.?P\.? ?\+ ?(\d{3}) STAINLESS$", ": P.P.+Acero inox. {0}", ": P.P.+Aço inox. {0}"),
    (r"^STEEL INNER CHAMBER, ?(\d{3}) STAINLESS$", "en cámara interior, acero inox. {0}", "na câmara interna, aço inox. {0}"),
    (r"^STEEL (?:CUTHER|OUTHER|OUTER) BODY$", "en cuerpo exterior", "no corpo externo"),
]
ACIKLAMA = [(re.compile(d), es, pt) for d, es, pt in ACIKLAMA]

# Büyük harfli iki satırlık açıklamalar: "350 ML | 11,90 OZ" + ifade
KAPASITE_RE = re.compile(r"^([\d.,]+ ?(?:ML|LT) ?\|? ?[\d.,]+ OZ)\s*(.*)$")
IFADE = {
    "SPORTSERIESSTAINLESSSTEELTHERMOS": ("TERMO DE ACERO INOXIDABLE SERIE SPORT", "GARRAFA TÉRMICA INOX SÉRIE SPORT"),
    "SOOTHESERIESSTAINLESSSTEELTHERMOS": ("TERMO DE ACERO INOXIDABLE SERIE SOOTHE", "GARRAFA TÉRMICA INOX SÉRIE SOOTHE"),
    "LOCKSIPSERIESSTAINLESSSTEELTHERMOS": ("TERMO DE ACERO INOXIDABLE SERIE LOCKSIP", "GARRAFA TÉRMICA INOX SÉRIE LOCKSIP"),
    "TRAILMATESTAINLESSSTEELTHERMOS": ("TERMO DE ACERO INOXIDABLE TRAILMATE", "GARRAFA TÉRMICA INOX TRAILMATE"),
    "AQUASERIESSTAINLESSSTEELTUMBLERTHERMOS": ("VASO TÉRMICO DE ACERO INOXIDABLE SERIE AQUA", "COPO TÉRMICO INOX SÉRIE AQUA"),
    "FOODSTORAGETHERMOS": ("TERMO PARA ALIMENTOS", "POTE TÉRMICO PARA ALIMENTOS"),
    "STAINLESSSTEELTHERMOS": ("TERMO DE ACERO INOXIDABLE", "GARRAFA TÉRMICA INOX"),
}

ISI = {4: 87, 8: 80, 12: 73}
ISI_RE = re.compile(r"^[0O] ?- ?(\d{1,2}) ?HOURS")
KONT_RE = re.compile(r"^(\d\d) ?(DC|HC) ?[/|]{1,2} ?(\d+) ?BOX ?\* ?(\d+) ?= ?(\d+) ?PCS")
DIPNOT1 = "DUE TO AMBIENT CONDITIONS,"
DIPNOT2 = "THE HEAT VALUES LISTED ABOWE MAY VARY BY + / - A FEW DEGREES."
DIPNOT_CEV = {
    "es": ("DEBIDO A LAS CONDICIONES AMBIENTALES,", "LOS VALORES TÉRMICOS INDICADOS PUEDEN VARIAR ± ALGUNOS GRADOS."),
    "pt": ("DEVIDO ÀS CONDIÇÕES AMBIENTAIS,", "OS VALORES TÉRMICOS INDICADOS PODEM VARIAR ± ALGUNS GRAUS."),
}

HAKKIMIZDA = {
    "es": [
        "Star Termos es un fabricante de termos fundado en Estambul, con 28 años de experiencia en el sector y más de 10 años "
        "produciendo termos. Desde su fundación busca responder a las necesidades de sus clientes y garantizar su satisfacción "
        "con termos duraderos y de alta calidad.",
        "Star Termos fabrica una amplia gama de termos en sus propias plantas, con las tecnologías y los materiales más recientes "
        "y un equipo de I+D avanzado: termos de vidrio, termos de acero, termos para el canal HoReCa, termos para exteriores, "
        "vasos térmicos, mugs de doble pared y mucho más.",
        "Star Termos cuida que sus termos conserven bebidas calientes y frías durante mucho tiempo y los fabrica con materias "
        "primas de la más alta calidad. Así, sus termos mantienen las bebidas calientes hasta 12 horas y frías hasta 24 horas.",
        "Star Termos diseña sus termos para uso individual y profesional, en modelos desde 250 ml hasta 8 L. Para uso individual, "
        "termos para la vida diaria; para uso profesional, termos para camping, picnic, actividades al aire libre y uso industrial.",
        "Además de Turquía, Star Termos exporta sus termos a numerosos países y es reconocida en los mercados internacionales "
        "por la calidad y la estética de sus modelos.",
        "<b>NUESTRA VISIÓN</b>",
        "Como Star Termos, trabajamos para ofrecer el mejor servicio a nuestros clientes con nuestra calidad global y local. "
        "Queremos hacer la vida de las personas más cómoda y agradable con nuestros productos y servicios.",
        "<b>NUESTRA MISIÓN</b>",
        "Como Star Termos, nos comprometemos a ofrecer productos fiables y duraderos, fabricando termos de vidrio y líneas de "
        "termos de alta calidad. Innovamos constantemente para responder a las necesidades y expectativas de las personas. "
        "En pocas palabras, queremos estar «en cada momento de tu vida...»",
    ],
    "pt": [
        "A Star Termos é uma fabricante de garrafas térmicas fundada em Istambul, com 28 anos de experiência no setor e mais de "
        "10 anos produzindo garrafas térmicas. Desde a fundação, busca atender às necessidades dos clientes e garantir sua "
        "satisfação com produtos duráveis e de alta qualidade.",
        "A Star Termos fabrica uma ampla linha de garrafas térmicas em suas próprias plantas, com as tecnologias e os materiais "
        "mais recentes e uma equipe de P&amp;D avançada: garrafas de vidro, garrafas de aço, linha HoReCa, garrafas para uso "
        "ao ar livre, copos térmicos, canecas de parede dupla e muito mais.",
        "A Star Termos garante que suas garrafas conservem bebidas quentes e frias por muito tempo e as fabrica com matérias-"
        "primas da mais alta qualidade. Assim, mantêm as bebidas quentes por até 12 horas e frias por até 24 horas.",
        "A Star Termos projeta suas garrafas para uso individual e profissional, em modelos de 250 ml a 8 L. Para uso "
        "individual, garrafas para o dia a dia; para uso profissional, garrafas para camping, piquenique, atividades ao ar "
        "livre e uso industrial.",
        "Além da Turquia, a Star Termos exporta para diversos países e é reconhecida nos mercados internacionais pela "
        "qualidade e pela estética de seus modelos.",
        "<b>NOSSA VISÃO</b>",
        "Como Star Termos, trabalhamos para oferecer o melhor serviço aos nossos clientes com nossa qualidade global e local. "
        "Queremos tornar a vida das pessoas mais confortável e agradável com nossos produtos e serviços.",
        "<b>NOSSA MISSÃO</b>",
        "Como Star Termos, nos comprometemos a oferecer produtos confiáveis e duráveis, fabricando garrafas térmicas de vidro "
        "e linhas de alta qualidade. Inovamos constantemente para atender às necessidades e expectativas das pessoas. "
        "Em resumo, queremos estar «em cada momento da sua vida...»",
    ],
}

ARKA = {
    "es": {"ofis": "Oficina de ventas para Sudamérica", "sehir": "Estambul, Turquía", "web": "www.laturcatrade.com"},
    "pt": {"ofis": "Escritório de vendas para a América do Sul", "sehir": "Istambul, Turquia", "web": "www.laturcatrade.com"},
    "en": {"ofis": "South America sales office", "sehir": "Istanbul, Türkiye", "web": "www.laturcatrade.com"},
}


# ====================================================================== öğeler
@dataclass
class Oge:
    text: str
    box: pymupdf.Rect
    span: bool
    size: float | None = None
    color: tuple | None = None
    weight: str = "light"
    track: float = 0.0
    x: float | None = None  # çizim başlangıcı (pt)
    base: float | None = None
    chars: list = field(default_factory=list)


def span_ogeleri(page: pymupdf.Page) -> list[Oge]:
    out = []
    for b in page.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                ch = [c for c in s["chars"] if c["c"].strip()]
                if not ch:
                    continue
                # metin içi boşluklar korunur, baş/son boşluklar atılır
                i0 = s["chars"].index(ch[0])
                i1 = s["chars"].index(ch[-1])
                text = "".join(c["c"] for c in s["chars"][i0:i1 + 1])
                kind = "regular" if "Regular" in s["font"] and "Montserrat" in s["font"] else "light"
                x0, x1 = ch[0]["bbox"][0], ch[-1]["bbox"][2]
                nat = font(kind).text_length(text, fontsize=s["size"])
                track = (x1 - x0 - nat) / (len(text) - 1) if len(text) > 1 else 0.0
                c = s["color"]
                out.append(Oge(
                    text=text, box=pymupdf.Rect(x0, min(c["bbox"][1] for c in ch), x1, max(c["bbox"][3] for c in ch)),
                    span=True, size=s["size"], color=((c >> 16) & 255, (c >> 8) & 255, c & 255), weight=kind,
                    track=max(0.0, track), x=ch[0]["origin"][0], base=ch[0]["origin"][1], chars=ch,
                ))
    return out


def ocr_ogeleri(satirlar: list[Satir], W: float, H: float, spans: list[Oge]) -> list[Oge]:
    out = []
    for s in satirlar:
        R = s.rect(W, H)
        kap = sum((R & o.box).get_area() for o in spans)
        if kap > 0.25 * R.get_area():
            continue
        out.append(Oge(text=norm(s.t), box=R, span=False))
    return out


# ====================================================================== ölçüm (OCR öğeleri)
def px(r) -> tuple:
    return (r[0] * PX, r[1] * PX, r[2] * PX, r[3] * PX)


def olc(img, o: Oge, gercek: str, kind: str, alan: pymupdf.Rect | None = None, uzat: float = 0.0,
        maks_track: float = 0.22, komsular: list | None = None):
    """Görüntüden gerçek yazının konumu/boyutu/harf aralığı/rengi. Başarısızsa None."""
    alan = pymupdf.Rect(alan or o.box)
    pad_px = 2
    for t in komsular or []:
        if t == o.box or min(t.x1, alan.x1) - max(t.x0, alan.x0) < 5:
            continue
        ov = min(t.y1, alan.y1) - max(t.y0, alan.y0)
        if ov <= -1.0 or ov > 0.7 * alan.height:
            continue
        pad_px = 0
        if t.y0 > alan.y0:
            alan.y1 = min(alan.y1, (t.y0 + alan.y1) / 2)
        else:
            alan.y0 = max(alan.y0, (t.y1 + alan.y0) / 2)
    for pad in (4, 2):
        bg, sd = arka_plan(img, px(alan), pad=pad)
        if sd <= 14 or halka_orani(img, px(alan), bg, pad=pad) >= 0.72:
            break
    else:
        return None
    ink = murekkep(img, alan, bg, uzat_pt=uzat, pad_px=pad_px)
    if ink is None or ink.height < 2:
        return None
    l, t, r, b = murekkep_orani(gercek, kind)
    size = ink.height / (b - t)
    n = len(gercek)
    track = (ink.width - (r - l) * size) / (n - 1) if n > 1 else 0.0
    return {
        "ink": ink, "bg": bg, "size": size, "track": min(max(0.0, track), maks_track * size),
        "x": ink.x0 - l * size, "base": ink.y1 - b * size,
        "color": yazi_rengi(img, px(ink), bg),
    }


# ====================================================================== çizim planı
@dataclass
class Is:
    text: str
    x: float
    base: float
    size: float
    track: float
    color: tuple
    weight: str
    kapat: pymupdf.Rect | None = None  # vektör/raster: zemin rengiyle kapatılacak alan
    bg: tuple | None = None
    sil: list = field(default_factory=list)  # gerçek metin: redaksiyon alanları
    hizala: str = "left"  # left | right(x = sağ kenar) | center(x = merkez)


def sigdir(text: str, kind: str, size: float, track: float, maxw: float):
    w = genislik(text, size, track, kind)
    if w <= maxw:
        return size, track
    k = maxw / w
    if k >= 0.86:
        return size * k, track * k
    size2, track2 = size * 0.86, track * 0.86
    w2 = genislik(text, size2, 0, kind)
    if w2 > maxw:
        k2 = maxw / w2
        if k2 < 0.9:
            return None
        return size2 * k2, 0.0
    return size2, max(0.0, (maxw - w2) / max(1, len(text) - 1))


def kapanis(size: float, x: float, base: float, w: float) -> pymupdf.Rect:
    return pymupdf.Rect(x - 0.6, base - 0.98 * size, x + w + 0.8, base + 0.28 * size)


class Sayfa:
    def __init__(self, doc, pi: int, img: Image.Image, dil: str):
        self.page = doc[pi]
        self.pi = pi
        self.img = img
        self.dil = dil
        self.W, self.H = self.page.rect.width, self.page.rect.height
        self.isler: list[Is] = []
        self.atlanan: list[str] = []
        self.metin: list[pymupdf.Rect] = []

    # ---------------------------------------------------------------- ekle
    def ekle_span(self, o: Oge, text: str, maxw: float | None = None, kind: str | None = None):
        kind = kind or o.weight
        size, track = o.size, o.track
        if maxw is None:
            maxw = self.sag_sinir(o) - o.x
        fit = sigdir(text, kind, size, track, maxw)
        if fit is None:
            self.atlanan.append(o.text)
            return
        size, track = fit
        bant = pymupdf.Rect(o.box.x0 + 0.3, o.base - 0.45 * o.size, o.box.x1 - 0.3, o.base - 0.2 * o.size)
        sag = o.box.x1 > 0.85 * self.W and o.box.x0 > 0.55 * self.W
        self.isler.append(Is(text, o.box.x1 if sag else o.x, o.base, size, track, o.color, kind, sil=[bant],
                             hizala="right" if sag else "left"))

    def ekle_ocr(self, m: dict, text: str, kind: str, maxw: float | None = None, kapat_ek: pymupdf.Rect | None = None,
                 renk: tuple | None = None, hizala: str = "left"):
        size, track = m["size"], m["track"]
        x = m["x"]
        if maxw is None:
            maxw = self.sag_sinir_ink(m) - x
        fit = sigdir(text, kind, size, track, maxw)
        if fit is None:
            return False
        size, track = fit
        w = genislik(text, size, track, kind)
        if hizala == "right":
            x = m["ink"].x1 - w
        elif hizala == "center":
            x = (m["ink"].x0 + m["ink"].x1) / 2 - w / 2
        ink = m["ink"]
        bg = m["bg"]
        # yeni yazının eski yazıdan taşan kısmı boş zemine düşmeli (yalnız büyük harf yüksekliği bandı)
        if x + w > ink.x1 + 1.5 and not tekduze(self.img, (ink.x1 + 1.5, m["base"] - 0.72 * size, x + w, m["base"]), bg,
                                                tol=24, oran=0.97):
            return False
        kap = None
        for pay in (0.75, 0.45, 0.25):
            k = pymupdf.Rect(min(ink.x0, x) - 1.0, ink.y0 - pay, max(ink.x1, x + w) + 1.0, ink.y1 + pay)
            if kapat_ek is not None:
                k |= kapat_ek
            ic = min(0.3, pay * 0.6)
            seritler = [
                (k.x0, k.y0, ink.x0 - 0.5, k.y1), (ink.x1 + 0.5, k.y0, k.x1, k.y1),
                (ink.x0, k.y0, ink.x1, ink.y0 - ic), (ink.x0, ink.y1 + ic, ink.x1, k.y1),
            ]
            temiz = True
            for j, r in enumerate(seritler):
                if r[2] > r[0] and r[3] > r[1] and not tekduze(self.img, r, bg, tol=42, oran=0.9):
                    R = pymupdf.Rect(r)
                    if j >= 2 and any((R & t).get_area() > 0 and not (t & ink).get_area() > 0.5 * ink.get_area()
                                      for t in self.metin):
                        continue
                    temiz = False
                    break
            if temiz:
                kap = k
                break
        if kap is None:
            return False
        self.isler.append(Is(text, x, m["base"], size, track, renk or m["color"], kind, kapat=kap, bg=m["bg"]))
        return True

    def sag_sinir(self, o: Oge) -> float:
        bg, _ = arka_plan(self.img, px(o.box), pad=3)
        return bos_sag_sinir(self.img, px(o.box), bg, int((self.W - 18) * PX)) / PX - 1

    def sag_sinir_ink(self, m: dict) -> float:
        return bos_sag_sinir(self.img, px(m["ink"]), m["bg"], int((self.W - 18) * PX)) / PX - 1

    # ---------------------------------------------------------------- uygula
    def uygula(self):
        p = self.page
        sil = [r for i in self.isler for r in i.sil]
        if sil:
            for r in sil:
                p.add_redact_annot(r, fill=False, cross_out=False)
            p.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        for i in self.isler:
            if i.kapat is not None:
                p.draw_rect(i.kapat, color=None, fill=rgb01(i.bg), overlay=True)
        for i in self.isler:
            yaz(p, i)


def yaz(page: pymupdf.Page, i: Is):
    f = font(i.weight)
    w = genislik(i.text, i.size, i.track, i.weight)
    x = i.x - w if i.hizala == "right" else (i.x - w / 2 if i.hizala == "center" else i.x)
    tw = pymupdf.TextWriter(page.rect, color=rgb01(i.color))
    if i.track:
        for ch in i.text:
            tw.append((x, i.base), ch, font=f, fontsize=i.size)
            x += f.text_length(ch, fontsize=i.size) + i.track
    else:
        tw.append((x, i.base), i.text, font=f, fontsize=i.size)
    tw.write_text(page)


# ====================================================================== çeviri kuralları
def seri_adi(ad: str) -> str | None:
    import difflib

    c = difflib.get_close_matches(up(ad), SERILER, n=1, cutoff=0.75)
    return c[0] if c else None


def ceviri_basit(t: str, dil: str) -> str | None:
    """Bağlamsız tek satır çevirisi; yoksa None."""
    T = up(t)
    c = canon(t)
    k = 0 if dil == "es" else 1
    if c in TAM:
        return TAM[c][k]
    if c in BASLIK:
        return BASLIK[c][k]
    m = re.match(r"^(.+?) SERIES$", T)
    if m:
        ad = seri_adi(m.group(1))
        if ad:
            return ("SERIE " if dil == "es" else "SÉRIE ") + ad
    for rx, es, pt in ACIKLAMA:
        m = rx.match(T)
        if m:
            g = [x for x in m.groups()]
            # kapasiteyi özgün yazımıyla al
            if g and re.match(r"^[\d.,]+ ?(LT|ML)?$", g[0]):
                g[0] = g[0].replace("LT", "LT").replace("ML", "ML")
            return (es if dil == "es" else pt).format(*g)
    m = ISI_RE.match(T)
    if m:
        n = int(m.group(1))
        if n in ISI and str(ISI[n]) in T:
            return f"0 - {n} horas 96 °C - {ISI[n]} °C"
    m = KONT_RE.match(T)
    if m:
        a, kind, n, k_, tot = m.groups()
        n, k_, tot = int(n), int(k_), int(tot)
        if n * k_ != tot:
            if tot % k_ == 0 and len(str(tot // k_)) == len(str(n)) and sum(x != y for x, y in zip(str(tot // k_), str(n))) == 1:
                n = tot // k_
            else:
                return None
        return f"{a} {kind} // {n} {KUTU[dil]}*{k_}={tot} {ADET[dil]}"
    return None


def malzeme(t: str, dil: str) -> str | None:
    c = canon(t)
    if c in MALZEME:
        return MALZEME[c][0 if dil == "es" else 1]
    return None


def adet(t: str, dil: str) -> str | None:
    m = re.match(r"^:?\s*(\d{1,3})\s*(PCS|ADET)\.?$", up(t))
    return f"{m.group(1)} {ADET[dil]}" if m else None


def dipnot_mu(t: str) -> int:
    T = up(t)
    if re.search(r"A[MN][BR]IENT|CONDITI", T) and len(T) < 36:
        return 1
    if re.search(r"VAL[UL]ES|DEG[RP]E|DECPE|LISTED|ABOWE", T) and len(T) > 30:
        return 2
    return 0


# ====================================================================== sayfa işleme
def cevir_sayfa(S: Sayfa, ogeler: list[Oge], dil: str):
    img = S.img
    kullanilan: set[int] = set()
    acik_sayfa = sum(o.span for o in ogeler) > 5  # gerçek metinli sayfalar Montserrat Light kullanıyor

    def stil(o: Oge) -> tuple[str, float | None]:
        return ("light", None) if acik_sayfa else ("regular", None)

    # ---- 1) teknik satırlar: etiket + ":" + değer
    etiketler = []
    for i, o in enumerate(ogeler):
        T = up(o.text)
        for key, rx in ETIKET_RE:
            m = rx.match(T)
            if m:
                etiketler.append((i, key, m))
                break

    def ayni_satir(a: pymupdf.Rect, b: pymupdf.Rect) -> bool:
        ov = min(a.y1, b.y1) - max(a.y0, b.y0)
        return ov > 0.45 * min(a.height, b.height)

    bekleyen = []
    for i, key, m in etiketler:
        o = ogeler[i]
        # aynı satırdaki ":" ya da ":" ile başlayan değer
        ikiz = [(j, p) for j, p in enumerate(ogeler) if j != i and ayni_satir(o.box, p.box) and p.box.x0 > o.box.x0 + 5
                and p.box.x0 - o.box.x1 < 60]
        iki_nokta = None
        deger_j = None
        for j, p in sorted(ikiz, key=lambda jp: jp[1].box.x0):
            if p.text.strip() == ":":
                iki_nokta = p.box.x0
                kullanilan.add(j)
                continue
            if iki_nokta is None and p.text.lstrip().startswith(":"):
                iki_nokta = p.box.x0
            if deger_j is None:
                deger_j = j
                break
        yeni = ETIKET_CEV[dil][key]
        if o.span:
            # gerçek metin: etiket, ":" ve değer ayrı span
            if iki_nokta is None:
                S.atlanan.append(o.text)
                continue
            S.ekle_span(o, yeni, maxw=iki_nokta - o.x - 2.5)
            kullanilan.add(i)
            if deger_j is not None:
                p = ogeler[deger_j]
                yd = malzeme(p.text, dil) if key == "raw" else adet(p.text, dil) if key == "qt" else None
                if yd:
                    S.ekle_span(p, yd)
                kullanilan.add(deger_j)
            continue

        # ---- OCR (vektör) satırı
        kind, _ = stil(o)
        T = up(o.text)
        kalan = T[m.end():].strip()
        if iki_nokta is None and kalan.startswith(":"):
            # birleşik satır: iki nokta sütununu bloğun diğer satırlarından al
            komsu = [ogeler[j].box.x0 for j, p in enumerate(ogeler)
                     if ogeler[j].text.lstrip().startswith(":") and 30 < ogeler[j].box.x0 - o.box.x0 < 140
                     and any(ayni_satir(ogeler[j].box, ogeler[ii].box) and abs(ogeler[ii].box.x0 - o.box.x0) < 5
                             for ii, _k, _m in etiketler)]
            if komsu:
                iki_nokta = statistics.median(komsu)
        if iki_nokta is None:
            S.atlanan.append(o.text)
            continue
        etiket_alan = pymupdf.Rect(o.box.x0 - 1, o.box.y0, iki_nokta - 1.2, o.box.y1)
        me = olc(img, o, ETIKET_ASIL[key], kind, alan=etiket_alan)
        if me is None:
            S.atlanan.append(o.text)
            continue
        # ":" işaretinin gerçek yeri: ondan hemen önceye kadar kapat (etiketin kuyruğu kalmasın)
        ks = kosular(img, (o.box.x0 - 1, me["ink"].y0, iki_nokta + 6, me["ink"].y1), me["bg"])
        nokta = [k for k in ks if abs(k[0] - iki_nokta) < 5 and k[1] - k[0] < 0.3 * me["ink"].height]
        kap_ek = pymupdf.Rect(me["ink"].x0, me["ink"].y0, (nokta[0][0] if nokta else iki_nokta) - 0.7, me["ink"].y1)
        bekleyen.append((o.box.x0, me, yeni, kind, iki_nokta, kap_ek, o.text))
        kullanilan.add(i)
        # değer çevirisi (malzeme / adet)
        if key in ("raw", "qt"):
            if kalan.startswith(":"):
                deger_txt = kalan[1:].strip()
                alan = pymupdf.Rect(iki_nokta, o.box.y0, o.box.x1 + 1, o.box.y1)
            elif deger_j is not None:
                p = ogeler[deger_j]
                deger_txt = p.text.lstrip(": ").strip()
                alan = pymupdf.Rect(p.box.x0, p.box.y0, p.box.x1 + 1, p.box.y1)
                kullanilan.add(deger_j)
            else:
                continue
            yd = malzeme(deger_txt, dil) if key == "raw" else adet(deger_txt, dil)
            if yd:
                bg, _ = arka_plan(img, px(alan), pad=4)
                ks = kosular(img, (alan.x0 - 2.5, alan.y0, alan.x1, alan.y1), bg)
                # baştaki ":" koşusunu atla
                if ks and ks[0][1] - ks[0][0] < 0.22 * alan.height and ks[0][0] < iki_nokta + 4:
                    ks = ks[1:]
                mv = None
                if ks:
                    alan = pymupdf.Rect(ks[0][0] - 0.4, alan.y0, alan.x1, alan.y1)
                    mv = olc(img, o, deger_txt, kind, alan=alan)
                if mv is None or not S.ekle_ocr(mv, yd, kind):
                    S.atlanan.append(deger_txt)
        elif deger_j is not None:
            kullanilan.add(deger_j)

    # aynı bloktaki etiketler aynı boyut/aralık/renkte yazılır
    bloklar: dict[int, list] = {}
    for b in bekleyen:
        bloklar.setdefault(round(b[0] / 6), []).append(b)
    for grup in bloklar.values():
        sz = statistics.median(b[1]["size"] for b in grup)
        tr = statistics.median(b[1]["track"] for b in grup)
        renk = tuple(int(statistics.median(b[1]["color"][c] for b in grup)) for c in range(3))
        for x0, me, yeni, kind, iki_nokta, kap_ek, asil in grup:
            me = dict(me, size=sz, track=tr)
            if not S.ekle_ocr(me, yeni, kind, maxw=iki_nokta - me["x"] - 2.5, kapat_ek=kap_ek, renk=renk):
                S.atlanan.append(asil)

    # ---- 2) kalan satırlar
    aciklama: list = []
    sirali = sorted(range(len(ogeler)), key=lambda k: (round(ogeler[k].box.y0), ogeler[k].box.x0))
    for i in sirali:
        if i in kullanilan:
            continue
        o = ogeler[i]
        T = up(o.text)

        # iki satırlık büyük harf açıklama
        mk = KAPASITE_RE.match(T)
        if mk and o.span:
            alt = [j for j in range(len(ogeler)) if j not in kullanilan and j != i and ogeler[j].span
                   and abs(ogeler[j].box.x0 - o.box.x0) < 2 and 0 < ogeler[j].box.y0 - o.box.y1 < 0.9 * o.size
                   and abs(ogeler[j].size - o.size) < 0.2]
            ifade = mk.group(2) + (" " + ogeler[alt[0]].text if alt else "")
            cev = IFADE.get(canon(ifade))
            if cev:
                cev = cev[0 if dil == "es" else 1]
                kap = norm(o.text[: len(mk.group(1))]) if o.text[: len(mk.group(1))].upper() == mk.group(1) else mk.group(1)
                tam = kap + " " + cev
                if alt:
                    a = ogeler[alt[0]]
                    sinir = max(o.box.x1, a.box.x1) + 4
                    satir1, satir2 = bol(tam, o.weight, o.size, o.track, sinir - o.x)
                    S.ekle_span(o, satir1, maxw=S.sag_sinir(o) - o.x)
                    S.ekle_span(a, satir2, maxw=S.sag_sinir(a) - a.x)
                    kullanilan.add(alt[0])
                else:
                    S.ekle_span(o, tam)
                kullanilan.add(i)
                continue

        if not o.span and dipnot_mu(o.text):
            continue  # dipnot_blok() işler
        yeni = ceviri_basit(o.text, dil)
        if yeni is None:
            continue
        kullanilan.add(i)
        if o.span:
            kind = o.weight
            # fotoğraf üstündeki gerçek metin (2-3. sayfa anahtar kelimeleri): zemin sınırı aranmaz
            maxw = S.W - 20 - o.x if o.size and o.size > 11.5 else None
            S.ekle_span(o, yeni, kind=kind, maxw=maxw)
            continue
        # OCR öğesi: stil tahmini
        if canon(o.text) == "HEATVALUES" or ISI_RE.match(T):
            kind = "regular"
            gercek = "HEAT VALUES:" if canon(o.text) == "HEATVALUES" else re.sub(r"^[O0]", "0", norm(o.text))
        elif T.endswith("SERIES") or canon(o.text) in BASLIK:
            kind = "light"
            gercek = o.text
        else:
            kind, _ = stil(o)
            gercek = o.text
        m = olc(img, o, gercek, kind, komsular=S.metin)
        if m is None:
            S.atlanan.append(o.text)
        elif any(rx.match(T) for rx, _e, _p in ACIKLAMA):
            aciklama.append((o, m, yeni, kind))
        elif m["ink"].x1 > 0.88 * S.W:
            if not S.ekle_ocr(m, yeni, kind, maxw=m["ink"].x1 - 0.45 * S.W, hizala="right"):
                S.atlanan.append(o.text)
        elif not S.ekle_ocr(m, yeni, kind):
            S.atlanan.append(o.text)

    # alt alta açıklama satırları aynı boyutta yazılır (en uzun özgün satırın ölçüsü)
    aciklama.sort(key=lambda t: t[0].box.y0)
    gruplar: list[list] = []
    for t in aciklama:
        g = gruplar[-1] if gruplar else None
        if g and abs(g[-1][0].box.x0 - t[0].box.x0) < 4 and -0.6 * t[0].box.height <= t[0].box.y0 - g[-1][0].box.y1 < 0.9 * t[0].box.height:
            g.append(t)
        else:
            gruplar.append([t])
    for g in gruplar:
        ref = min(g, key=lambda t: t[1]["size"])[1]
        for o, m, yeni, kind in g:
            if len(g) > 1:
                l, _t, _r, b = murekkep_orani(re.sub(r"^[O0]", "0", o.text), kind)
                m = dict(m, size=ref["size"], track=ref["track"])
            if not S.ekle_ocr(m, yeni, kind):
                S.atlanan.append(o.text)


def dipnot_blok(S: Sayfa, ogeler: list[Oge], dil: str):
    """İki satırlık ısı dipnotu: satırlar birbirine çok yakın, birlikte ölçülür."""
    img = S.img
    f1 = [o for o in ogeler if not o.span and dipnot_mu(o.text) == 1]
    f2 = [o for o in ogeler if not o.span and dipnot_mu(o.text) == 2]
    for a in f1:
        bs = [b for b in f2 if 0 < b.box.y0 - a.box.y0 < 16]
        if not bs:
            S.atlanan.append(a.text)
            continue
        U = a.box | bs[0].box
        bg, sd = arka_plan(img, px(U), pad=5)
        if sd > 14:
            S.atlanan.append(a.text)
            continue
        ink = murekkep(img, U, bg, uzat_pt=25)
        if ink is None:
            continue
        bl = _lum(bg)
        xs = range(int(ink.x0 * PX), int(ink.x1 * PX))
        satirlar = []
        for y in range(int(ink.y0 * PX), int(ink.y1 * PX) + 1):
            satirlar.append((y, sum(abs(_lum(img.getpixel((x, y))[:3]) - bl) > 45 for x in xs)))
        n = len(satirlar)
        orta = min(satirlar[int(n * 0.3): int(n * 0.7) + 1], key=lambda t: t[1])[0] / PX
        hedef = DIPNOT_CEV[dil]
        olcu = []
        for k, (y0, y1) in enumerate([(ink.y0, orta), (orta, ink.y1)]):
            r = murekkep(img, (ink.x0, y0, ink.x1, y1), bg)
            if r is None:
                break
            gercek = DIPNOT1 if k == 0 else DIPNOT2
            l, t, rr, b = murekkep_orani(gercek, "semibold")
            size = r.height / (b - t)
            track = max(0.0, (r.width - (rr - l) * size) / (len(gercek) - 1))
            m = {"ink": r, "bg": bg, "size": size, "track": min(track, 0.2 * size), "x": r.x0 - l * size,
                 "base": r.y1 - b * size, "color": yazi_rengi(img, px(r), bg), "b": b}
            olcu.append((k, m, y0, y1))
        if len(olcu) < 2:
            continue
        ref = olcu[1][1]
        for k, m, y0, y1 in olcu:
            m["size"], m["track"] = ref["size"], ref["track"]
            m["base"] = m["ink"].y1 - m["b"] * ref["size"]
            m["x"] = ref["x"]
            S.metin.append(pymupdf.Rect(ink.x0, y0, ink.x1, y1) if k == 0 else pymupdf.Rect(ink.x0, ink.y0, ink.x1, orta))
            if not S.ekle_ocr(m, hedef[k], "semibold", maxw=S.W - 30 - m["x"]):
                S.atlanan.append(DIPNOT1 if k == 0 else DIPNOT2)


def bol(text: str, kind: str, size: float, track: float, maxw: float) -> tuple[str, str]:
    kel = text.split(" ")
    for k in range(len(kel) - 1, 0, -1):
        a = " ".join(kel[:k])
        if genislik(a, size, track, kind) <= maxw:
            return a, " ".join(kel[k:])
    return text, ""


# ====================================================================== özel sayfalar
def hakkimizda(S: Sayfa, dil: str):
    """4. sayfa: 'About' bloğunun tamamı (gerçek metin)."""
    p = S.page
    alan = pymupdf.Rect(430.0, 57.0, 698.0, 494.5)
    p.add_redact_annot(alan, fill=False, cross_out=False)
    p.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    paras = "".join(f"<p>{t}</p>" for t in HAKKIMIZDA[dil])
    css = (
        "@font-face {font-family: ML; src: url(Montserrat-Light.ttf);}"
        "@font-face {font-family: ML; font-weight: bold; src: url(Montserrat-SemiBold.ttf);}"
        "* {font-family: ML; color: #d9d9d9; font-size: 8.6pt; line-height: 1.38; margin: 0; padding: 0;}"
        "p {margin: 0 0 3.2pt 0; text-align: left;} b {letter-spacing: 0.6pt;}"
    )
    arc = pymupdf.Archive(os.path.dirname(FONTS["light"]))
    r = p.insert_htmlbox(alan, paras, css=css, archive=arc, scale_low=0.7)
    if r[0] < 0:
        print("  ! hakkımızda bloğu sığmadı", r)


def url_degistir(S: Sayfa, ogeler: list[Oge]):
    for o in ogeler:
        if o.span or "STARTERMOS.COM" not in up(o.text).replace(" ", "") or not up(o.text).startswith("WWW") \
                or o.box.y0 > 0.15 * S.H:
            continue
        m = olc(S.img, o, "www.startermos.com", "light")
        if m is None:
            continue
        # aralıklı yazı: boyutu x-yüksekliğinden tahmin edilen değil, ölçülen boyut; aralığı yeni metne göre koru
        S.ekle_ocr(m, "www.laturcatrade.com", "light", maxw=999, hizala="right" if m["ink"].x1 > S.W * 0.6 else "left")


def slogan(S: Sayfa, ogeler: list[Oge], dil: str):
    for o in ogeler:
        T = up(o.text).replace(" ", "")
        if o.span:
            continue
        if "MOMENTOFYOURLIFE" in T.replace("ATANY", "") or "HAYATINIZIN" in T:
            gercek = "HAYATINIZIN HER ANINDA..." if "HAYATINIZIN" in T else "AT ANY MOMENT OF YOUR LIFE..."
            m = olc(S.img, o, gercek, "light", uzat=45, maks_track=2.0)
            if m is None:
                print("  ! slogan ölçülemedi", o.text)
                continue
            print("    slogan", S.pi + 1, m["color"], round(m["size"], 2), round(m["track"], 2), m["ink"])
            yeni = SLOGAN[dil]
            if dil == "en" and "HAYATINIZIN" not in T:
                continue
            merkez = abs((m["ink"].x0 + m["ink"].x1) / 2 - S.W / 2) < 25
            if not S.ekle_ocr(m, yeni, "light", maxw=S.W - 40, hizala="center" if merkez else "left"):
                print("  ! slogan yazılamadı", o.text)


def arka_kapak(S: Sayfa, dil: str, site: dict):
    """Son sayfa: üretici iletişim bandını La Turca Trade bilgileriyle değiştir."""
    p, img, W, H = S.page, S.img, S.W, S.H
    # bant rengi
    bant, _ = arka_plan(img, (0.20 * W * PX, 0.80 * H * PX, 0.22 * W * PX, 0.82 * H * PX), pad=2)
    alan = pymupdf.Rect(0.025 * W, 0.795 * H, 0.835 * W, 0.99 * H)
    p.add_redact_annot(alan, fill=False, cross_out=False)
    p.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    p.draw_rect(alan, color=None, fill=rgb01(bant), overlay=True)
    a = ARKA[dil]
    # QR → laturcatrade.com/<dil>/
    q = 58
    qr_r = pymupdf.Rect(0.042 * W, 0.852 * H, 0.042 * W + q, 0.852 * H + q)
    p.draw_rect(qr_r + (-3, -3, 3, 3), color=None, fill=(1, 1, 1), overlay=True)
    p.insert_image(qr_r, stream=qr_png(f"{site['url'].rstrip('/')}/{dil}/"), overlay=True)
    # logo + bilgiler (ortada)
    cx = 0.505 * W
    lw, lh = logo_boyutu(150)
    p.insert_image(pymupdf.Rect(cx - lw / 2, 0.808 * H, cx + lw / 2, 0.808 * H + lh),
                   filename=os.path.join(PROJE, "brand", "la-turca-trade-yatay.png"), overlay=True)
    y_cizgi = 0.808 * H + lh + 6
    p.draw_line((0.2 * W, y_cizgi), (0.81 * W, y_cizgi), color=(1, 1, 1), width=0.6, overlay=True)
    satirlar = [
        (a["ofis"].upper() + "  ·  STAR TERMOS & GASTROPLAST", "regular", 7.6, 0.9),
        ("  ·  ".join(x for x in [site.get("email"), a["web"], site.get("phone")] if x), "regular", 9.2, 0.2),
        (", ".join(x for x in [site.get("address"), a["sehir"]] if x), "light", 8.6, 0.2),
    ]
    y = y_cizgi + 14
    for t, kind, size, tr in satirlar:
        S.isler.append(Is(t, cx, y, size, tr, (255, 255, 255), kind, hizala="center"))
        y += size + 6.5


def kapak(S: Sayfa, dil: str):
    """Ön kapak: sol üstte büyük logo + 'Güney Amerika satış ofisi' satırı."""
    lw, lh = logo_boyutu(132)
    x, y = 0.045 * S.W, 0.055 * S.H
    S.page.insert_image(pymupdf.Rect(x, y, x + lw, y + lh), filename=os.path.join(PROJE, "brand", "la-turca-trade-yatay.png"),
                        overlay=True)
    S.isler.append(Is(ARKA[dil]["ofis"].upper(), x + 0.02 * lw, y + lh + 11, 6.4, 1.05, LACIVERT, "regular"))


LOGO_W = 86


def logo_ekle(S: Sayfa) -> str | None:
    W, H = S.W, S.H
    lw, lh = logo_boyutu(LOGO_W)
    m = 0.034
    mx, my = m * W / W, m * W / H
    adaylar = [
        (mx, my), (1 - mx - lw / W, my), (0.30, my), (0.5 - lw / 2 / W, my),
        (mx, 1 - my - lh / H), (1 - mx - lw / W, 1 - my - lh / H), (0.30, 1 - my - lh / H), (0.5 - lw / 2 / W, 1 - my - lh / H),
    ]
    r, lum = logo_yeri(S.img, W * PX / PX, H, lw, lh, adaylar, pad_pt=7)
    if r is None:
        # boş zemin yok (fotoğraf): yazıya değmeyen ilk köşede beyaz plaka üstünde logo
        plaka = None
        for nx, ny in adaylar[:2] + adaylar[4:6]:
            x, y = nx * W, ny * H
            r = pymupdf.Rect(x - 7, y - 6, x + lw + 7, y + lh + 6)
            if not any((r + (-4, -4, 4, 4)).intersects(t) for t in S.metin):
                plaka = r
                break
        if plaka is None:
            return None
        S.page.draw_rect(plaka, color=None, fill=(1, 1, 1), fill_opacity=0.88, radius=0.18, overlay=True)
        logo_koy(S.page, pymupdf.Rect(x, y, x + lw, y + lh), acik_zemin=True)
        return "plaka"
    logo_koy(S.page, r, acik_zemin=lum > 120)
    return f"{r.x0 / W:.2f},{r.y0 / H:.2f}"


# ====================================================================== ana akış
def uret(dil: str):
    site = site_bilgisi()
    doc = pymupdf.open(KAYNAK)
    n = len(doc)
    rapor = []
    for pi in range(n):
        png = sayfa_goruntu(KAYNAK, pi, ETIKET)
        img = Image.open(png).convert("RGB")
        S = Sayfa(doc, pi, img, dil)
        W, H = S.W, S.H
        spans = span_ogeleri(S.page)
        ogeler = spans + ocr_ogeleri(ocr(KAYNAK, pi, ETIKET), W, H, spans)
        S.metin = [o.box for o in ogeler]

        url_degistir(S, ogeler)
        slogan(S, ogeler, dil)
        if dil != "en":
            if pi == 3:
                hakkimizda(S, dil)
                ogeler = [o for o in ogeler if not (o.span and o.box.x0 > 425)]
            cevir_sayfa(S, ogeler, dil)
            dipnot_blok(S, ogeler, dil)
        logo = None
        if pi == 0:
            kapak(S, dil)
            logo = "kapak"
        elif pi == n - 1:
            arka_kapak(S, dil, site)
            logo = "arka"
        S.uygula()
        if logo is None:
            logo = logo_ekle(S)
        rapor.append((pi + 1, len(S.isler), logo, S.atlanan))
    for r in rapor:
        print(f"  s{r[0]:02d}  {r[1]:3d} değişiklik  logo={r[2]}  atlanan={r[3][:6]}")
    doc.set_metadata({**doc.metadata, "title": f"Star Termos — Catálogo 2025 ({dil.upper()}) · La Turca Trade",
                      "author": "La Turca Trade", "producer": "La Turca Trade", "creator": "La Turca Trade"})
    out = CIKTI.format(dil=dil)
    doc.save(out, garbage=4, deflate=True, deflate_images=False, deflate_fonts=True)
    print(f"→ {out}  ({os.path.getsize(out) / 1e6:.1f} MB)")


if __name__ == "__main__":
    for d in (sys.argv[1:] or DILLER):
        print(f"== {d}")
        uret(d)
