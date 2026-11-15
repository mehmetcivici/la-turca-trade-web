"""Logo dosyalarını üretir: yazılar fontTools ile vektöre çevrilir (font gerektirmez).
Kullanım: python3 scripts/make-logo.py <fonts_dir>
"""
import sys, json, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib import instancer

FD = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, CREAM, COPPER, COPPER_L = "#1F2F4A", "#F5F0E8", "#B4643C", "#D9946A"

SYMBOL = [
    ("circle", {"cx": 50, "cy": 9, "r": 3.4}),
    ("path", {"d": "M41 23C42 16 46 13.5 50 13.5C54 13.5 58 16 59 23Z"}),
    ("path", {"d": "M42.5 25L57.5 25C56.6 31 56.3 37 57.5 42C67 49 76.5 61 76 77C75.5 90 68 99 62 103L64.5 108L35.5 108L38 103C32 99 24.5 90 24 77C23.5 61 33 49 42.5 42C43.7 37 43.4 31 42.5 25Z"}),
    ("path", {"d": "M31 66C21 60 15 48 12.5 37L8.5 29.5C8 28.5 9 27.6 10 28.2L16.5 33C19 45 24 54 33 59Z"}),
    ("path", {"d": "M57 30C70 27 84 31 84 45C84 56 78 63 72 67L69.5 62.5C74 59 78.5 53 78.5 45.5C78.5 36 70 33.5 57.5 36Z"}),
]
BAND_Y, BAND_W = 79, 3.2

def text_path(font, text, size, x, y, tracking=0.0):
    gs = font.getGlyphSet(); cmap = font.getBestCmap(); upm = font["head"].unitsPerEm
    s = size / upm; out = []; cx = x
    hmtx = font["hmtx"]
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (s, 0, 0, -s, cx, y))
        gs[g].draw(tp)
        out.append(pen.getCommands())
        cx += hmtx[g][0] * s + tracking * size
    return " ".join(o for o in out if o), cx - tracking * size

serif = TTFont(os.path.join(FD, "InstrumentSerif-Regular.ttf"))
sans = instancer.instantiateVariableFont(TTFont(os.path.join(FD, "InstrumentSans.ttf")), {"wght": 600, "wdth": 100})

# Yatay logo: sembol 0..100 x 0..120 ölçeğinde, 70 px yüksekliğe ölçeklenir.
SYM_H = 70; k = SYM_H / 120
word_d, word_end = text_path(serif, "La Turca", 56, 66, 44, -0.008)
trade_d, trade_end = text_path(sans, "TRADE", 13.5, 69, 66, 0.42)
W = round(max(word_end, trade_end) + 4)
H = 72

def symbol_svg(fill, gap, scale=1.0, tx=0, ty=0):
    parts = []
    for tag, a in SYMBOL:
        attrs = " ".join(f'{k_}="{v}"' for k_, v in a.items())
        parts.append(f"<{tag} {attrs}/>")
    g = f'<g transform="translate({tx} {ty}) scale({scale})"><g fill="{fill}">{"".join(parts)}</g>'
    g += f'<path d="M20 {BAND_Y}L80 {BAND_Y}" stroke="{gap}" stroke-width="{BAND_W}"/></g>'
    return g

def horizontal(fg, accent, gap, bg=None):
    rect = f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*3}" height="{H*3}" role="img" aria-label="La Turca Trade">'
            f'{rect}{symbol_svg(fg, gap if not bg else bg, k, 0, 1)}'
            f'<path fill="{fg}" d="{word_d}"/><path fill="{accent}" d="{trade_d}"/></svg>')

def symbol_file(fg, gap, bg=None, pad=0):
    vb = f"{-10-pad} {-pad} {120+2*pad} {120+2*pad}"
    rect = f'<rect x="{-10-pad}" y="{-pad}" width="{120+2*pad}" height="{120+2*pad}" rx="{(120+2*pad)*0.18}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{rect}{symbol_svg(fg, bg or gap)}</svg>'

B = os.path.join(ROOT, "brand")
open(os.path.join(B, "la-turca-trade-logo.svg"), "w").write(horizontal(NAVY, COPPER, CREAM))
open(os.path.join(B, "la-turca-trade-logo-beyaz.svg"), "w").write(horizontal(CREAM, COPPER_L, NAVY))
open(os.path.join(B, "la-turca-trade-sembol.svg"), "w").write(symbol_file(NAVY, CREAM))
open(os.path.join(B, "la-turca-trade-sembol-kutu.svg"), "w").write(symbol_file(CREAM, NAVY, NAVY, 14))
open(os.path.join(B, "la-turca-trade-sembol-acik.svg"), "w").write(symbol_file(CREAM, NAVY))
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
open(os.path.join(ROOT, "src/app/icon.svg"), "w").write(symbol_file(CREAM, NAVY, NAVY, 14))

# React bileşeni için yol verisi
json.dump({"w": W, "h": H, "k": k, "word": word_d, "trade": trade_d, "symbol": SYMBOL, "bandY": BAND_Y, "bandW": BAND_W},
          open(os.path.join(ROOT, "src/components/logo-data.json"), "w"))
print("ok", W, H)
