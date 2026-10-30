#!/usr/bin/env python3
"""Assemble an AA SL online-lesson deck from a content.json.

    python3 build_deck.py CONTENT.json [--out DIR] [--theme 3b1b|skyblue|goldteal|bluebrown|greengrey|greyline] [--no-picker] [--probe]
    python3 build_deck.py --selftest

By default the deck carries a viewer theme picker (palette button in the bottom bar, T / Shift+T keys, choice
remembered): --theme only sets the theme it opens in. It is built on the skyblue base and skips itself (with a note) for a
greyline deck; --no-picker builds natively in --theme with no picker.

--probe builds the title + each example, lab or gdc slide alone + Your turn and prints each one's own --G
at 1280x800 (or --probe-size WxH) (the deck's --G is the minimum over its slides: this finds the culprit).

Writes two files into --out (default: the current directory, never the skill folder):
  <meta.file>      standalone HTML document (Drive, Classroom, offline)
  artifact.html    the same page without doctype/html/head/body (Artifact tool)

Everything comes from ../assets: deck_template.html, labkit.js, fonts/ (STIX Two Text and
STIX Two Math, OFL) and katex/ (KaTeX, MIT). No network, no other skill needed.
"""
import argparse, base64, copy, json, os, re, sys

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')


def read(*p):
    return open(os.path.join(ASSETS, *p), encoding='utf-8').read()


def katex():
    css, js, auto = read('katex', 'katex_css.html'), read('katex', 'katex_js.html'), read('katex', 'autorender_js.html')
    assert 'KaTeX_Main' in css and css.rstrip().endswith('</style>'), 'KaTeX CSS block not closed'
    assert 'katex' in js and 'renderMathInElement' in auto
    return css, js, auto


def font_css():
    """One family for everything: STIX Two Text (prose, headings) and STIX Two Math (maths)."""
    faces = []
    for fam, fn, st, w in (('STIX Two Math', 'stix-two-math-latin-400-normal', 'normal', 400),
                           ('STIX Two Text', 'stix-two-text-latin-400-normal', 'normal', 400),
                           ('STIX Two Text', 'stix-two-text-latin-400-italic', 'italic', 400),
                           ('STIX Two Text', 'stix-two-text-latin-600-normal', 'normal', 600),
                           ('STIX Two Text', 'stix-two-text-latin-700-normal', 'normal', 700)):
        b = base64.b64encode(open(os.path.join(ASSETS, 'fonts', fn + '.woff2'), 'rb').read()).decode()
        faces.append("@font-face{font-family:'%s';font-style:%s;font-weight:%d;font-display:block;"
                     "src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, st, w, b))
    return '<style>' + ''.join(faces) + '</style>'


def sample_curves(content, n=600):
    """Turn every graph item {kind:'fn', expr, domain?} into pre-sampled pieces in item['pts'].

    expr is sympy syntax in x (x**2 - 5*x + 6, exp(x), log(x) natural, 1/(x - 2) + 3).
    Sampling happens here, not in the page: no eval in the browser, and a piece is cut wherever
    the function is undefined or jumps across the window (vertical asymptote)."""
    import math
    import sympy as sp
    x = sp.Symbol('x', real=True)
    for s in content['slides']:
        g = s.get('graph')
        for it in (g or {}).get('items', []):
            if it.get('kind') != 'fn':
                continue
            w = g['window']
            a, b = it.get('domain', [w['xmin'], w['xmax']])
            f = sp.lambdify(x, sp.sympify(it['expr'], locals={'x': x}), 'math')
            lo, hi = w['ymin'], w['ymax']
            span = max(w['xmax'] - w['xmin'], hi - lo)
            pieces, cur, prev = [], [], None
            for i in range(n + 1):
                xv = a + (b - a) * i / n
                try:
                    yv = float(f(xv))
                    if not math.isfinite(yv):
                        raise ValueError
                except (ValueError, ZeroDivisionError, OverflowError, TypeError):
                    yv = None
                jump = (yv is not None and prev is not None and
                        ((prev > hi + span and yv < lo - span) or (prev < lo - span and yv > hi + span)))
                if yv is None or jump:
                    if len(cur) > 1:
                        pieces.append(cur)
                    cur = [] if yv is None else [[round(xv, 5), round(yv, 5)]]
                else:
                    cur.append([round(xv, 5), round(yv, 5)])
                prev = yv
            if len(cur) > 1:
                pieces.append(cur)
            assert pieces, f"fn {it['expr']!r}: nothing to draw on {a}..{b}"
            it['pts'] = pieces


# ---------- colour bound to symbols (Manim's t2c) ----------
ROLES = ('blue', 'red', 'teal', 'pink', 'green', 'grey', 'orange', 'brown', 'indigo')  # orange: G9X second line (29/09/2026); indigo #5C7CFA: v13, Y2 L20
# commands whose braced arguments are never coloured (text, upright names, existing colours, the answer/grey macros)
T2C_SKIP = {'text': 1, 'textrm': 1, 'textbf': 1, 'textit': 1, 'mathrm': 1, 'operatorname': 1, 'mathbb': 1, 'mathbf': 1,
            'mathcal': 1, 'textcolor': 2, 'color': 1, 'bl': 1, 'gr': 1, 'begin': 1, 'end': 1, 'htmlClass': 1,
            'hspace': 1, 'vspace': 1, 'kern': 1, 'label': 1}


def _group_end(tex, i):
    """tex[i] == '{': index just past the matching '}'."""
    depth = 0
    for j in range(i, len(tex)):
        c = tex[j]
        if c == '\\':
            continue
        if c == '{' and (j == 0 or tex[j - 1] != '\\'):
            depth += 1
        elif c == '}' and (j == 0 or tex[j - 1] != '\\'):
            depth -= 1
            if depth == 0:
                return j + 1
    return len(tex)


def _key_re(key):
    """A key is matched token by token: 'x_B' also matches x_{B}; a command key (\theta) only as that whole command."""
    parts, i = [], 0
    while i < len(key):
        if key[i] == '\\':
            m = re.match(r'\\[A-Za-z]+', key[i:]); parts.append(re.escape(m.group()) + r'(?![A-Za-z])'); i += len(m.group())
        elif key[i] in '_^' and i + 1 < len(key):
            nxt = key[i + 1]
            parts.append(re.escape(key[i]) + r'(?:' + re.escape(nxt) + r'|\{' + re.escape(nxt) + r'\})'); i += 2
        else:
            parts.append(re.escape(key[i])); i += 1
    return re.compile(''.join(parts))


def apply_t2c(tex, bindings, hexes):
    r"""Wrap every whole-token occurrence of a bound symbol in {\textcolor{hex}{...}}.

    bindings: {symbol: role}; hexes: {role: '#RRGGBB'}. Skipped: inside \text{}, \mathrm{} and the
    other T2C_SKIP commands, inside an existing \textcolor{}{} (or \bl{} / \gr{}), and any letter
    that is part of a command name (x never matches in \exp). Longest key first; x in x_B is
    coloured when only x is bound (as Manim does), x_B wins as a whole when it is bound itself."""
    if not bindings:
        return tex
    keys = sorted(bindings, key=len, reverse=True)
    pats = [(k, _key_re(k), hexes[bindings[k]]) for k in keys]
    out, i, n = [], 0, len(tex)
    while i < n:
        c = tex[i]
        if c == '\\':
            m = re.match(r'\\([A-Za-z]+)', tex[i:])
            if m:
                name = m.group(1)
                hit = next(((k, rx, hx) for k, rx, hx in pats if k.startswith('\\') and rx.match(tex, i)), None)
                if hit:
                    mm = hit[1].match(tex, i); out.append('{\\textcolor{%s}{%s}}' % (hit[2], mm.group())); i = mm.end(); continue
                j = i + len(m.group())
                if name in T2C_SKIP:
                    for _ in range(T2C_SKIP[name]):
                        k = j
                        while k < n and tex[k] == ' ':
                            k += 1
                        if k < n and tex[k] == '{':
                            j = _group_end(tex, k)
                out.append(tex[i:j]); i = j; continue
            out.append(tex[i:i + 2]); i += 2; continue
        hit = None
        for k, rx, hx in pats:
            if k.startswith('\\'):
                continue
            mm = rx.match(tex, i)
            if mm:
                hit = (mm, hx); break
        if hit:
            out.append('{\\textcolor{%s}{%s}}' % (hit[1], hit[0].group())); i = hit[0].end()
        else:
            out.append(c); i += 1
    return ''.join(out)


def t2c_prose(text, bindings, hexes):
    """apply_t2c inside the $...$ spans of a prose string (stem, prompt, text); HTML outside is untouched,
    and so is an answer span (<span class="ans">...</span>): the answer stays wholly yellow, like \\bl{}."""
    if not bindings or not text:
        return text
    parts = re.split(r'(<span class="ans">.*?</span>)', text)
    return ''.join(pt if pt.startswith('<span class="ans">') else
                   re.sub(r'\$([^$]+)\$', lambda m: '$' + apply_t2c(m.group(1), bindings, hexes) + '$', pt) for pt in parts)


def resolve_colours(content, hexes):
    """Apply meta.t2c (extended per example by example.t2c) to every tex, prose span, graph label and axis
    name; turn "colorOf": "<symbol>" and "color": "<role>" on graph items into a hex for labkit."""
    deck = content['meta'].get('t2c') or {}
    for b in list(deck.values()):
        assert b in ROLES, f'meta.t2c: unknown role {b!r} (roles: {ROLES}; yellow is the answer, never a role)'
    assert len(deck) <= 3, 'at most three bound symbols per deck'
    for s in content['slides']:
        if s.get('type') == 'lab' and deck:   # v6: a preset may colour bound symbols in its readouts
            s.setdefault('init', {}).setdefault('t2c', {k: hexes[v] for k, v in deck.items()})
        if s.get('type') != 'example':
            continue
        bind = dict(deck); bind.update(s.get('t2c') or {})
        for b in bind.values():
            assert b in ROLES, f'example {s.get("n")}: unknown t2c role {b!r}'
        s['stem'] = t2c_prose(s.get('stem', ''), bind, hexes)
        if s.get('prompt'):
            s['prompt'] = t2c_prose(s['prompt'], bind, hexes)
        for blk in s.get('blocks', []):
            if 'steps' in blk:
                for st in blk['steps']:
                    st['tex'] = apply_t2c(st['tex'], bind, hexes)
            elif 'text' in blk:
                blk['text'] = t2c_prose(blk['text'], bind, hexes)
        g = s.get('graph')
        if not g:
            continue
        w = g.get('window', {})
        for ax in ('x', 'y'):
            nm = w.get(ax + 'name', ax)
            if nm in bind:
                w[ax + 'color'] = hexes[bind[nm]]
        for it in g.get('items', []):
            for key in ('label', 'tex'):
                if isinstance(it.get(key), str):
                    it[key] = apply_t2c(it[key], bind, hexes)
            if 'colorOf' in it:
                sym = it.pop('colorOf')
                assert sym in bind, f'example {s.get("n")}: colorOf {sym!r} is not a bound symbol'
                it['color'] = hexes[bind[sym]]
            elif it.get('color') in ROLES:
                it['color'] = hexes[it['color']]
            elif it.get('color'):
                assert it['color'].upper() == '#B189C6', f'colour {it["color"]!r}: use a role name (the violet angle is the one hex allowed)'
            if it.get('color') and it.get('kind') == 'label':
                it['tex'] = '\\textcolor{%s}{%s}' % (it['color'], it['tex'])


HEX = re.compile(r'#[0-9A-Fa-f]{6}\b')


def expand_hl(content, hl):
    """v13: a graph item with "hl": n is drawn in the highlight colour while step n is the last one shown, and in
    its own colour before (from its step) and after (to its until). It becomes up to three items."""
    for s in content['slides']:
        g = s.get('graph') if s.get('type') == 'example' else None
        if not g:
            continue
        out = []
        for it in g.get('items', []):
            if 'hl' not in it:
                out.append(it); continue
            n = it.pop('hl'); s0 = it.get('step', 0); u = it.get('until')
            assert s0 <= n and (u is None or u >= n), f'hl {n} outside the item\'s steps {s0}..{u}'
            if s0 < n:
                a = dict(it); a['step'] = s0; a['until'] = n - 1; out.append(a)
            h = dict(it); h['step'] = n; h['until'] = n; h['color'] = hl; h.pop('answer', None)
            for key in ('tex', 'label'):
                if isinstance(h.get(key), str):
                    h[key] = '\\textcolor{%s}{%s}' % (hl, re.sub(r'\\textcolor\{#[0-9A-Fa-f]{6}\}', '', h[key]))
            out.append(h)
            if u is None or u > n:
                c = dict(it); c['step'] = n + 1
                if u is None: c.pop('until', None)
                out.append(c)
        g['items'] = out


def contrast(a, b):
    def lum(h):
        c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def check_contrast(content, ground):
    """v13 (teacher, 23/10/2026): every colour the content uses (t2c roles, item colours, the highlight, hexes written
    in TeX) reaches 4.5:1 on the deck's ground — #1f3a93 on greengrey was 1.69:1."""
    data = json.dumps({'slides': content['slides']})
    bad = sorted({h.upper() for h in HEX.findall(data) if contrast(h, ground) < 4.5})
    if bad:
        raise SystemExit('contrast below 4.5:1 on the ground ' + ground + ': ' +
                         ', '.join(f'{h} ({contrast(h, ground):.2f})' for h in bad))


def selftest():
    H = {'blue': '#58C4DD', 'red': '#FC6255'}
    c = lambda t, b: apply_t2c(t, b, H)
    B = '{\\textcolor{#58C4DD}{%s}}'
    assert c('x_B + 1', {'x': 'blue'}) == (B % 'x') + '_B + 1'
    assert c('\\exp(x)', {'x': 'blue'}) == '\\exp(' + (B % 'x') + ')'
    assert c('\\text{x is} x', {'x': 'blue'}) == '\\text{x is} ' + (B % 'x')
    assert c('\\textcolor{#B189C6}{x} + x', {'x': 'blue'}) == '\\textcolor{#B189C6}{x} + ' + (B % 'x')
    assert c('x_B - x', {'x': 'red', 'x_B': 'blue'}) == (B % 'x_B') + ' - {\\textcolor{#FC6255}{x}}'
    assert c('\\theta + \\thetax', {'\\theta': 'blue'}) == (B % '\\theta') + ' + \\thetax'
    assert c('m &= \\frac{a}{m}', {'m': 'blue'}) == (B % 'm') + ' &= \\frac{a}{' + (B % 'm') + '}'
    assert c('\\mathrm{m}x', {}) == '\\mathrm{m}x'
    # v13: hl expansion and contrast
    C = {'slides': [{'type': 'example', 'graph': {'items': [
        {'kind': 'label', 'tex': '{\\textcolor{#58C4DD}{h}}', 'step': 1, 'hl': 2}]}}]}
    expand_hl(C, '#FFFF00'); it = C['slides'][0]['graph']['items']
    assert [(i['step'], i.get('until')) for i in it] == [(1, 1), (2, 2), (3, None)]
    assert it[1]['tex'] == '\\textcolor{#FFFF00}{{{h}}}' and it[0]['tex'] == it[2]['tex']
    assert round(contrast('#1F3A93', '#1C1C1C'), 2) == 1.69 and contrast('#5C7CFA', '#1C1C1C') >= 4.5
    print('selftest: 11 asserts passed')


def probe(content, theme, outdir, size=(1280, 800)):
    """Build title + one slide + Your turn for each example or lab slide and print its own --G at size."""
    from playwright.sync_api import sync_playwright
    sl = content['slides']
    title = [s for s in sl if s['type'] == 'title'][:1]; turn = [s for s in sl if s['type'] == 'yourturn'][:1]
    rows = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        for i, s in enumerate(sl):
            if s['type'] not in ('example', 'lab', 'gdc'):
                continue
            c = copy.deepcopy(content); c['slides'] = title + [s] + turn
            f = os.path.join(outdir, f'_probe_{i + 1:02d}.html')
            open(f, 'w', encoding='utf-8').write(render(c, theme)[0])
            pg = br.new_page(viewport={'width': size[0], 'height': size[1]}); pg.goto('file://' + os.path.abspath(f)); pg.wait_for_timeout(600)
            G = float(pg.evaluate("getComputedStyle(document.getElementById('frame')).getPropertyValue('--G')"))
            rows.append((i + 1, s['type'], s.get('n', ''), s.get('title', ''), G)); pg.close(); os.remove(f)
        br.close()
    for r in rows:
        print(f"probe slide {r[0]:2d} {r[1]:7s} {str(r[2]):2s} --G {r[4]:.3f}{'  < 0.95' if r[4] < 0.95 else ''}  {r[3]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('content', nargs='?')
    ap.add_argument('--out', default='.')
    ap.add_argument('--theme', default=None, help='3b1b (default), skyblue, goldteal, bluebrown, greengrey or greyline (any assets/themes/<name>.json); overrides meta.theme')
    ap.add_argument('--no-picker', action='store_true', help='leave out the viewer theme picker (palette button, T key); the deck is then built natively in --theme')
    ap.add_argument('--probe', action='store_true', help="print each example's own --G at 1280x800")
    ap.add_argument('--probe-size', default='1280x800', help='viewport for --probe, e.g. 1470x830 (MacBook Air 13.6", windowed)')
    ap.add_argument('--selftest', action='store_true', help='run the apply_t2c asserts and exit')
    a = ap.parse_args()
    if a.selftest:
        selftest(); return
    assert a.content, 'content.json required'

    content = json.load(open(a.content, encoding='utf-8'))
    meta = content['meta']
    theme_name = a.theme or meta.get('theme') or '3b1b'
    print('theme:', theme_name)
    picker = not a.no_picker
    if picker and theme_name not in ('skyblue', '3b1b', 'goldteal', 'bluebrown', 'greengrey'):
        print('note: ' + theme_name + ' is not in the picker; building natively without it')
        picker = False
    html, artifact = render(content, theme_name, picker)
    os.makedirs(a.out, exist_ok=True)
    std = os.path.join(a.out, meta['file'])
    open(std, 'w', encoding='utf-8').write(html)
    open(os.path.join(a.out, 'artifact.html'), 'w', encoding='utf-8').write(artifact)
    print(f"{meta['file']}: {len(html.encode())/1024:.0f} KB · artifact.html: {len(artifact.encode())/1024:.0f} KB")
    if a.probe:
        probe(json.load(open(a.content, encoding='utf-8')), theme_name, a.out, tuple(int(v) for v in a.probe_size.split('x')))


def render(content, theme_name, picker=False):
    """content (not yet sampled) -> (standalone html, artifact html).

    picker=True builds the template's own skyblue look and adds add_theme_picker (all themes switchable by the viewer);
    theme_name then only sets which theme the deck opens in."""
    content = copy.deepcopy(content)
    meta = content['meta']
    if picker:
        initial, theme_name = theme_name, 'skyblue'
        # every theme the viewer can pick must read well: the opening theme is a hard stop, the others a warning
        for tn in ('skyblue', '3b1b', 'goldteal', 'bluebrown', 'greengrey'):
            t = json.loads(read('themes', tn + '.json'))
            c2 = copy.deepcopy(content)
            resolve_colours(c2, t.get('t2c') or {})
            expand_hl(c2, meta.get('highlight') or t.get('hl') or '#FFFF00')
            g = re.search(r'--ground:(#[0-9A-Fa-f]{6})', read('themes', tn + '.css')) if t.get('css', True) else None
            try:
                check_contrast(c2, g.group(1) if g else t.get('ground', '#F4FAFE'))
            except SystemExit as e:
                if tn == initial:
                    raise
                print('warning (picker, ' + tn + '):', e)
    th = json.loads(read('themes', theme_name + '.json'))
    resolve_colours(content, th.get('t2c') or {})
    expand_hl(content, meta.get('highlight') or th.get('hl') or '#FFFF00')
    css_ground = re.search(r'--ground:(#[0-9A-Fa-f]{6})', read('themes', theme_name + '.css')) if th.get('css', True) else None
    if not picker:
        check_contrast(content, css_ground.group(1) if css_ground else th.get('ground', '#F4FAFE'))
    sample_curves(content)
    kcss, kjs, autoren = katex()
    data = json.dumps(content, ensure_ascii=False).replace('</', '<\\/')
    labkit = read('labkit.js') + '\n' + read('scenekit.js')
    if th.get('lab'):
        labkit = 'window.LAB_THEME = ' + json.dumps(th['lab']) + ';\n' + labkit
    subs = {'{{TITLE}}': meta['artifactTitle'], '{{FONT_CSS}}': font_css() if th.get('stix', True) else '',
            '{{KATEX_CSS}}': kcss, '{{KATEX_JS}}': kjs, '{{AUTOREN_JS}}': autoren, '{{LABKIT}}': labkit,
            '{{CONTENT}}': data}
    html = read('deck_template.html')
    if any(sl.get('type') == 'gdc' for sl in content['slides']):   # calculator slides: the GDC kit patches the template here
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'gdc', 'src'))
        from apply_kit import patch as gdc_patch
        html = gdc_patch(html)
    if th.get('css', True):
        old_m = '"\\\\gr":"\\\\textcolor{##55636F}{#1}","\\\\bl":"\\\\textcolor{##4230A8}{#1}"'
        assert html.count(old_m) == 1, 'KaTeX macro line not found'
        html = html.replace(old_m, old_m.replace('##55636F', '#' + th['gr']).replace('##4230A8', '#' + th['bl']))
        css = read('themes', theme_name + '.css')
        assert html.count('</style>\n<!--/PART-A-->') == 1
        html = html.replace('</style>\n<!--/PART-A-->', css + '\n</style>\n<!--/PART-A-->')
    for k, v in subs.items():
        assert k in html, k
        html = html.replace(k, v)

    if picker:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from add_theme_picker import add_picker
        html = add_picker(html, initial)

    part_a = html.split('<!--PART-A-->')[1].split('<!--/PART-A-->')[0].strip()
    part_b = html.split('<!--PART-B-->')[1].split('<!--/PART-B-->')[0].strip()
    artifact = part_a + '\n' + part_b + '\n'
    assert artifact.lstrip().startswith('<title>')
    return html, artifact


if __name__ == '__main__':
    main()
