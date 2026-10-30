#!/usr/bin/env python3
"""Playwright check for an AA SL online-lesson deck.

    python3 check_deck.py DECK.html [--shots DIR]

Nine viewports (worked-examples-deck's five, 390x844 portrait, 1470x956 and 1470x830 for the teacher's MacBook Air 13.6" full screen and windowed). At each, steps through every
reveal of every slide and fails on: unrendered TeX, KaTeX errors, overflow past a panel or the
slide, scrolling readouts, contrast below 4.5:1 (body) / 3:1 (large), frame fill < 95 %.
Once per viewport: drags every lab handle, moves every slider, flips every toggle, and requires
each readout to change under some control; types \\frac{1}{2} in the scratch pad; taps the right
third. Whole run: zero external requests, zero JS errors. Screenshots of every fully revealed
slide at 1280x800, 1000x570 and 390x844 go to --shots, taken 450 ms after the last reveal (steps fade in over 0.4 s).
Density budget, at 1280x800: an example slide holds at most 6 working rows (steps + text blocks)
and a stem of at most 3 lines; over budget fails (split by parts, stem repeated). The deck's --G
at 1280x800 is printed, with a warning (not a failure) below 0.95.
Text size (v13, teacher 23/10/2026): on every example slide, fully revealed, the per-slide emergency shrink (--k)
must not fire and the stem, working and every displayed formula must keep at least 85 % of the deck's normal body
size (the median stem size at that viewport). FAIL at the computer sizes (DESKTOP); a warning only at 1024x768,
1000x570 and 390x844, where the shrink is the phone safety net (Y2 L20 slide 5, 21/10: a 2π tick 10 px too wide
cut the slide to 52 % with no other symptom).
Label size (v21, teacher 24/10/2026, Y2 L21; on by default, --no-label-size to skip): at the computer sizes, at every
step of every slide, each visible text inside a graph or figure (ticks, axis names, in-graph labels, calculator screens,
SVG <text>) and in a lab panel (equation box, slider labels and values, readouts) must render at >= 85 % of the body size
(the median stem size at that viewport). A label is measured at its largest glyph run, so a superscript does not count
against it; the uppercase group headings (THE STORY) are chrome and are not measured. Y2 L21 r0 fails (at 1470x830: in-graph labels
50 %, values 41 %, ticks 82 %); v6 passes at 90 %. Decks built without meta.largeGraphs fail it (Y2 L20: 46-84 %).
Lab layout stability (v21, teacher 24/10/2026; on by default for every lab slide, --no-stability to skip): at the computer
sizes, each slider is swept from the defaults, one at a time (every integer value when that is <= 50 values, else 25
samples, extremes always), and the boxes of the equation box, graph, panels, slider rows and tracks and headings are
compared with the default state; any move > 0.5 px fails, with the max displacement, the element and the slider value.
Y2 L21 v6 before the round-5 fix moved 22.7 px when P changed (2π/23 vs π/11).
"""
import argparse, os, re, sys
from playwright.sync_api import sync_playwright

# 1440x900: MacBook Air 13.3" default; 1470x956: MacBook Air 13.6" default (full screen); 1470x830: same, browser window
SIZES = [(1280, 800), (1920, 1080), (1024, 768), (1440, 900), (1470, 956), (1470, 830), (1600, 900), (1000, 570), (390, 844)]
SHOT_SIZES = {(1280, 800), (1000, 570), (390, 844)}
# the teacher presents on a computer, never on a phone (23/10/2026): text-size failures count at these sizes
DESKTOP = {(1280, 800), (1440, 900), (1470, 830), (1470, 956), (1600, 900), (1920, 1080)}

STATE_JS = r"""
() => {
  const out = {errors: []};
  const slide = document.querySelector('.slide.active');
  const sr = slide.getBoundingClientRect();
  // unrendered TeX
  const clone = slide.cloneNode(true);
  clone.querySelectorAll('.katex-mathml, .lab-tick').forEach(e => e.remove());
  const txt = clone.textContent;
  const m = txt.match(/\\[a-zA-Z]+|\$[^$]*\$/);
  if (m) out.errors.push('unrendered TeX: ' + m[0]);
  if (slide.querySelector('.katex-error')) out.errors.push('KaTeX error: ' + slide.querySelector('.katex-error').title);
  // overflow
  const tol = 1.5;
  const inside = (r, b) => r.left >= b.left - tol && r.right <= b.right + tol && r.top >= b.top - tol && r.bottom <= b.bottom + tol;
  const panels = [...slide.querySelectorAll('.panel')];
  slide.querySelectorAll('*').forEach(e => {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    if (e.closest('.lab-labels') || e.closest('.katex-mathml') || (e.ownerSVGElement)) return;           // graph labels may sit at the graph edge
    if (!inside(r, sr)) out.errors.push('overflow slide: ' + (e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ' ' + Math.round(r.right - sr.right) + 'px/' + Math.round(r.bottom - sr.bottom) + 'px');
    const p = e.closest('.panel'); if (p && p !== e && !inside(r, p.getBoundingClientRect())) out.errors.push('overflow panel: ' + e.tagName + '.' + (typeof e.className === 'string' ? e.className : ''));
  });
  slide.querySelectorAll('.lab-readout, .panel').forEach(e => { if (e.scrollWidth > e.clientWidth + 2) out.errors.push('scrolls horizontally: ' + e.className + ' ' + (e.scrollWidth - e.clientWidth) + 'px'); });
  // blocks of an example must not overlap each other
  slide.querySelectorAll('.ex').forEach(ex => { const parts = [...ex.children].filter(c => c.getBoundingClientRect().height);
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const a = parts[i].getBoundingClientRect(), b = parts[j].getBoundingClientRect();
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.errors.push('overlap: ' + parts[i].className + ' / ' + parts[j].className); } });
  slide.querySelectorAll('.panel').forEach(p => { if (p.scrollHeight > p.clientHeight + 2) out.errors.push('panel content taller than panel'); });
  // graph labels clear of lines, points, tick numbers and each other (measured by labkit)
  slide.querySelectorAll('.lab-graph').forEach(w => { if (w.__g) { const n = w.__g.collisions(); if (n) out.errors.push(n + ' graph label(s) touching a line, point or label'); } });
  // footer fits
  const f = document.getElementById('foot'); if (f.scrollWidth > f.clientWidth + 2) out.errors.push('footer overflows');
  // contrast
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = ([r, g, b]) => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
    let base = [255, 255, 255]; for (let i = layers.length - 1; i >= 0; i--) { const [r, g, b, a] = layers[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]; } return base; };
  const scope = [slide, f];
  scope.forEach(s => s.querySelectorAll('*').forEach(e => {
    if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    if (e.closest('.katex-mathml')) return;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || e.closest('.hid')) return;
    const r = e.getBoundingClientRect(); if (!r.width) return;
    const fg = parse(cs.color); if (!fg) return; const bg = bgOf(e);
    const a = fg[3]; const col = [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
    const L1 = lum(col), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (ratio < need - 0.01) out.errors.push(`contrast ${ratio.toFixed(2)} < ${need}: "${e.textContent.trim().slice(0, 30)}" ${cs.color}`);
  }));
  const fr = document.getElementById('frame').getBoundingClientRect();
  out.fill = fr.width * fr.height / (innerWidth * innerHeight);
  return out;
}
"""


TEXTSIZE_JS = r"""
() => { const out = [];
  Deck.slides.forEach((s, i) => { if (!s.el.classList.contains('s-example')) return;
    Deck.go(i, 'all');
    const k = parseFloat(s.el.style.getPropertyValue('--k') || '1');
    const st = s.el.querySelector('.ex .stem'), fs = st ? parseFloat(getComputedStyle(st).fontSize) : 0;
    const work = [...s.el.querySelectorAll('.ex .panel.work > *')].map(e => parseFloat(getComputedStyle(e).fontSize));
    const disp = [...s.el.querySelectorAll('.work-block .katex-display')].filter(d => d.offsetParent).map(d => parseFloat(d.style.fontSize || '1') || 1);
    out.push({i, k, fs, work: work.length ? Math.min(...work) : fs, disp: disp.length ? Math.min(...disp) : 1}); });
  return out; }
"""


LABEL_JS = r"""
(norm) => { const out = [], slide = document.querySelector('.slide.active');
  const visible = e => { for (let x = e; x && x !== slide.parentElement; x = x.parentElement) { const cs = getComputedStyle(x);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || x.classList.contains('hid')) return false; } return true; };
  const roots = [...slide.querySelectorAll('.lab-graph, figure, svg, .lab-controls, .lab-eqbox')].filter(r => !(r.parentElement && r.parentElement.closest('.lab-graph, figure, svg, .lab-controls, .lab-eqbox')));
  const groups = new Map();
  roots.forEach(root => {
    const where = root.closest('.lab-controls, .lab-eqbox') ? 'panel' : 'graph';
    root.querySelectorAll('*').forEach(e => {
      if (e.closest('.katex-mathml') || e.closest('.lab-group-title')) return;
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height || !visible(e)) return;
      let px = parseFloat(getComputedStyle(e).fontSize);
      if (e instanceof SVGElement && e.getScreenCTM) { const m = e.getScreenCTM(); if (m) px *= Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)); }
      const key = e.closest('.katex') || e.closest('text') || e;
      const g = groups.get(key) || {px: 0, where, text: (key.querySelector && key.querySelector('.katex-html') ? key.querySelector('.katex-html') : key).textContent.trim().replace(/\s+/g, ' ').slice(0, 32)};
      g.px = Math.max(g.px, px); groups.set(key, g); }); });
  groups.forEach(g => { if (g.px < 0.85 * norm - 0.01) out.push(g); });
  return out; }
"""


STABLE_JS = r"""
async (li) => { const s = Deck.slides[li].el, raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const name = e => { const c = (e.className && e.className.baseVal !== undefined) ? e.className.baseVal : e.className;
    const t = e.matches('.lab-group-title, h2') ? ' "' + e.textContent.trim().slice(0, 24) + '"' : ''; return e.tagName.toLowerCase() + (c ? '.' + String(c).trim().split(/\s+/).join('.') : '') + t; };
  const els = [...s.querySelectorAll('.lab-eqbox, .lab-graph, .lab-svg, .lab-controls, .lab-group, .lab-slider, .lab-slider input, .lab-group-title, h2, .eyebrow')];
  const boxes = () => els.map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; });
  const ins = [...s.querySelectorAll('.lab-slider input')], defs = ins.map(i => i.value);
  const set = (i, v) => { i.value = v; i.dispatchEvent(new Event('input', {bubbles: true})); };
  await raf(); const base = boxes(); let worst = {d: 0}, states = 0;
  for (let k = 0; k < ins.length; k++) { const inp = ins[k], lo = +inp.min, hi = +inp.max, st = +inp.step || 1;
    let vals = []; const ints = Math.floor(hi) - Math.ceil(lo) + 1;
    if (ints <= 50 && (1 / st) % 1 < 1e-9) for (let v = Math.ceil(lo); v <= hi; v++) vals.push(v);
    else for (let j = 0; j < 25; j++) vals.push(Math.round((lo + (hi - lo) * j / 24) / st) * st + 0);
    vals.push(lo, hi);
    const le = inp.parentNode.querySelector('.lab-sl-label .katex-html') || inp.parentNode.querySelector('.lab-sl-label'), label = (le && le.textContent.trim()) || ('slider ' + k);
    for (const v of vals) { set(inp, v); await raf(); states++;
      boxes().forEach((b, j) => { const d = Math.max(...b.map((x, q) => Math.abs(x - base[j][q])));
        if (d > worst.d) worst = {d, el: name(els[j]), slider: label, value: inp.value}; }); }
    set(inp, defs[k]); await raf(); }
  return {worst, states, n: els.length}; }
"""


BUDGET_JS = r"""
() => Deck.slides.map((s, i) => {
  if (!s.el.classList.contains('s-example')) return null;
  const note = s.el.querySelector('.ex > .note') ? 1 : 0, rows = s.steps.length - note;
  const p = s.el.querySelector('.stem > p'); s.el.classList.add('measure');
  const lh = parseFloat(getComputedStyle(p).lineHeight), h = p.getBoundingClientRect().height;
  s.el.classList.remove('measure');
  return {i, rows, lines: Math.round(h / lh * 10) / 10};
}).filter(Boolean)
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('deck')
    ap.add_argument('--shots', default='shots')
    ap.add_argument('--no-label-size', action='store_true', help='skip the in-graph and lab-panel label-size check (v21)')
    ap.add_argument('--no-stability', action='store_true', help='skip the lab layout-stability sweep (v21)')
    a = ap.parse_args()
    os.makedirs(a.shots, exist_ok=True)
    url = 'file://' + os.path.abspath(a.deck)
    fails, external, jserr = [], [], []
    label_min, stab = [9.0], []

    with sync_playwright() as p:
        br = p.chromium.launch()
        for (w, h) in SIZES:
            tag = f'{w}x{h}'
            ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            pg = ctx.new_page()
            pg.on('request', lambda r: external.append(r.url) if not re.match(r'^(file|data|blob|about):', r.url) else None)
            pg.on('pageerror', lambda e: jserr.append(f'{tag}: {e}'))
            pg.on('console', lambda m: jserr.append(f'{tag}: console {m.text}') if m.type == 'error' else None)
            pg.goto(url); pg.wait_for_timeout(400)
            n = pg.evaluate('Deck.count()')
            if (w, h) == (1280, 800):
                G = float(pg.evaluate("getComputedStyle(document.getElementById('frame')).getPropertyValue('--G')"))
                print(f'--G at 1280x800: {G:.3f}' + ('  WARNING: below 0.95 (probe with build_deck.py --probe)' if G < 0.95 else ''))
                for b in pg.evaluate(BUDGET_JS):
                    if b['rows'] > 6: fails.append(f"budget: slide {b['i']+1} has {b['rows']} working rows (max 6)")
                    if b['lines'] > 3.05: fails.append(f"budget: slide {b['i']+1} stem is {b['lines']} lines (max 3)")
            # text size (v13) measured first: its median stem size is the body size for the label check (v21)
            ts = pg.evaluate(TEXTSIZE_JS)
            norm = sorted(t['fs'] for t in ts)[len(ts) // 2] if ts else 0
            check_labels = norm and not a.no_label_size and (w, h) in DESKTOP
            states = 0
            pg.evaluate('Deck.go(0,0)')
            while True:
                st = pg.evaluate('Deck.state()')
                res = pg.evaluate(STATE_JS)
                states += 1
                for e in res['errors']:
                    fails.append(f"{tag} slide {st['slide']+1} step {st['shown']}/{st['steps']}: {e}")
                if res['fill'] < 0.95:
                    fails.append(f'{tag}: frame fill {res["fill"]:.2%}')
                if check_labels:
                    small = pg.evaluate(LABEL_JS, norm)
                    if small:
                        small.sort(key=lambda g: g['px'])
                        lst = '; '.join(f'"{g["text"]}" {g["px"]:.1f}px ({g["px"] / norm:.0%}, {g["where"]})' for g in small[:4])
                        label_min[0] = min(label_min[0], small[0]['px'] / norm)
                        fails.append(f"label-size: {tag} slide {st['slide']+1} step {st['shown']}/{st['steps']}: {len(small)} text(s) under 85 % of body {norm:.1f}px: {lst}" + (f' (+{len(small) - 4} more)' if len(small) > 4 else ''))
                if st['shown'] == st['steps'] and (w, h) in SHOT_SIZES:
                    pg.wait_for_timeout(450)
                    pg.screenshot(path=os.path.join(a.shots, f"{tag}_s{st['slide']+1:02d}.png"))
                if st['slide'] == n - 1 and st['shown'] == st['steps']:
                    break
                before = (st['slide'], st['shown'])
                pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(30)
                st2 = pg.evaluate('Deck.state()')
                if (st2['slide'], st2['shown']) == before:
                    fails.append(f'{tag}: ArrowRight did not advance at {before}'); break
            # text size (v13): no emergency shrink, nothing markedly smaller than the deck's body size
            if ts:
                for t in ts:
                    why = []
                    if t['k'] < 0.999: why.append(f"emergency shrink fired (--k {t['k']:.2f})")
                    if t['fs'] < 0.85 * norm: why.append(f"stem {t['fs']:.1f}px = {t['fs'] / norm:.0%} of body {norm:.1f}px")
                    if t['work'] < 0.85 * norm: why.append(f"working {t['work']:.1f}px = {t['work'] / norm:.0%} of body")
                    if t['disp'] < 0.85: why.append(f"a formula set at {t['disp']:.0%}")
                    if why:
                        msg = f"{tag} slide {t['i']+1}: text shrunk: " + '; '.join(why)
                        if (w, h) in DESKTOP: fails.append(msg)
                        else: print('  warning: ' + msg)
            # back navigation
            STEP_SLIDE = pg.evaluate("(()=>{for(let i=1;i<Deck.slides.length;i++){Deck.go(i,'all');if(Deck.state().steps>1)return i;}return 3;})()")
            pg.evaluate(f'Deck.go({STEP_SLIDE},"all")'); pg.keyboard.press('ArrowLeft'); st = pg.evaluate('Deck.state()')
            if st['shown'] != st['steps'] - 1:
                fails.append(f'{tag}: ArrowLeft did not hide the last step')

            # labs
            lab_slides = pg.evaluate("Deck.slides.map((s,i)=>s.lab?i:-1).filter(i=>i>=0)")
            # layout stability (v21): nothing moves when a slider moves
            if not a.no_stability and (w, h) in DESKTOP:
                for li in lab_slides:
                    pg.evaluate(f'Deck.go({li},"all")'); pg.wait_for_timeout(80)
                    r = pg.evaluate(STABLE_JS, li)
                    wd = r['worst']
                    stab.append((tag, li + 1, r['states'], wd['d']))
                    if wd['d'] > 0.5:
                        fails.append(f"stability: {tag} lab slide {li+1}: {wd['el']} moved {wd['d']:.1f}px (slider {wd['slider']} = {wd['value']}; {r['states']} states, {r['n']} boxes)")
            for li in lab_slides:
                pg.evaluate(f'Deck.go({li},0)'); pg.wait_for_timeout(50)
                if pg.evaluate("!document.querySelector('.slide.active .lab-svg')"):    # catalogue lab: choose every case in turn
                    cb = pg.locator('.slide.active .cat-btn')
                    for k in range(cb.count()):
                        cb.nth(k).click(); pg.wait_for_timeout(30)
                        for e in pg.evaluate(STATE_JS)['errors']:
                            fails.append(f'{tag} catalogue slide {li+1} case {k+1}: {e}')
                        if (w, h) in SHOT_SIZES and k in (0, cb.count() - 1):
                            pg.screenshot(path=os.path.join(a.shots, f'{tag}_s{li+1:02d}_case{k+1}.png'))
                    cb.first.click()
                    continue
                read = lambda: pg.evaluate("[...document.querySelectorAll('.slide.active .lab-readout')].map(e=>e.textContent)")
                base = read(); changed = [False] * len(base)
                def mark(label, before):
                    after = read(); diff = [x != y for x, y in zip(before, after)]
                    for i, d in enumerate(diff):
                        if d: changed[i] = True
                    if not any(diff): fails.append(f'{tag} lab slide {li+1}: {label} changed no readout')
                    return after
                cur = base
                handles = pg.locator('.slide.active .lab-handle')
                gw = pg.evaluate("document.querySelector('.slide.active .lab-svg').getBoundingClientRect().width")
                unit = gw / 16
                for k in range(handles.count()):
                    bb = handles.nth(k).bounding_box()
                    if not bb:           # a handle hidden in the lab's current mode (e.g. C before "change of course")
                        continue
                    cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
                    pg.mouse.move(cx, cy); pg.mouse.down()
                    pg.mouse.move(cx - 2 * unit, cy + 1 * unit, steps=6); pg.mouse.up()
                    cur = mark(f'handle {k}', cur)
                sliders = pg.locator('.slide.active .lab-slider input')
                for k in range(sliders.count()):
                    pg.evaluate(f"(()=>{{const i=document.querySelectorAll('.slide.active .lab-slider input')[{k}]; i.value=+i.value+1.3; i.dispatchEvent(new Event('input',{{bubbles:true}}));}})()")
                    cur = mark(f'slider {k}', cur)
                tog = pg.locator('.slide.active .lab-toggle button[aria-checked="false"]')
                for k in range(tog.count()):
                    pg.locator('.slide.active .lab-toggle button[aria-checked="false"]').first.click()
                    cur = mark(f'toggle {k}', cur)
                for i, c in enumerate(changed):
                    if not c: fails.append(f'{tag} lab slide {li+1}: readout {i} never changed')
                res = pg.evaluate(STATE_JS)
                for e in res['errors']:
                    fails.append(f'{tag} lab slide {li+1} after interaction: {e}')
                if (w, h) in SHOT_SIZES:
                    pg.wait_for_timeout(450)
                    pg.screenshot(path=os.path.join(a.shots, f'{tag}_s{li+1:02d}_moved.png'))

            # scratch pad
            pg.evaluate('Deck.go(3,"all")')
            pg.keyboard.press('s'); pg.wait_for_timeout(50)
            pg.keyboard.type('\\frac{1}{2}'); pg.wait_for_timeout(80)
            ok = pg.evaluate("!!document.querySelector('#scratch-out .katex') && !document.querySelector('#scratch-out .katex-error') && !!document.querySelector('#scratch-out .mfrac')")
            if not ok: fails.append(f'{tag}: scratch pad did not render \\frac{{1}}{{2}}')
            if (w, h) in SHOT_SIZES:
                pg.screenshot(path=os.path.join(a.shots, f'{tag}_scratch.png'))
            pg.keyboard.press('Escape')
            if not pg.evaluate("document.getElementById('scratch').hidden"): fails.append(f'{tag}: Esc did not close the scratch pad')

            # tap zones
            TAP = pg.evaluate("(()=>{for(let i=1;i+1<Deck.slides.length;i++){if(!Deck.slides[i].lab&&!Deck.slides[i+1].lab)return i;}return 2;})()")
            pg.evaluate(f'Deck.go({TAP},"all")')
            r = pg.evaluate("(()=>{const b=document.getElementById('slides').getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()")
            pg.mouse.click(r[0] + r[2] * 0.9, r[1] + r[3] * 0.5)
            if pg.evaluate('Deck.state().slide') != TAP + 1: fails.append(f'{tag}: tap on right third did not advance')
            pg.mouse.click(r[0] + r[2] * 0.1, r[1] + r[3] * 0.5)
            if pg.evaluate('Deck.state().slide') != TAP: fails.append(f'{tag}: tap on left third did not go back')
            print(f'{tag}: {states} states checked')
            ctx.close()
        br.close()

    if label_min[0] < 9:
        print(f'label-size: smallest text in a graph or lab panel = {label_min[0]:.0%} of body (needs >= 85 %)')
    if stab:
        print('stability: ' + ', '.join(f'{t} slide {s}: max {d:.2f}px over {n} states' for t, s, n, d in stab))
    fails += [f'external request: {u}' for u in sorted(set(external))]
    fails += [f'JS error: {e}' for e in jserr]
    if fails:
        print(f'\nFAIL — {len(fails)} problem(s):')
        seen = set()
        for f in fails:
            if f not in seen: print('  ' + f); seen.add(f)
        sys.exit(1)
    print('\nPASS — every check at nine sizes, zero external requests, zero JS errors')


if __name__ == '__main__':
    main()
