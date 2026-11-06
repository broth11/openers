"""Work drawings for the two mathematician profile slides in MAI HL U5 L6 (Pearson, Spearman).

Original drawings of the idea behind each coefficient, not reproductions of any historical figure. The data are invented
(Galton-style heights; eight pupils' ranks), and every number printed on a slide is computed here.
Colours are the deck's CSS variables (classes pf-pos, pf-neg, pf-grid, pf-axis, pf-lab), so the viewer's theme picker recolours them.
Text is set at 22 to 24 user units on a 500 x 340 viewBox, which renders at about 22 px on a 1280 x 800 screen
(the deck check wants labels of at least 85 % of the body size).
"""
import numpy as np
import sympy as sp

W, H = 500, 340


def ranks(v):
    out = []
    for a in v:
        less = sum(1 for b in v if b < a); eq = sum(1 for b in v if b == a)
        out.append(sp.Rational(2 * less + eq + 1, 2))
    return out


# ------------------------------------------------------------------ Pearson: the product of deviations
PX = [64.5, 65.5, 66.5, 67.0, 68.0, 69.0, 69.5, 70.5, 71.0, 72.5]      # parents' mid-height, inches (invented)
PY = [66.0, 67.8, 65.5, 69.5, 67.0, 68.5, 70.5, 67.2, 71.0, 70.5]      # child's height, inches (invented)
R_P = float(np.corrcoef(PX, PY)[0, 1])


def pearson_svg():
    L, R, T, B = 66, 486, 14, 286                       # plot box
    x0, x1, y0, y1 = 63.0, 74.0, 63.0, 74.0              # data window
    sx = lambda v: L + (v - x0) / (x1 - x0) * (R - L)
    sy = lambda v: B - (v - y0) / (y1 - y0) * (B - T)
    mx, my = sum(PX) / len(PX), sum(PY) / len(PY)
    out = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">']
    out.append(f'<rect x="{L}" y="{T}" width="{R - L}" height="{B - T}" class="pf-grid" stroke-width="1"/>')
    # one rectangle per point: from the point to the pair of means
    for a, b in zip(PX, PY):
        pos = (a - mx) * (b - my) > 0
        xa, xb = sorted((sx(a), sx(mx))); ya, yb = sorted((sy(b), sy(my)))
        out.append(f'<rect x="{xa:.1f}" y="{ya:.1f}" width="{xb - xa:.1f}" height="{yb - ya:.1f}" class="{"pf-pos" if pos else "pf-neg"}" '
                   f'fill-opacity="0.20" stroke-opacity="0.55" stroke-width="1.2"/>')
    out.append(f'<line x1="{sx(mx):.1f}" y1="{T}" x2="{sx(mx):.1f}" y2="{B}" class="pf-axis" stroke-width="1.6" stroke-dasharray="7 5"/>')
    out.append(f'<line x1="{L}" y1="{sy(my):.1f}" x2="{R}" y2="{sy(my):.1f}" class="pf-axis" stroke-width="1.6" stroke-dasharray="7 5"/>')
    for a, b in zip(PX, PY):
        pos = (a - mx) * (b - my) > 0
        out.append(f'<circle cx="{sx(a):.1f}" cy="{sy(b):.1f}" r="5.5" class="{"pf-pos" if pos else "pf-neg"}" stroke="none"/>')
    # quadrant signs in the corners
    for (cx, cy, sign, cls) in ((R - 20, T + 30, '+', 'pf-pos'), (L + 20, B - 10, '+', 'pf-pos'), (L + 20, T + 30, '−', 'pf-neg'), (R - 20, B - 10, '−', 'pf-neg')):
        out.append(f'<text x="{cx}" y="{cy}" text-anchor="middle" font-size="32" font-weight="700" class="{cls}" stroke="none">{sign}</text>')
    out.append(f'<text x="{(L + R) / 2}" y="{H - 10}" text-anchor="middle" font-size="23" class="pf-lab">parents’ height</text>')
    out.append(f'<text transform="translate(22 {(T + B) / 2}) rotate(-90)" text-anchor="middle" font-size="23" class="pf-lab">child’s height</text>')
    out.append('</svg>')
    return ''.join(out)


# ------------------------------------------------------------------ Spearman: two rankings of the same pupils
RA = list(range(1, 9))                  # rank in school cleverness
RB = [2, 1, 4, 3, 5, 7, 6, 8]           # rank for hearing pitch (invented)
RS = sp.Rational(1) - sp.Rational(6 * sum((a - b) ** 2 for a, b in zip(RA, RB)), 8 * (8 ** 2 - 1))
assert RS == sp.Rational(13, 14)
assert abs(float(RS) - float(np.corrcoef(RA, RB)[0, 1])) < 1e-12        # r_s is Pearson's r on the ranks (no ties)
RS_F = float(RS)


def spearman_svg():
    xl, xr, top, gap = 150, 350, 82, 31
    y = lambda k: top + (k - 1) * gap
    out = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">']
    out.append(f'<text x="{xl}" y="30" text-anchor="middle" font-size="23" font-weight="700" class="pf-lab">Cleverness</text>')
    out.append(f'<text x="{xr}" y="30" text-anchor="middle" font-size="23" font-weight="700" class="pf-lab">Pitch</text>')
    out.append(f'<text x="{xl}" y="58" text-anchor="middle" font-size="22" class="pf-lab">rank</text>')
    out.append(f'<text x="{xr}" y="58" text-anchor="middle" font-size="22" class="pf-lab">rank</text>')
    for a, b in zip(RA, RB):
        cls = 'pf-pos'
        out.append(f'<line x1="{xl}" y1="{y(a)}" x2="{xr}" y2="{y(b)}" class="{cls}" stroke-width="3.2" stroke-opacity="0.85"/>')
    for k in RA:
        out.append(f'<circle cx="{xl}" cy="{y(k)}" r="5.5" class="pf-ink"/><circle cx="{xr}" cy="{y(k)}" r="5.5" class="pf-ink"/>')
        out.append(f'<text x="{xl - 16}" y="{y(k) + 7.5}" text-anchor="end" font-size="22" class="pf-lab">{k}</text>')
        out.append(f'<text x="{xr + 16}" y="{y(k) + 7.5}" text-anchor="start" font-size="22" class="pf-lab">{k}</text>')
    out.append('</svg>')
    return ''.join(out)


if __name__ == '__main__':
    print('Pearson drawing r =', round(R_P, 3), '| Spearman drawing r_s =', RS, '=', round(RS_F, 3))
