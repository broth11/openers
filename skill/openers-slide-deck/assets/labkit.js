/* labkit.js — interactive 2D labs for the AA SL online-lesson decks.
   Hand-built SVG + KaTeX, no external library, no network.

   API (fixed on the Y1 L15 prototype — extend with presets, do not redesign; v4 adds plain, north, bearing):
     Lab.graph(el, {xmin, xmax, ymin, ymax, grid | gridx, gridy, xtick, ytick, xname, yname, plain})  -> g
                                   plain: true hides grid, frame, axes and ticks (geometry figures)
       g.fn(f, opts)               graph of y = f(x)            opts: {dashed, visible}
       g.curve(pieces, opts)       pre-sampled curve pieces     opts: {dashed, answer, visible}
       g.line(P, Q, opts)          infinite line through P, Q   opts: {dashed, visible}
       g.segment(P, Q, opts)       segment PQ                   opts: {dashed, visible}
       g.polygon([P, ...], opts)   filled polygon (ink, faint)  opts: {visible}
       g.path(pts, opts)           polyline through [[x,y],...] (or a function returning it)  opts: {dashed, answer, color, visible}  (v6)
       g.angle(O, P, Q, opts)      arc at O from OP to OQ; square if 90°   opts: {label, color, visible}
       g.north(P, opts)            north line from P, arrow and N   opts: {len (graph units), visible}
       g.bearing(O, deg, opts)     clockwise arc from north (or from opts.from), reflex allowed, arrowhead
                                   opts: {r (graph units), from, label, muted, visible}
       g.arc(O, from, to, opts)    v13: dotted arc with arrowhead, anticlockwise from +x angles (degrees)  opts: {r, color, visible}
       g.point(P, opts)            point; opts: {drag, snap, onMove, label}  -> handle {x, y}
       g.label(x, y, tex, opts)    KaTeX label in graph units   opts: {anchor:'n|s|e|w|ne|nw|se|sw|c' or fn, visible}
       g.redraw()                  recompute every item (call after any change)
     Lab.figure(el, spec, shown)   static figure from a declarative spec, items revealed by step
     Lab.slider(el, {min, max, step, value, label, format, onChange}) -> {input, value(), set(v)}
     Lab.toggle(el, {options, value, onChange})                       -> {value()}
     Lab.readout(el, () => texString)                                 -> {el, update()}
     Lab.Frac(n, d)                exact rational arithmetic for readouts
     Lab.presets.<name>(container, init)   one function per lab preset
   Any argument P, x, y or tex may be a value or a function returning it; functions are
   re-evaluated on every redraw. Colours: primary ink #14202B, secondary #55636F dashed,
   draggable handles and answer lines indigo #4230A8. No other colour exists.
   G9X presets (ported 29/09/2026): system2 (U3 L2), compare2 (U3 L3); init.colors = [line 1, line 2, answer],
   default [theme curve, #FF862F, theme handle]. slider() takes o.color (accent).
   v5 (t2c): every figure item and every g.* call accepts opts.color, a hex that build_deck.py
   resolves from "color": "<role>" or "colorOf": "<symbol>" (role table in the theme JSON);
   answer still wins. Lab.graph also takes xcolor / ycolor for a bound axis name.
   v6 (Y2 L16, 29/09/2026): g.path and figure kind 'path' {pts, dashed}; figure items take until (hidden after that step); preset solidSection (cone or square
   pyramid, sliders r|a and h, its flat right triangle, readouts l, V, A); init.t2c = {symbol: hex} is filled
   by build_deck.py from meta.t2c so a preset can colour bound symbols.
   v9 (Y1 L16, 02/10/2026): segment opts.arrows (arrowhead at both ends); colour role brown.
   v7 (Y2 L17, 29/09/2026): preset cuboidAngle (cuboid l, d, h; toggle two lines AH-AG | line and base AG-ABCD;
   the flat right triangle; readouts legs, tan θ, θ).
   v10 (Y1 L20, 20/10/2026): preset reciprocalAHK (y = a/(x − h) + k, sliders a, h, k; asymptotes in the
   colours of h and k; one point per branch; toggle y = 1/x for comparison).
   v11 (Y2 L20, 21/10/2026): presets sinusoidABCD (y = a sin(b(x + c)) + d) and tanABCD (y = a tan(b(x + c)) + d),
   sliders a, b, c (multiples of π/12), d; opts.dotted on every stroke (guide lines: principal axis, measuring
   arrows — a dashed line is always an asymptote); window xticks / yticks = [[value, tex], ...] (π ticks); an x tick
   number crossed by a curve slides half its width sideways before it is hidden; figure points take answer.
   v12 (Y2 L20, 23/10/2026, teacher): sinusoidABCD measures the period between two successive maxima (points
   marked, dotted arrow at their height, label "x2 − x1 = period" above it, or under the curve when the top of
   the window leaves no room); no dotted drop-line from the axis; the start point's coordinates sit beside it
   (under the curve's band when |a|b > 4.5, where a label beside the point would touch the curve).
   v13 (Y2 L20 review, 23/10/2026, teacher): Lab.graph o.aspect / o.aspectPortrait (a wide graph, class .lab-graph.wide);
   sinusoidABCD init.layout 'wide' (default: graph full width on top, aspect 3, controls side by side below, thin
   sliders) or 'square' (the v12 layout); sinusoidABCD logs an error when some slider value leaves fewer than two
   maxima in the window (the period arrow would vanish: narrow bRange or widen the window); g.arc and figure kind
   'arc' {at, from, to, r, color}: an angle as a dotted arrowed arc from the positive x-axis.
   v19 (Y2 L21 round 4): sinusoidStory labels the time above the level in every full window.
   v18 (Y2 L21 round 3, 23/10/2026): label opts.fixed (no auto-placement); sinusoidStory: time value centred under
   its arrow at every state, period arrowheads stop short of the maximum dots.
   v17 (Y2 L21 review round 2, 23/10/2026): polygon opts.opacity / opts.outline (items: opacity, outline); sinusoidStory:
   solid verticals through the crossings, solid time arrow lower with its value above it, period arrow at the maxima.
   v16 (Y2 L21 review, 23/10/2026): sinusoidStory uses window.yname for the model's letter; at k <= min the readout
   says "≥ k: always, never below". v15 (Y2 L21, 23/10/2026): preset sinusoidStory (H(t) = a sin(b(t − c)) + d from highest, lowest, period, time of a
   maximum; the level H = k, the time above it shaded per cycle, crossings and the time above per cycle). Wide layout.
   Theme keys read from window.LAB_THEME (all optional; defaults = skyblue look):
     ink, curve, muted, handle, grid, axis, fill, fillOpacity, gr, bl,
     point (static point fill), pointR (static point radius, viewBox units of 1000),
     frame (false drops the rectangle round the window),
     stroke {grid, axis, curve, dashed} (Manim stroke widths: px on a 1080-px frame, drawn as that
     share of the slide height with non-scaling strokes; absent = the old viewBox widths). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const TH = window.LAB_THEME || {};
  const INK = TH.ink || '#14202B', MUTED = TH.muted || '#55636F', HANDLE = TH.handle || '#4230A8', GRID = TH.grid || '#D3E3EE', AXIS = TH.axis || '#55636F';
  const CURVE = TH.curve || INK, FILL = TH.fill || INK, FILLOP = TH.fillOpacity || 0.07;
  const POINT = TH.point || INK, POINT_R = TH.pointR || 11, FRAME = TH.frame !== false;
  /* stroke widths: without TH.stroke, viewBox units (skyblue, unchanged); with it, Manim stroke widths
     (px on a 1080-px frame) drawn at that share of the slide height, never under 1 px */
  const SW = TH.stroke ? Object.assign({ grid: 1, axis: 2, curve: 3, dashed: 2 }, TH.stroke) : null;
  const sw = (e, kind, units) => { if (SW) { e.setAttribute('vector-effect', 'non-scaling-stroke');
      e.style.strokeWidth = `max(1px, ${(SW[kind] / 10.8).toFixed(4)}cqh)`; } else e.setAttribute('stroke-width', units); return e; };
  const KOPTS = { throwOnError: false, strict: false,
    macros: { '\\gr': '\\textcolor{#' + (TH.gr || '#55636F') + '}{#1}', '\\bl': '\\textcolor{#' + (TH.bl || '#4230A8') + '}{#1}' } };
  const val = v => (typeof v === 'function' ? v() : v);
  const pt = P => { const p = val(P); return p ? { x: val(p.x), y: val(p.y) } : null; };
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const tex = s => (window.katex ? katex.renderToString(s, KOPTS) : s);

  /* ---------- exact fractions ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  class Frac {
    constructor(n, d = 1) {
      if (d === 0) throw new Error('zero denominator');
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d); this.n = n / g; this.d = d / g;
    }
    static of(x) { if (x instanceof Frac) return x; // decimals from sliders: at most 3 dp
      const d = 1000; return new Frac(Math.round(x * d), d); }
    add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { o = Frac.of(o); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    isZero() { return this.n === 0; }
    eq(o) { o = Frac.of(o); return this.n === o.n && this.d === o.d; }
    valueOf() { return this.n / this.d; }
    tex() { if (this.d === 1) return String(this.n);
      return (this.n < 0 ? '-' : '') + '\\frac{' + Math.abs(this.n) + '}{' + this.d + '}'; }
    /* tex of a signed coefficient in front of a variable, first term of an expression */
    coefTex(v) { if (this.n === 0) return '';
      if (this.n === this.d) return v; if (this.n === -this.d) return '-' + v; return this.tex() + v; }
  }
  /* "mx + c" with c's sign written as an operation */
  function linTex(m, c, v = 'x') {
    let s = m.coefTex(v);
    if (c.isZero()) return s || '0';
    if (!s) return c.tex();
    return s + (c.n < 0 ? ' - ' + c.neg().tex() : ' + ' + c.tex());
  }
  /* general form ax + by + d = 0 with integer, coprime coefficients, a > 0 (or b > 0 if a = 0) */
  function generalTex(a, b, d) {
    const g = gcd(gcd(a, b), d); a /= g; b /= g; d /= g;
    if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; d = -d; }
    const term = (k, v, first) => {
      if (k === 0) return '';
      const mag = Math.abs(k) === 1 && v ? '' : String(Math.abs(k));
      if (first) return (k < 0 ? '-' : '') + mag + v;
      return (k < 0 ? ' - ' : ' + ') + mag + v;
    };
    let s = term(a, 'x', true);
    s += term(b, 'y', s === '');
    s += term(d, '', s === '');
    return s + ' = 0';
  }
  /* line y = m x + c, m and c Frac -> general form */
  function generalFromMC(m, c) {
    const L = m.d * c.d / gcd(m.d, c.d);
    return generalTex(m.n * L / m.d, -L, c.n * L / c.d);
  }
  const paren = k => (k < 0 ? '(' + k + ')' : String(k));

  /* ---------- graph ---------- */
  function graph(el, o) {
    /* v13: o.aspect (width / height, e.g. 3) gives a wide graph; o.aspectPortrait (default 1.3) on a portrait screen */
    const ASP = o.aspect ? (window.matchMedia && matchMedia('(orientation: portrait)').matches ? (o.aspectPortrait || 1.3) : o.aspect) : 1;
    const W = 1000, HH = W / ASP, xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
    const gx = o.gridx || o.grid || 1, gy = o.gridy || o.grid || 1;
    const X = x => (x - xmin) / (xmax - xmin) * W, Y = y => (ymax - y) / (ymax - ymin) * HH;
    const wrap = document.createElement('div'); wrap.className = 'lab-graph'; el.appendChild(wrap);
    if (o.aspect) { wrap.classList.add('wide'); wrap.style.aspectRatio = String(ASP); }
    const svg = mk('svg', { viewBox: `0 0 ${W} ${HH}`, class: 'lab-svg', role: 'img' }, wrap);
    const labels = document.createElement('div'); labels.className = 'lab-labels'; wrap.appendChild(labels);
    const clipId = 'clip' + Math.random().toString(36).slice(2, 8);
    mk('rect', { x: 0, y: 0, width: W, height: HH, fill: 'none' }, mk('clipPath', { id: clipId }, mk('defs', {}, svg)));
    const gGrid = mk('g', {}, svg); if (o.plain) gGrid.style.display = 'none';
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    for (let x = Math.ceil(xmin / gx) * gx; x <= xmax + 1e-9; x += gx)
      if (!near(x, 0)) sw(mk('line', { x1: X(x), y1: 0, x2: X(x), y2: HH, stroke: GRID }, gGrid), 'grid', 1.2);
    for (let y = Math.ceil(ymin / gy) * gy; y <= ymax + 1e-9; y += gy)
      if (!near(y, 0)) sw(mk('line', { x1: 0, y1: Y(y), x2: W, y2: Y(y), stroke: GRID }, gGrid), 'grid', 1.2);
    if (FRAME) mk('rect', { x: 0, y: 0, width: W, height: HH, fill: 'none', stroke: GRID, 'stroke-width': 2 }, gGrid);
    if (ymin < 0 && ymax > 0) sw(mk('line', { x1: 0, y1: Y(0), x2: W, y2: Y(0), stroke: AXIS }, gGrid), 'axis', 2.4);
    if (xmin < 0 && xmax > 0) sw(mk('line', { x1: X(0), y1: 0, x2: X(0), y2: HH, stroke: AXIS }, gGrid), 'axis', 2.4);
    const tick = (x, y, t, a, col) => { const d = document.createElement('div'); d.className = 'lab-tick ' + a;
      d.style.left = X(x) / W * 100 + '%'; d.style.top = Y(y) / HH * 100 + '%'; d.textContent = t; if (col) d.style.color = col; labels.appendChild(d); };
    const span = Math.max(xmax - xmin, ymax - ymin);
    const xt = o.xtick || (xmax - xmin > 12 ? 2 : 1), yt = o.ytick || (ymax - ymin > 12 ? 2 : 1);
    const num = v => (v < 0 ? '\u2212' + (-v) : String(v));
    /* v11: o.xticks / o.yticks = [[value, tex], ...] replace the numeric ticks (multiples of π) */
    const tickTex = (x, y, t, a) => { tick(x, y, '', a); labels.lastChild.innerHTML = tex(t); };
    if (o.xticks) o.xticks.forEach(([v, t]) => { if (!near(v, 0) && v > xmin + 1e-9 && v < xmax - 1e-9) tickTex(v, 0, t, 'tx'); });
    else for (let x = Math.ceil(Math.max(xmin, o.xtickFrom ?? xmin) / xt) * xt; x <= xmax; x += xt) if (!near(x, 0) && !near(x, xmin) && !near(x, xmax)) tick(x, 0, num(x), 'tx');
    if (o.yticks) o.yticks.forEach(([v, t]) => { if (!near(v, 0) && v > ymin + 1e-9 && v < ymax - 1e-9) tickTex(0, v, t, 'ty'); });
    else for (let y = Math.ceil(Math.max(ymin, o.ytickFrom ?? ymin) / yt) * yt; y <= ymax; y += yt) if (!near(y, 0) && !near(y, ymin) && !near(y, ymax)) tick(0, y, num(y), 'ty');
    if (o.plain) labels.querySelectorAll('.lab-tick').forEach(e => e.remove());
    else { tick(xmax, 0, o.xname || 'x', 'ax', o.xcolor); tick(0, ymax, o.yname || 'y', 'ay', o.ycolor); }

    const gItems = mk('g', { 'clip-path': `url(#${clipId})` }, svg);
    const gHandles = mk('g', {}, svg);
    const items = [];
    const stroke = (opts, e) => { const thin = opts.dashed || opts.dotted;
      e.setAttribute('stroke', opts.answer ? HANDLE : opts.color ? opts.color : thin ? MUTED : CURVE);
      sw(e, thin ? 'dashed' : 'curve', thin ? 4 : 5); e.setAttribute('fill', 'none');
      if (opts.dashed) e.setAttribute('stroke-dasharray', SW ? '6 5' : '16 12');
      if (opts.dotted) { e.setAttribute('stroke-dasharray', SW ? '0.1 6' : '0.1 14'); if (SW) e.style.strokeWidth = `max(2px, ${(3 / 10.8).toFixed(4)}cqh)`; }   /* v11: round dots */
      e.setAttribute('stroke-linecap', 'round'); };
    const shown = (opts) => opts.visible === undefined || val(opts.visible);
    const placed = [];
    const DIRS = ['ne', 'nw', 'se', 'sw', 'n', 's', 'e', 'w', 'n>', 'n<', 's>', 's<', 'e^', 'ev', 'w^', 'wv', 'e^^', 'evv', 'w^^', 'wvv', 'n>>', 'n<<', 's>>', 's<<'];
    /* sample every visible stroke (curves, lines, segments, axes) into points, in svg units */
    function strokePoints() {
      const pts = [], clip = (x1, y1, x2, y2) => { let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
        for (const [p, q] of [[-dx, x1], [dx, W - x1], [-dy, y1], [dy, HH - y1]]) {
          if (p === 0) { if (q < 0) return null; continue; } const r = q / p;
          if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
        return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy]; };
      const seg = (a, b, c, d) => { const q = clip(a, b, c, d); if (!q) return; const n = Math.max(1, Math.ceil(Math.hypot(q[2] - q[0], q[3] - q[1]) / 6));
        for (let i = 0; i <= n; i++) pts.push([q[0] + (q[2] - q[0]) * i / n, q[1] + (q[3] - q[1]) * i / n]); };
      svg.querySelectorAll('line, polyline').forEach(e => {
        if (e.closest('[style*="display: none"]') || e.style.display === 'none') return;
        if (e.getAttribute('stroke') === GRID) return;
        if (e.tagName === 'line') seg(+e.getAttribute('x1'), +e.getAttribute('y1'), +e.getAttribute('x2'), +e.getAttribute('y2'));
        else { const p = (e.getAttribute('points') || '').trim().split(/\s+/).map(v => v.split(',').map(Number));
          for (let i = 1; i < p.length; i++) seg(p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]); } });
      return pts;
    }
    function place(countOnly) {
      const box = wrap.getBoundingClientRect(); if (!box.width) return 0;
      const k = box.width / W, m = 5;
      const pts = strokePoints().map(([a, b]) => [a * k, b * k]);
      const dots = [...svg.querySelectorAll('.lab-point, .lab-handle')].filter(e => e.style.display !== 'none')
        .map(e => { const t = /translate\(([-\d.e]+),([-\d.e]+)\)/.exec(e.getAttribute('transform') || ''); return t ? [t[1] * k, t[2] * k] : null; }).filter(Boolean);
      const rel = r => ({ l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top });
      /* tick numbers under a stroke are hidden rather than overprinted */
      const ticks = [];
      labels.querySelectorAll('.lab-tick').forEach(e => { if (countOnly) { if (e.style.visibility !== 'hidden') ticks.push(rel(e.getBoundingClientRect())); return; }
        e.style.visibility = ''; if (e.dataset.left === undefined) e.dataset.left = e.style.left; e.style.left = e.dataset.left;
        const num = e.classList.contains('tx') || e.classList.contains('ty');
        const hitR = q => pts.some(([x, y]) => x > q.l - 2 && x < q.r + 2 && y > q.t - 2 && y < q.b + 2) ||
          ticks.some(o => q.l < o.r + 2 && o.l < q.r + 2 && q.t < o.b + 2 && o.t < q.b + 2);
        let r = rel(e.getBoundingClientRect()); r.el = e;
        /* v11: an x tick number crossed by a curve (a sine through its zero) slides half its width sideways before giving up */
        if (num && hitR(r) && e.classList.contains('tx')) {
          const sh = (r.r - r.l) / 2 + 5;
          for (const dx of [sh, -sh]) { e.style.left = `calc(${e.dataset.left} + ${dx}px)`; const q = rel(e.getBoundingClientRect());
            if (!hitR(q)) { r = q; r.el = e; break; } e.style.left = e.dataset.left; } }
        const hit = num ? hitR(r) : false;
        if (hit) { if (!countOnly) e.style.visibility = 'hidden'; } else ticks.push(r); });
      const taken = [];
      const clash = r => {
        let n = 0;
        for (const [x, y] of pts) if (x > r.l - m && x < r.r + m && y > r.t - m && y < r.b + m) { n++; }
        const dm = 12 * k + 2; for (const [x, y] of dots) if (x > r.l - dm && x < r.r + dm && y > r.t - dm && y < r.b + dm) n += 20;
        for (const q of taken) if (r.l < q.r + 2 && q.l < r.r + 2 && r.t < q.b + 2 && q.t < r.b + 2) n += 20;
        for (const q of ticks) if (r.l < q.r + 2 && q.l < r.r + 2 && r.t < q.b + 2 && q.t < r.b + 2) n += countOnly ? 20 : 0.3;
        if (r.l < -2 || r.t < -2 || r.r > box.width + 2 || r.b > box.height + 2) n += 0.5;
        return n; };
      let total = 0;
      placed.forEach(L => { if (!L.on) return; const d = L.d; d.style.transform = 'none';
        const w = d.offsetWidth, h = d.offsetHeight, px = X(L.x) * k, py = Y(L.y) * k, gap = Math.max(h * 0.25, 12 * k + 5);
        const at = dir => ({ ne: [px + gap, py - gap - h], nw: [px - gap - w, py - gap - h], se: [px + gap, py + gap], sw: [px - gap - w, py + gap],
          n: [px - w / 2, py - gap - h], s: [px - w / 2, py + gap], e: [px + gap, py - h / 2], w: [px - gap - w, py - h / 2], c: [px - w / 2, py - h / 2],
          'n>': [px + w * 0.1, py - gap - h], 'n<': [px - w * 1.1, py - gap - h], 's>': [px + w * 0.1, py + gap], 's<': [px - w * 1.1, py + gap],
          'e^': [px + gap, py - h * 1.3], 'ev': [px + gap, py + h * 0.3], 'w^': [px - gap - w, py - h * 1.3], 'wv': [px - gap - w, py + h * 0.3],
          'e^^': [px + gap, py - h * 2.6], 'evv': [px + gap, py + h * 1.6], 'w^^': [px - gap - w, py - h * 2.6], 'wvv': [px - gap - w, py + h * 1.6],
          'n>>': [px + w * 0.7, py - gap - h], 'n<<': [px - w * 1.7, py - gap - h], 's>>': [px + w * 0.7, py + gap], 's<<': [px - w * 1.7, py + gap] }[dir]);
        const side = L.pref[0], order = L.fixed ? [L.pref] : [L.pref].concat(DIRS.filter(q => q !== L.pref && q[0] === side), DIRS.filter(q => q[0] !== side));   /* v18: opts.fixed keeps the anchor */
        let best = null;
        for (const dir of order) { const [l, t] = at(dir); const r = { l, t, r: l + w, b: t + h }; const n = clash(r);
          if (!best || n < best.n) best = { dir, r, n }; if (n === 0) break; }
        if (countOnly) { const r = { l: d.offsetLeft, t: d.offsetTop, r: d.offsetLeft + w, b: d.offsetTop + h }; const n = clash(r); if (n >= 1) { total++; (window.__labDebug = window.__labDebug || []).push(d.textContent + ' n=' + n); } taken.push(r); return; }
        d.style.left = best.r.l + 'px'; d.style.top = best.r.t + 'px';
        /* a tick number under a placed label gives way to the label */
        ticks.forEach(q => { if (q.el && best.r.l < q.r + 5 && q.l < best.r.r + 5 && best.r.t < q.b + 5 && q.t < best.r.b + 5) q.el.style.visibility = 'hidden'; }); d.dataset.dir = best.dir; taken.push(best.r); total += best.n >= 1 ? 1 : 0; });
      return total;
    }
    const g = {
      X, Y,
      fn(f, opts = {}) { const e = mk('polyline', {}, gItems); stroke(opts, e);
        items.push(() => { e.style.display = shown(opts) ? '' : 'none'; if (!shown(opts)) return;
          const F = val(f) && typeof val(f) === 'function' ? val(f) : f; const ps = [];
          for (let i = 0; i <= 240; i++) { const x = xmin + (xmax - xmin) * i / 240, y = F(x);
            if (isFinite(y)) ps.push(X(x).toFixed(1) + ',' + Y(Math.max(ymin - span, Math.min(ymax + span, y))).toFixed(1)); }
          e.setAttribute('points', ps.join(' ')); }); return e; },
      /* pre-sampled curve: pieces = [[[x,y],...], ...], split at asymptotes by build_deck.py */
      curve(pieces, opts = {}) { const grp = mk('g', {}, gItems);
        pieces.forEach(pc => { const e = mk('polyline', { points: pc.map(([x, y]) => X(x).toFixed(1) + ',' + Y(Math.max(ymin - span, Math.min(ymax + span, y))).toFixed(1)).join(' ') }, grp); stroke(opts, e); });
        items.push(() => { grp.style.display = shown(opts) ? '' : 'none'; }); return grp; },
      /* live polyline: pts = [[x,y],...] or a function returning it (v6, Y2 L16: ellipses of solids) */
      path(pts, opts = {}) { const e = mk('polyline', {}, gItems); stroke(opts, e);
        items.push(() => { const ok = shown(opts); e.style.display = ok ? '' : 'none'; if (!ok) return;
          e.setAttribute('points', val(pts).map(([x, y]) => X(x).toFixed(1) + ',' + Y(y).toFixed(1)).join(' ')); }); return e; },
      line(P, Q, opts = {}) { const e = mk('line', {}, gItems); stroke(opts, e);
        items.push(() => { const a = pt(P), b = pt(Q); const ok = shown(opts) && a && b && (a.x !== b.x || a.y !== b.y);
          e.style.display = ok ? '' : 'none'; if (!ok) return; const k = 40 * span;
          const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
          e.setAttribute('x1', X(a.x - k * dx / L)); e.setAttribute('y1', Y(a.y - k * dy / L));
          e.setAttribute('x2', X(a.x + k * dx / L)); e.setAttribute('y2', Y(a.y + k * dy / L)); }); return e; },
      segment(P, Q, opts = {}) { const e = mk('line', {}, gItems); stroke(opts, e);
        /* v9: opts.arrows — a filled arrowhead at each end (a distance marked on a figure) */
        const heads = opts.arrows ? [0, 1].map(() => mk('polygon', { fill: e.getAttribute('stroke') }, gItems)) : [];
        items.push(() => { const a = pt(P), b = pt(Q); const ok = shown(opts) && a && b;
          e.style.display = ok ? '' : 'none'; heads.forEach(h => { h.style.display = ok ? '' : 'none'; }); if (!ok) return;
          let x1 = X(a.x), y1 = Y(a.y), x2 = X(b.x), y2 = Y(b.y);
          if (heads.length) { const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(16, L / 3), w = h * 0.42;
            const tip = (h_, x, y, s) => h_.setAttribute('points', `${x},${y} ${x + s * h * ux - w * uy},${y + s * h * uy + w * ux} ${x + s * h * ux + w * uy},${y + s * h * uy - w * ux}`);
            const one = opts.arrows === 'end';   /* v18: arrows 'end' = one arrowhead, at the second point */
            if (one) heads[0].style.display = 'none'; else { tip(heads[0], x1, y1, 1); x1 += 0.8 * h * ux; y1 += 0.8 * h * uy; }
            tip(heads[1], x2, y2, -1); x2 -= 0.8 * h * ux; y2 -= 0.8 * h * uy; }
          e.setAttribute('x1', x1); e.setAttribute('y1', y1); e.setAttribute('x2', x2); e.setAttribute('y2', y2); }); return e; },
      polygon(Ps, opts = {}) { const e = mk('polygon', { fill: opts.color || FILL, 'fill-opacity': opts.opacity ?? FILLOP, stroke: opts.outline || 'none' }, gItems);   /* v17: opts.opacity, opts.outline */
        if (opts.outline) sw(e, 'curve', 3);
        items.push(() => { e.style.display = shown(opts) ? '' : 'none';
          e.setAttribute('points', val(Ps).map(pt).map(p => X(p.x) + ',' + Y(p.y)).join(' ')); }); return e; },
      angle(O, P, Q, opts = {}) { const e = sw(mk('path', { fill: 'none', stroke: opts.color || INK }, gItems), 'curve', opts.color ? 4 : 3);
        items.push(() => { const vis = shown(opts); const o = vis && pt(O), p = vis && pt(P), q = vis && pt(Q); const ok = vis && o && p && q;
          e.style.display = ok ? '' : 'none'; if (!ok) return;
          const a1 = Math.atan2(Y(p.y) - Y(o.y), X(p.x) - X(o.x)), a2 = Math.atan2(Y(q.y) - Y(o.y), X(q.x) - X(o.x));
          let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
          const r = 42, cx = X(o.x), cy = Y(o.y);
          if (Math.abs(Math.abs(d) - Math.PI / 2) < 1e-6) { const u = [Math.cos(a1), Math.sin(a1)], v = [Math.cos(a2), Math.sin(a2)], s = 34;
            e.setAttribute('d', `M${cx + s * u[0]},${cy + s * u[1]} L${cx + s * (u[0] + v[0])},${cy + s * (u[1] + v[1])} L${cx + s * v[0]},${cy + s * v[1]}`);
          } else { e.setAttribute('d', `M${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)}`); } });
        if (opts.label) g.label(() => pt(O).x, () => pt(O).y, opts.label, { anchor: 'ne', visible: opts.visible });
        return e; },
      /* north line: a muted segment of length len above P, an arrowhead and the letter N */
      north(P, opts = {}) { const len = opts.len || 0.14 * span;
        const top = () => { const p = pt(P); return p ? { x: p.x, y: p.y + len } : null; };
        const e = sw(mk('line', { stroke: MUTED, 'stroke-linecap': 'round' }, gItems), 'axis', 3);
        const head = mk('polygon', { fill: MUTED }, gItems);
        items.push(() => { const a = pt(P), ok = shown(opts) && a; e.style.display = head.style.display = ok ? '' : 'none'; if (!ok) return;
          const x = X(a.x), y1 = Y(a.y), y2 = Y(a.y + len);
          e.setAttribute('x1', x); e.setAttribute('y1', y1); e.setAttribute('x2', x); e.setAttribute('y2', y2 + 8);
          head.setAttribute('points', `${x},${y2 - 4} ${x - 10},${y2 + 16} ${x + 10},${y2 + 16}`); });
        g.label(() => top() && top().x, () => top() && top().y, '\\mathrm{N}', { anchor: 'n', visible: () => shown(opts) && !!pt(P) });
        return e; },
      /* bearing arc: clockwise from north (or from opts.from, a bearing) through deg degrees, drawn
         as a polyline so labels keep clear of it; reflex arcs allowed; arrowhead at the end */
      bearing(O, deg, opts = {}) { const e = sw(mk('polyline', { fill: 'none', 'stroke-linecap': 'round' }, gItems), 'curve', 3);
        const col = opts.color || (opts.muted ? MUTED : INK); e.setAttribute('stroke', col);
        const head = mk('polygon', { fill: col }, gItems);
        const R = () => (opts.r ? val(opts.r) : 0.07 * span) / (xmax - xmin) * W;
        items.push(() => { const o = pt(O), d = val(deg), f = val(opts.from) || 0; const ok = shown(opts) && o && d > 0.5;
          e.style.display = head.style.display = ok ? '' : 'none'; if (!ok) return;
          const cx = X(o.x), cy = Y(o.y), r = R(), n = Math.max(8, Math.ceil(d / 3)), ps = [];
          const at = t => { const a = (f + t) * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
          for (let i = 0; i <= n; i++) { const q = at(d * i / n); ps.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)); }
          e.setAttribute('points', ps.join(' '));
          const a = (f + d) * Math.PI / 180, [px, py] = at(d), t = [Math.cos(a), Math.sin(a)], nn = [-Math.sin(a), Math.cos(a)];
          head.setAttribute('points', `${px + 4 * t[0]},${py + 4 * t[1]} ${px - 18 * t[0] + 9 * nn[0]},${py - 18 * t[1] + 9 * nn[1]} ${px - 18 * t[0] - 9 * nn[0]},${py - 18 * t[1] - 9 * nn[1]}`); });
        if (opts.label) { const rl = () => (opts.r ? val(opts.r) : 0.07 * span) * (opts.labelAt || 1.75);
          const mid = () => (val(opts.from) || 0) + val(deg) / 2;
          g.label(() => pt(O).x + rl() * Math.sin(mid() * Math.PI / 180), () => pt(O).y + rl() * Math.cos(mid() * Math.PI / 180), opts.label,
            { anchor: 'c', visible: () => shown(opts) && !!pt(O) && val(deg) > 0.5 }); }
        return e; },
      /* v13 (teacher, 23/10/2026): an angle as a dotted arc with an arrowhead, anticlockwise from the direction
         `from` to the direction `to` (degrees from the positive x-axis), radius r in graph x-units, in the colour of
         the radius it measures; several angles at one vertex take different r */
      arc(O, from, to, opts = {}) { const e = mk('polyline', {}, gItems); stroke(Object.assign({ dotted: true }, opts), e);
        const head = mk('polygon', { fill: e.getAttribute('stroke') }, gItems);
        const R = () => (opts.r ? val(opts.r) : 0.07 * span) / (xmax - xmin) * W;
        items.push(() => { const o = pt(O), f = val(from), t = val(to), ok = shown(opts) && o && Math.abs(t - f) > 0.5;
          e.style.display = head.style.display = ok ? '' : 'none'; if (!ok) return;
          const cx = X(o.x), cy = Y(o.y), r = R(), n = Math.max(8, Math.ceil(Math.abs(t - f) / 3)), ps = [];
          const at = u => { const a = u * Math.PI / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
          const end = t - Math.sign(t - f) * Math.min(6, Math.abs(t - f) / 3);   /* the dots stop short of the head */
          for (let i = 0; i <= n; i++) { const q = at(f + (end - f) * i / n); ps.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)); }
          e.setAttribute('points', ps.join(' '));
          const a = t * Math.PI / 180, s_ = Math.sign(t - f), [px, py] = at(t);
          const tx = -Math.sin(a) * s_, ty = -Math.cos(a) * s_, nx = -ty, ny = tx;   /* screen tangent along the sweep */
          head.setAttribute('points', `${px + 4 * tx},${py + 4 * ty} ${px - 18 * tx + 9 * nx},${py - 18 * ty + 9 * ny} ${px - 18 * tx - 9 * nx},${py - 18 * ty - 9 * ny}`); });
        return e; },
      point(P, opts = {}) { const h = { x: P.x, y: P.y, name: opts.name || '' };
        const snap = opts.snap === undefined ? 1 : opts.snap;
        const grp = mk('g', { class: opts.drag ? 'lab-handle' : 'lab-point', tabindex: opts.drag ? 0 : -1,
          'aria-label': opts.drag ? 'Drag point ' + h.name : 'Point ' + h.name }, opts.drag ? gHandles : gItems);
        if (opts.drag) mk('circle', { r: 46, fill: HANDLE, 'fill-opacity': 0.001 }, grp);
        if (opts.drag) mk('circle', { r: 22, fill: HANDLE, 'fill-opacity': 0.16, class: 'halo' }, grp);
        mk('circle', { r: opts.drag ? 11 : POINT_R, fill: opts.drag ? HANDLE : (opts.color || POINT) }, grp);
        const place = () => { grp.style.display = shown(opts) ? '' : 'none'; grp.setAttribute('transform', `translate(${X(h.x)},${Y(h.y)})`); };
        items.push(place);
        if (opts.drag) {
          const toGraph = ev => { const m = svg.getScreenCTM().inverse(); const p = svg.createSVGPoint();
            p.x = ev.clientX; p.y = ev.clientY; const q = p.matrixTransform(m);
            return { x: xmin + q.x / W * (xmax - xmin), y: ymax - q.y / HH * (ymax - ymin) }; };
          const setTo = (x, y) => { if (snap) { x = Math.round(x / snap) * snap; y = Math.round(y / snap) * snap; }
            x = Math.max(xmin, Math.min(xmax, x)); y = Math.max(ymin, Math.min(ymax, y));
            if (x === h.x && y === h.y) return; if (opts.allow && !opts.allow(x, y)) return;
            h.x = x; h.y = y; if (opts.onMove) opts.onMove(h); };
          let dragging = false;
          grp.addEventListener('pointerdown', ev => { dragging = true; grp.setPointerCapture(ev.pointerId); grp.classList.add('active'); ev.preventDefault(); ev.stopPropagation(); });
          grp.addEventListener('pointermove', ev => { if (!dragging) return; const q = toGraph(ev); setTo(q.x, q.y); });
          const end = ev => { dragging = false; grp.classList.remove('active'); };
          grp.addEventListener('pointerup', end); grp.addEventListener('pointercancel', end);
          grp.addEventListener('click', ev => ev.stopPropagation());
          grp.addEventListener('keydown', ev => { const s = snap || 0.5, k = ev.key;
            const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[k];
            if (d) { setTo(h.x + d[0], h.y + d[1]); ev.preventDefault(); ev.stopPropagation(); } });
          h.el = grp;
        }
        return h; },
      /* A label names an anchor point and a preferred direction; placement is measured, not
         guessed: on every redraw each label takes the first direction, from its preference then
         the rest, whose box clears every drawn line, axis, point, tick number and earlier label
         by a margin (aa-sl-graphs: keep text off the lines, never on its own curve). */
      label(x, y, t, opts = {}) { const d = document.createElement('div'); d.className = 'lab-label'; labels.appendChild(d);
        const L = { d, last: null, fixed: !!opts.fixed };
        items.push(() => { const ok = shown(opts); d.style.display = ok ? '' : 'none'; L.on = ok; if (!ok) return;
          L.x = val(x); L.y = val(y); L.pref = val(opts.anchor) || 'ne';
          const s = val(t); if (s !== L.last) { d.innerHTML = tex(s); L.last = s; } });
        placed.push(L); return d; },
      redraw() { items.forEach(f => f()); place(); place(); },
      collisions() { return place(true); }
    };
    wrap.__g = g;
    return g;
  }

  /* ---------- static figure from a declarative spec ----------
     spec: {window:{xmin,xmax,ymin,ymax,gridx,gridy,xtick,ytick,xname,yname}, items:[...]}
     item kinds: fn {pts} (sampled from expr by build_deck.py), line {through:[[x,y],[x,y]]}, segment {from,to}, polygon {pts}, point {at},
                 label {at, tex, anchor}, angle {O,P,Q}; common: step (visible once that step is shown),
                 dashed, answer (indigo), label/anchor on a point.
     shown() returns the number of steps currently revealed on the slide. */
  function figure(el, spec, shownFn) {
    const g = graph(el, spec.window);
    const P = a => ({ x: a[0], y: a[1] });
    spec.items.forEach(it => {
      const vis = () => (it.step || 0) <= shownFn() && (it.until === undefined || shownFn() <= it.until);   /* v6: until = last step shown */
      const o = { dashed: it.dashed, dotted: it.dotted, answer: it.answer, color: it.color, arrows: it.arrows, visible: vis, opacity: it.opacity, outline: it.outline };
      if (it.kind === 'fn') g.curve(it.pts, o);
      else if (it.kind === 'line') g.line(P(it.through[0]), P(it.through[1]), o);
      else if (it.kind === 'segment') g.segment(P(it.from), P(it.to), o);
      else if (it.kind === 'path') g.path(it.pts, o);
      else if (it.kind === 'polygon') g.polygon(it.pts.map(P), o);
      else if (it.kind === 'angle') g.angle(P(it.O), P(it.P), P(it.Q), Object.assign(o, { color: it.color }));
      else if (it.kind === 'point') { g.point(P(it.at), { visible: vis, color: it.answer ? HANDLE : it.color });   /* v11: answer point */
        if (it.label) g.label(it.at[0], it.at[1], it.label, { anchor: it.anchor || 'ne', visible: vis, fixed: it.fixed }); }
      else if (it.kind === 'label') g.label(it.at[0], it.at[1], it.tex, { anchor: it.anchor || 'c', visible: vis });
      else if (it.kind === 'north') g.north(P(it.at), { len: it.len, visible: vis });
      else if (it.kind === 'arc') g.arc(P(it.at), it.from, it.to, { r: it.r, color: it.answer ? HANDLE : it.color, visible: vis });   /* v13 */
      else if (it.kind === 'bearing') g.bearing(P(it.at), it.deg, { r: it.r, from: it.from, label: it.label, labelAt: it.labelAt, muted: it.muted, color: it.color, visible: vis });
    });
    g.redraw();
    return g;
  }

  /* ---------- controls ---------- */
  let uid = 0;
  function slider(el, o) {
    const id = 'lab-sl-' + (++uid);
    const row = document.createElement('div'); row.className = 'lab-slider';
    row.innerHTML = `<label for="${id}" class="lab-sl-label"></label><input id="${id}" type="range"><output class="lab-sl-val"></output>`;
    el.appendChild(row);
    const inp = row.querySelector('input'), lab = row.querySelector('label'), out = row.querySelector('output');
    lab.innerHTML = tex(o.label); if (o.color) inp.style.accentColor = o.color; inp.min = o.min; inp.max = o.max; inp.step = o.step; inp.value = o.value;
    const fmt = o.format || (v => String(v));
    const show = () => { out.innerHTML = tex(fmt(+inp.value)); };
    inp.addEventListener('input', () => { show(); if (o.onChange) o.onChange(+inp.value); });
    show();
    return { input: inp, value: () => +inp.value, set(v) { inp.value = v; show(); if (o.onChange) o.onChange(+inp.value); } };
  }
  function toggle(el, o) {
    const box = document.createElement('div'); box.className = 'lab-toggle'; box.setAttribute('role', 'radiogroup');
    let cur = o.value || o.options[0];
    o.options.forEach(opt => { const b = document.createElement('button'); b.type = 'button'; b.textContent = opt;
      b.setAttribute('role', 'radio'); b.dataset.opt = opt;
      b.addEventListener('click', ev => { ev.stopPropagation(); cur = opt; paint(); if (o.onChange) o.onChange(opt); });
      box.appendChild(b); });
    const paint = () => box.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.opt === cur));
    paint(); el.appendChild(box);
    return { value: () => cur };
  }
  /* shrink a readout that would otherwise scroll sideways (phone width) */
  function fitReadout(d) { d.style.fontSize = ''; if (!d.clientWidth) return; let f = 1;
    for (let i = 0; i < 4 && d.scrollWidth > d.clientWidth + 1; i++) { f *= d.clientWidth / d.scrollWidth * 0.97; d.style.fontSize = f + 'em'; } }
  function readout(el, f) {
    const d = document.createElement('div'); d.className = 'lab-readout'; el.appendChild(d);
    let last = null;
    const r = { el: d, update() { const s = f(); if (s !== last) { d.innerHTML = tex(s); last = s; } fitReadout(d); } };
    r.update(); return r;
  }

  /* shared panel scaffolding for a preset: graph on the left, controls beside it */
  function scaffold(container, init) {
    container.classList.add('lab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const g = graph(left, init.window);
    if (init.instruction) { const p = document.createElement('p'); p.className = 'lab-instruction'; p.textContent = init.instruction; left.appendChild(p); }
    const state = { g, controls: right, readouts: [], handles: [], sliders: [], toggles: [] };
    state.refresh = () => { g.redraw(); state.readouts.forEach(r => r.update()); };
    container.__lab = state;
    return state;
  }
  const group = (el, title) => { const s = document.createElement('div'); s.className = 'lab-group';
    if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); }
    el.appendChild(s); return s; };


  /* v11 helpers shared by sinusoidABCD and tanABCD: numbers as read, multiples of π, the equation */
  function trigKit(g, w) {
    const dec = v => { const r = Math.round(v * 1000) / 1000; return (r < 0 ? '-' : '') + String(Math.abs(r)); };
    const piTex = F => { F = F instanceof Frac ? F : Frac.of(F); if (F.n === 0) return '0';
      const s = F.n < 0 ? '-' : '', n = Math.abs(F.n);
      if (F.d === 1) return s + (n === 1 ? '' : n) + '\\pi';
      return s + '\\tfrac{' + (n === 1 ? '' : n) + '\\pi}{' + F.d + '}'; };
    const coef = a => (a === 1 ? '' : a === -1 ? '-' : dec(a));
    const plus = d => (d === 0 ? '' : d > 0 ? ' + ' + dec(d) : ' - ' + dec(-d));
    const argTex = (fn, b, k) => { const bT = b === 1 ? '' : dec(b);
      if (k === 0) return fn + ' ' + bT + 'x';
      const cs = (k > 0 ? ' + ' : ' - ') + piTex(new Frac(Math.abs(k), 12));
      return fn + '\\left(' + (b === 1 ? 'x' + cs : bT + '\\left(x' + cs + '\\right)') + '\\right)'; };
    const samp = f => { const ps = [], N = 480; for (let i = 0; i <= N; i++) { const x = w.xmin + (w.xmax - w.xmin) * i / N; ps.push([x, f(x)]); } return ps; };
    return { dec, piTex, coef, plus, argTex, samp };
  }

  /* ---------- presets ---------- */
  const presets = {
    /* Y1 L15 — gradient from two draggable points */
    line2pts(container, init) {
      const S = scaffold(container, init), g = S.g;
      let A, B;
      const moved = () => S.refresh();
      const C = () => ({ x: B.x, y: A.y });
      const vis = () => A.x !== B.x && A.y !== B.y;
      g.polygon(() => [A, C(), B], { visible: vis });
      g.line(() => A, () => B);
      g.segment(() => A, C, { dashed: true, visible: () => A.x !== B.x });
      g.segment(C, () => B, { dashed: true, visible: () => A.y !== B.y });
      g.label(() => (A.x + B.x) / 2, () => A.y, () => '\\text{run} = ' + (B.x - A.x), { anchor: () => (B.y > A.y ? 's' : 'n'), visible: () => A.x !== B.x });
      g.label(() => B.x, () => (A.y + B.y) / 2, () => '\\text{rise} = ' + (B.y - A.y), { anchor: () => (B.x > A.x ? 'e' : 'w'), visible: () => A.y !== B.y });
      const notSame = other => (x, y) => !(x === other().x && y === other().y);
      A = g.point(init.A, { drag: true, snap: init.snap ?? 1, onMove: moved, name: 'A', allow: notSame(() => B) });
      B = g.point(init.B, { drag: true, snap: init.snap ?? 1, onMove: moved, name: 'B', allow: notSame(() => A) });
      g.label(() => A.x, () => A.y, () => 'A(' + A.x + ',\\,' + A.y + ')', { anchor: 'nw' });
      g.label(() => B.x, () => B.y, () => 'B(' + B.x + ',\\,' + B.y + ')', { anchor: 'ne' });
      S.handles.push(A, B);
      const r1 = group(S.controls, 'Gradient');
      S.readouts.push(readout(r1, () => {
        const dy = B.y - A.y, dx = B.x - A.x;
        const sub = '\\frac{' + B.y + '-' + paren(A.y) + '}{' + B.x + '-' + paren(A.x) + '}';
        if (dx === 0) return 'm = ' + sub + ' = \\frac{' + dy + '}{0}\\ \\text{— no gradient}';
        const m = new Frac(dy, dx);
        const raw = '\\frac{' + dy + '}{' + dx + '}';
        return 'm = ' + sub + (m.d === dx && m.n === dy ? '' : ' = ' + raw) + ' = ' + m.tex();
      }));
      const r2 = group(S.controls, 'Equation');
      S.readouts.push(readout(r2, () => {
        const dy = B.y - A.y, dx = B.x - A.x;
        if (dx === 0) return 'x = ' + A.x;
        const m = new Frac(dy, dx), c = new Frac(A.y).sub(m.mul(A.x));
        return 'y = ' + linTex(m, c);
      }));
      S.readouts.push(readout(r2, () => {
        const dy = B.y - A.y, dx = B.x - A.x;
        return generalTex(dy, -dx, dx * A.y - dy * A.x);
      }));
      S.refresh();
      return S;
    },

    /* Y1 L15 — line from sliders m and c; a second line through a draggable point, parallel or perpendicular */
    lineMC(container, init) {
      const S = scaffold(container, init), g = S.g;
      let m = init.m, c = init.c, mode = init.mode || 'perpendicular', P;
      const M1 = () => Frac.of(m), C1 = () => Frac.of(c);
      const vertical2 = () => mode === 'perpendicular' && M1().isZero();
      const M2 = () => (mode === 'parallel' ? M1() : new Frac(-1).div(M1()));
      const C2 = () => new Frac(P.y).sub(M2().mul(P.x));
      const inter = () => {
        if (vertical2()) return { x: new Frac(P.x), y: C1() };
        const m1 = M1(), m2 = M2(); if (m1.eq(m2)) return null;
        const x = C2().sub(C1()).div(m1.sub(m2)); return { x, y: m1.mul(x).add(C1()) };
      };
      g.fn(x => m * x + c);
      g.line(() => P, () => (vertical2() ? { x: P.x, y: P.y + 1 } : { x: P.x + 1, y: P.y + +M2() }), { dashed: true });
      const I = () => { const q = inter(); return q ? { x: +q.x, y: +q.y } : null; };
      g.angle(I, () => { const q = I(); return { x: q.x + 1, y: q.y + m }; },
        () => { const q = I(); return vertical2() ? { x: q.x, y: q.y + 1 } : { x: q.x + 1, y: q.y + +M2() }; },
        { visible: () => mode === 'perpendicular' && I() && Math.abs(I().x) < init.window.xmax && Math.abs(I().y) < init.window.ymax });
      P = g.point(init.P, { drag: true, snap: init.snap ?? 1, onMove: () => S.refresh(), name: init.Pname || 'P' });
      g.label(() => P.x, () => P.y, () => (init.Pname || 'P') + '(' + P.x + ',\\,' + P.y + ')', { anchor: 'se' });
      S.handles.push(P);
      const cs = group(S.controls, 'Line L<sub>1</sub>');
      const fmt = v => Frac.of(v).tex();
      S.sliders.push(slider(cs, { min: -5, max: 5, step: 0.1, value: m, label: 'm_1', format: fmt, onChange: v => { m = v; S.refresh(); } }));
      S.sliders.push(slider(cs, { min: -6, max: 6, step: 0.1, value: c, label: 'c_1', format: fmt, onChange: v => { c = v; S.refresh(); } }));
      S.readouts.push(readout(cs, () => 'L_1:\\ y = ' + linTex(M1(), C1())));
      const ts = group(S.controls, 'Line L<sub>2</sub> through ' + (init.Pname || 'P'));
      S.toggles.push(toggle(ts, { options: ['parallel', 'perpendicular'], value: mode, onChange: v => { mode = v; S.refresh(); } }));
      S.readouts.push(readout(ts, () => vertical2() ? 'L_2:\\ x = ' + P.x : 'L_2:\\ y = ' + linTex(M2(), C2())));
      S.readouts.push(readout(ts, () => vertical2() ? generalTex(1, 0, -P.x) :generalFromMC(M2(), C2())));
      const ks = group(S.controls, 'Check');
      S.readouts.push(readout(ks, () => vertical2() ? 'm_1 m_2:\\ \\text{undefined — } L_2 \\text{ is vertical}'
        : 'm_1 m_2 = ' + M1().tex() + ' \\times ' + (M2().n < 0 ? '\\left(' + M2().tex() + '\\right)' : M2().tex()) + ' = ' + M1().mul(M2()).tex()));
      S.readouts.push(readout(ks, () => { const q = inter();
        if (!q) return C1().eq(C2()) ? '\\text{Same line}' : '\\text{No intersection — parallel}';
        return '\\text{Meet at }\\left(' + q.x.tex() + ',\\ ' + q.y.tex() + '\\right)'; }));
      S.refresh();
      return S;
    },

    /* Y1 L16 — y = ax^2 + bx + c from sliders a, b, c: the discriminant decides */
    parabolaABC(container, init) {
      const S = scaffold(container, init), g = S.g, Wn = init.window;
      let a = init.a, b = init.b, c = init.c;
      const D = () => b * b - 4 * a * c;
      const H = () => (a === 0 ? new Frac(0) : new Frac(-b, 2 * a)), K = () => (a === 0 ? new Frac(0) : new Frac(-D(), 4 * a));
      const inWin = (x, y, m = 1) => x > Wn.xmin + m - 1e-9 && x < Wn.xmax - m + 1e-9 && y > Wn.ymin + m - 1e-9 && y < Wn.ymax - m + 1e-9;
      /* simplified surd: sqrt(n) = k sqrt(m) */
      const surd = n => { let k = 1, m = n; for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) { m /= p * p; k *= p; } return { k, m }; };
      const roots = () => { if (a === 0 || D() < 0) return [];
        const h = -b / (2 * a), s = Math.sqrt(D()) / (2 * Math.abs(a)); return D() === 0 ? [h] : [h - s, h + s]; };
      g.fn(() => x => a * x * x + b * x + c);
      g.segment(() => ({ x: +H(), y: Wn.ymin }), () => ({ x: +H(), y: Wn.ymax }), { dashed: true, visible: () => a !== 0 && inWin(+H(), 0) });
      const R = [0, 1].map(i => g.point({ x: 0, y: 0 }, { name: 'root', visible: () => roots().length > i && inWin(roots()[i], 0) }));
      const V = g.point({ x: 0, y: 0 }, { name: 'vertex', visible: () => a !== 0 && D() !== 0 && inWin(+H(), +K()) });
      const sync = () => { const r = roots(); R.forEach((p, i) => { if (r.length > i) { p.x = r[i]; p.y = 0; } });
        if (a !== 0) { V.x = +H(); V.y = +K(); } };
      const refresh = () => { sync(); S.refresh(); };
      const signed = (k, v, first) => { if (k === 0) return '';
        const mag = Math.abs(k) === 1 && v ? '' : String(Math.abs(k));
        return (first ? (k < 0 ? '-' : '') : (k < 0 ? ' - ' : ' + ')) + mag + v; };
      const quadTex = () => { const s = signed(a, 'x^2', true) + signed(b, 'x', !a) + signed(c, '', !a && !b); return s || '0'; };
      const par = n => (n < 0 ? '(' + n + ')' : String(n));
      const noQuad = '\\text{Not a quadratic: } a = 0';

      const eq = group(S.controls, 'The parabola');
      S.sliders.push(slider(eq, { min: -3, max: 3, step: 1, value: a, label: 'a', onChange: v => { a = v; refresh(); } }));
      S.sliders.push(slider(eq, { min: -6, max: 6, step: 1, value: b, label: 'b', onChange: v => { b = v; refresh(); } }));
      S.sliders.push(slider(eq, { min: -6, max: 6, step: 1, value: c, label: 'c', onChange: v => { c = v; refresh(); } }));
      S.readouts.push(readout(eq, () => 'y = ' + quadTex()));
      S.readouts.push(readout(eq, () => {
        if (a === 0) return noQuad;
        const p = new Frac(b, 2 * a), k = K();
        const co = a === 1 ? '' : a === -1 ? '-' : String(a);
        const sq = p.isZero() ? 'x^2' : '\\left(x ' + (p.n < 0 ? '- ' + p.neg().tex() : '+ ' + p.tex()) + '\\right)^2';
        const kt = k.isZero() ? '' : (k.n < 0 ? ' - ' + k.neg().tex() : ' + ' + k.tex());
        return 'y = ' + co + sq + kt + ',\\ \\ \\text{vertex } \\left(' + H().tex() + ',\\,' + K().tex() + '\\right)';
      }));

      const dg = group(S.controls, 'Discriminant first');
      S.readouts.push(readout(dg, () => a === 0 ? '\\text{—}' : '\\Delta = ' + par(b) + '^2 - 4(' + a + ')(' + c + ')'));
      S.readouts.push(readout(dg, () => a === 0 ? '\\text{—}' : '= ' + D() + (D() > 0 ? ' > 0:\\ \\text{two distinct real roots}'
        : D() === 0 ? ':\\ \\text{two equal real roots}' : ' < 0:\\ \\text{no real roots}')));

      const rg = group(S.controls, 'Roots');
      const dist = () => { if (D() === 0) return '0'; const { k, m } = surd(D()), f = new Frac(k, 2 * Math.abs(a));
        if (m === 1) return f.tex();
        const st = (f.n === 1 ? '' : f.n) + '\\sqrt{' + m + '}'; return f.d === 1 ? st : '\\frac{' + st + '}{' + f.d + '}'; };
      S.readouts.push(readout(rg, () => {
        if (a === 0) return '\\text{—}';
        if (D() < 0) return '\\text{Cannot take the square root of a negative discriminant}';
        return '-\\frac{b}{2a} = ' + H().tex() + ',\\quad \\frac{\\sqrt{\\Delta}}{2a} = ' + dist();
      }));
      S.readouts.push(readout(rg, () => {
        if (a === 0) return '\\text{—}';
        if (D() < 0) return '\\bl{\\text{No real roots}}';
        const h = H(); if (D() === 0) return 'x = \\bl{' + h.tex() + '}';
        const { k, m } = surd(D()), f = new Frac(k, 2 * Math.abs(a));
        if (m === 1) return 'x = \\bl{' + h.sub(f).tex() + '} \\ \\text{or}\\ x = \\bl{' + h.add(f).tex() + '}';
        return 'x = \\bl{' + (h.isZero() ? '' : h.tex()) + ' \\pm ' + dist() + '}';
      }));
      refresh();
      return S;
    },

    /* Y2 L15 — bearing of B from A and its back bearing; toggle "change of course" adds a leg B -> C
       with its own north line and the interior angle at B. Each mode opens on its example's values:
       init.one {b1, r1}, init.course {b1, r1, b2, r2}. Handles snap to whole degrees, radius to 0.5. */
    bearing(container, init) {
      const S = scaffold(container, init), g = S.g, Wn = init.window;
      const A = { x: init.A.x, y: init.A.y }, ONE = 'one bearing', CRS = 'change of course';
      const rad = t => t * Math.PI / 180;
      const polar = (O, b, r) => ({ x: O.x + r * Math.sin(rad(b)), y: O.y + r * Math.cos(rad(b)) });
      const norm = t => ((Math.round(t) % 360) + 360) % 360;
      const brgOf = (O, P) => norm(Math.atan2(P.x - O.x, P.y - O.y) * 180 / Math.PI);
      const inside = P => P.x >= Wn.xmin + 1 && P.x <= Wn.xmax - 1 && P.y >= Wn.ymin + 1 && P.y <= Wn.ymax - 1;
      const three = b => String(b).padStart(3, '0') + '^{\\circ}';
      let mode = init.mode || ONE, b1, r1, b2, r2;
      const course = () => mode === CRS;
      const load = () => { const c = course() ? init.course : init.one; b1 = c.b1; r1 = c.r1; b2 = c.b2 ?? 90; r2 = c.r2 ?? 4; };
      let B, C;
      const place = () => { const pB = polar(A, b1, r1); B.x = pB.x; B.y = pB.y; const pC = polar(B, b2, r2); C.x = pC.x; C.y = pC.y; };
      const back = () => (b1 < 180 ? b1 + 180 : b1 - 180);
      const interior = () => { let d = Math.abs(back() - b2) % 360; if (d > 180) d = 360 - d; return d; };
      /* a drag proposes a raw position; it is snapped to polar values, and refused if a point would leave the window */
      const tryMove = (O, h, which) => {
        const b = brgOf(O, h), r = Math.max(2.5, Math.min(8, Math.round(Math.hypot(h.x - O.x, h.y - O.y) * 2) / 2));
        const keep = [b1, r1, b2, r2];
        if (which === 'B') { b1 = b; r1 = r; } else { b2 = b; r2 = r; }
        const pB = polar(A, b1, r1), pC = polar(pB, b2, r2);
        if (!inside(pB) || (course() && !inside(pC))) [b1, r1, b2, r2] = keep;
        place(); S.refresh(); };
      g.north(() => A, { len: init.north || 2.2 });
      g.north(() => B, { len: init.north || 2.2 });
      g.north(() => C, { len: init.north || 2.2, visible: course });
      g.segment(() => A, () => B);
      g.segment(() => B, () => C, { visible: course });
      g.bearing(() => A, () => b1, { r: 1.1, label: () => three(b1) });
      g.bearing(() => B, () => back(), { r: 0.8, muted: true, label: () => three(back()), labelAt: 1.9, visible: () => !course() });
      g.bearing(() => B, () => b2, { r: 1.1, label: () => three(b2), visible: course });
      g.angle(() => B, () => A, () => C, { visible: () => course() && interior() > 1 && interior() < 179 });
      /* interior-angle label on the bisector of BA and BC */
      const bis = () => { const u = polar({ x: 0, y: 0 }, back(), 1), v = polar({ x: 0, y: 0 }, b2, 1);
        const x = u.x + v.x, y = u.y + v.y, L = Math.hypot(x, y) || 1; return { x: B.x + 1.65 * x / L, y: B.y + 1.65 * y / L }; };
      g.label(() => bis().x, () => bis().y, () => interior() + '^{\\circ}',
        { anchor: 'c', visible: () => course() && interior() > 1 && interior() < 179 });
      B = g.point({ x: 0, y: 0 }, { drag: true, snap: 0, name: 'B', onMove: h => tryMove(A, h, 'B') });
      C = g.point({ x: 0, y: 0 }, { drag: true, snap: 0, name: 'C', onMove: h => tryMove(B, h, 'C'), visible: course });
      g.point(A, { name: 'A' });
      g.label(A.x - 1.7, A.y, 'A', { anchor: 'c' });
      g.label(() => B.x, () => B.y, 'B', { anchor: () => (course() ? 'w' : 'se') });
      g.label(() => C.x, () => C.y, 'C', { anchor: 'e', visible: course });
      S.handles.push(B, C);
      const g1 = group(S.controls, 'Bearings');
      S.readouts.push(readout(g1, () => 'B \\text{ from } A = \\bl{' + three(b1) + '}'));
      S.readouts.push(readout(g1, () => 'A \\text{ from } B = ' + b1 + '^{\\circ} ' + (b1 < 180 ? '+' : '-') + ' 180^{\\circ} = \\bl{' + three(back()) + '}'));
      const g2 = group(S.controls, 'Change of course at B');
      S.toggles.push(toggle(g2, { options: [ONE, CRS], value: mode, onChange: v => { mode = v; load(); place(); S.refresh(); } }));
      S.readouts.push(readout(g2, () => course() ? '\\text{bearing of } C \\text{ from } B = \\bl{' + three(b2) + '}' : '\\text{bearing of } C \\text{ from } B:\\ \\text{—}'));
      S.readouts.push(readout(g2, () => course() ? '\\text{interior angle } A\\hat{B}C = \\bl{' + interior() + '^{\\circ}}' : '\\text{interior angle } A\\hat{B}C:\\ \\text{—}'));
      load(); place(); S.refresh();
      return S;
    },

    /* Y2 L15 — angle of elevation of the top T of a tower from an observer A on level ground.
       Slider: tower height (metres); handle: A along the ground; toggle: the angle of depression at T.
       init: {window (plain), F: x of the foot, scale: metres per graph unit, h, hmin, hmax, hstep, A: x of the observer} */
    elevation(container, init) {
      const S = scaffold(container, init), g = S.g, Wn = init.window, k = init.scale || 1;
      let h = init.h, dep = false;
      const F = { x: init.F, y: 0 }, T = () => ({ x: F.x, y: h / k });
      const dist = () => Math.round((F.x - O.x) * k * 100) / 100;
      const theta = () => Math.atan2(h, dist()) * 180 / Math.PI;
      const sf = v => (+v.toPrecision(3)).toString();
      const deg1 = v => v.toFixed(1) + '^{\\circ}';
      let O;
      g.segment({ x: Wn.xmin + 0.3, y: 0 }, { x: Wn.xmax - 0.3, y: 0 }, { dashed: true });
      g.segment(() => F, T);
      g.segment(() => O, T);
      g.angle(() => F, T, () => O);
      g.angle(() => O, () => F, T);
      const along = (P, Q1, Q2, r) => { const a = [Q1.x - P.x, Q1.y - P.y], b = [Q2.x - P.x, Q2.y - P.y];
        const la = Math.hypot(...a) || 1, lb = Math.hypot(...b) || 1, x = a[0] / la + b[0] / lb, y = a[1] / la + b[1] / lb, L = Math.hypot(x, y) || 1;
        return { x: P.x + r * x / L, y: P.y + r * y / L }; };
      const lblA = () => along(O, F, T(), 2.7);
      g.label(() => lblA().x, () => lblA().y, '\\theta', { anchor: 'c' });
      g.segment(T, () => ({ x: O.x, y: h / k }), { dashed: true, visible: () => dep });
      g.angle(T, () => ({ x: O.x, y: h / k }), () => O, { visible: () => dep });
      const lblT = () => along(T(), { x: O.x, y: h / k }, O, 2.7);
      g.label(() => lblT().x, () => lblT().y, '\\theta', { anchor: 'c', visible: () => dep });
      g.label(() => (O.x + F.x) / 2, 0, () => 'd = ' + sf(dist()) + '\\text{ m}', { anchor: 's' });
      g.label(() => F.x, () => h / k / 2, () => 'h = ' + h + '\\text{ m}', { anchor: 'e' });
      const Tp = g.point({ x: F.x, y: h / k }, { name: 'T' }); g.point(F, { name: 'F' });
      const refresh = () => { Tp.y = h / k; S.refresh(); };
      g.label(() => T().x, () => T().y, 'T', { anchor: 'ne' });
      g.label(F.x, 0, 'F', { anchor: 'se' });
      O = g.point({ x: init.A, y: 0 }, { drag: true, snap: 0.5, name: 'A',
        onMove: p => { p.y = 0; p.x = Math.max(Wn.xmin + 1, Math.min(F.x - 1.5, p.x)); refresh(); } });
      g.label(() => O.x, 0, 'A', { anchor: 'sw' });
      S.handles.push(O);
      const gt = group(S.controls, 'The tower');
      S.sliders.push(slider(gt, { min: init.hmin, max: init.hmax, step: init.hstep || 1, value: h, label: 'h', format: v => v + '\\text{ m}',
        onChange: v => { h = v; refresh(); } }));
      const ge = group(S.controls, 'Angle of elevation at A');
      S.readouts.push(readout(ge, () => 'h = ' + h + '\\text{ m},\\quad d = ' + sf(dist()) + '\\text{ m}'));
      S.readouts.push(readout(ge, () => '\\tan\\theta = \\frac{h}{d} = \\frac{' + h + '}{' + sf(dist()) + '} = ' + sf(h / dist())));
      S.readouts.push(readout(ge, () => '\\theta = \\bl{' + deg1(theta()) + '}'));
      const gd = group(S.controls, 'Angle of depression at T');
      S.toggles.push(toggle(gd, { options: ['hide', 'show'], value: 'hide', onChange: v => { dep = v === 'show'; refresh(); } }));
      S.readouts.push(readout(gd, () => dep ? '\\text{at } T:\\ \\bl{' + deg1(theta()) + '} = \\theta' : '\\text{at } T:\\ \\text{—}'));
      refresh();
      return S;
    },
    /* Y2 L16 — a cone or a square-based pyramid in a 2D oblique view (never 3D), with the right
       triangle that gives its slant height drawn flat beside it. Toggle: the solid; sliders: r (cone)
       or a (pyramid base edge), and h. Readouts: l, V, A (curved and total for the cone, total for the pyramid).
       init: {window (plain, square), k: graph units per cm, O: [x, y] base centre of the solid,
              T: [x, y] right-angle corner of the flat triangle, solid: 'cone'|'pyramid',
              cone: {r, h}, pyramid: {a, h}, rRange, aRange, hRange: [min, max, step], t2c: {h, l: hex}} */
    solidSection(container, init) {
      const S = scaffold(container, init), g = S.g, k = init.k || 0.34;
      const CONE = 'cone', PYR = 'pyramid';
      let solid = init.solid || CONE;
      const dims = { cone: Object.assign({ r: 8, h: 15 }, init.cone), pyramid: Object.assign({ a: 14, h: 24 }, init.pyramid) };
      const cone = () => solid === CONE;
      const c = init.t2c || {}, sym = s => (c[s] ? '\\textcolor{' + c[s] + '}{' + s + '}' : s);
      const H = () => dims[solid].h, base = () => (cone() ? dims.cone.r : dims.pyramid.a / 2);   /* the horizontal leg */
      const L = () => Math.hypot(H(), base());
      const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
      const sf = v => (isInt(v) ? String(Math.round(v)) : String(+v.toPrecision(3)));
      const [ox, oy] = init.O || [4.2, 1], [tx, ty] = init.T || [11.2, 1];
      /* the solid */
      const Oc = { x: ox, y: oy }, V = () => ({ x: ox, y: oy + H() * k });
      const rr = () => dims.cone.r * k, eb = () => 0.3 * rr();
      const arc = (t0, t1) => () => { const ps = []; for (let i = 0; i <= 32; i++) { const t = t0 + (t1 - t0) * i / 32; ps.push([ox + rr() * Math.cos(t), oy + eb() * Math.sin(t)]); } return ps; };
      g.path(arc(Math.PI, 2 * Math.PI), { visible: cone });
      g.path(arc(0, Math.PI), { dashed: true, visible: cone });
      g.segment(V, () => ({ x: ox - rr(), y: oy }), { visible: cone });
      g.segment(V, () => ({ x: ox + rr(), y: oy }), { answer: true, visible: cone });
      g.segment(V, () => Oc, { dashed: true, visible: cone });
      g.segment(() => Oc, () => ({ x: ox + rr(), y: oy }), { dashed: true, visible: cone });
      const s = () => dims.pyramid.a / 2 * k, d = () => 0.3 * s();
      const Pc = (i, j) => () => ({ x: ox + i * s() + j * d(), y: oy + j * d() });   /* i: left/right, j: front -1 / back +1 */
      const F1 = Pc(-1, -1), F2 = Pc(1, -1), B2 = Pc(1, 1), B1 = Pc(-1, 1), N = () => ({ x: ox - d(), y: oy - d() });
      const pyr = () => !cone();
      [[F1, F2], [F2, B2]].forEach(([p, q]) => g.segment(p, q, { visible: pyr }));
      [[B1, F1], [B1, B2]].forEach(([p, q]) => g.segment(p, q, { dashed: true, visible: pyr }));
      [F1, F2, B2].forEach(p => g.segment(V, p, { visible: pyr }));
      g.segment(V, B1, { dashed: true, visible: pyr });
      g.segment(V, () => Oc, { dashed: true, visible: pyr });
      g.segment(() => Oc, N, { dashed: true, visible: pyr });
      g.segment(V, N, { answer: true, visible: pyr });
      g.point(Oc); const Vp = g.point({ x: ox, y: oy });
      g.label(() => V().x, () => V().y, 'V', { anchor: 'n' });
      /* the flat right triangle */
      const T0 = { x: tx, y: ty }, TR = () => ({ x: tx + base() * k, y: ty }), TV = () => ({ x: tx, y: ty + H() * k });
      g.polygon(() => [T0, TR(), TV()]);
      g.segment(() => T0, TR); g.segment(() => T0, TV); g.segment(TV, TR, { answer: true });
      g.angle(() => T0, TR, TV);
      g.label(() => (tx + TR().x) / 2, ty, () => (cone() ? 'r' : '\\tfrac{a}{2}') + ' = ' + sf(base()), { anchor: 's' });
      g.label(tx, () => ty + H() * k / 2, () => sym('h') + ' = ' + H(), { anchor: 'w' });
      g.label(() => (tx + TR().x) / 2, () => ty + H() * k / 2, () => '\\bl{' + sym('l') + ' = ' + sf(L()) + '}', { anchor: 'ne' });
      g.label(tx, ty, () => (cone() ? 'O' : 'M'), { anchor: 'sw' });
      g.label(() => TR().x, ty, () => (cone() ? 'R' : 'N'), { anchor: 'se' });
      g.label(tx, () => TV().y, 'V', { anchor: 'n' });
      const refresh = () => { Vp.x = ox; Vp.y = oy + H() * k; S.refresh(); };
      /* controls */
      const gs = group(S.controls, 'Solid (cm)');
      let sb, sh;
      const rng = (r, dflt) => { const [min, max, step] = r || dflt; return { min, max, step }; };
      const setRanges = () => { const r = cone() ? rng(init.rRange, [2, 12, 1]) : rng(init.aRange, [2, 24, 2]);
        Object.assign(sb.input, { min: r.min, max: r.max, step: r.step });
        sb.input.parentNode.querySelector('.lab-sl-label').innerHTML = katex.renderToString(cone() ? 'r' : 'a');
        sb.set(cone() ? dims.cone.r : dims.pyramid.a); sh.set(H()); };
      S.toggles.push(toggle(gs, { options: [CONE, PYR], value: solid, onChange: v => { solid = v; setRanges(); refresh(); } }));
      const gd = gs;
      sb = slider(gd, Object.assign(cone() ? rng(init.rRange, [2, 12, 1]) : rng(init.aRange, [2, 24, 2]),
        { value: cone() ? dims.cone.r : dims.pyramid.a, label: cone() ? 'r' : 'a',
          onChange: v => { if (cone()) dims.cone.r = v; else dims.pyramid.a = v; refresh(); } }));
      sh = slider(gd, Object.assign(rng(init.hRange, [2, 24, 1]), { value: H(), label: sym('h'), onChange: v => { dims[solid].h = v; refresh(); } }));
      S.sliders.push(sb, sh);
      const gl = group(S.controls, 'Slant height');
      S.readouts.push(readout(gl, () => sym('l') + ' = \\sqrt{' + sf(base()) + '^2 + ' + H() + '^2} = \\bl{' + sf(L()) + '\\text{ cm}}'));
      const gv = group(S.controls, 'Volume and surface area');
      S.readouts.push(readout(gv, () => { const r = dims.cone.r, a = dims.pyramid.a;
        return cone() ? 'V = \\tfrac{1}{3}\\pi r^2 ' + sym('h') + ' = \\bl{' + sf(Math.PI * r * r * H() / 3) + '\\text{ cm}^3}'
                      : 'V = \\tfrac{1}{3}a^2 ' + sym('h') + ' = \\bl{' + sf(a * a * H() / 3) + '\\text{ cm}^3}'; }));
      S.readouts.push(readout(gv, () => { const r = dims.cone.r, a = dims.pyramid.a;
        return cone() ? '\\text{curved } \\pi r ' + sym('l') + ' = ' + sf(Math.PI * r * L()) + ',\\ \\text{total} = \\bl{' + sf(Math.PI * r * r + Math.PI * r * L()) + '\\text{ cm}^2}'
                      : '\\text{total } a^2 + 4\\cdot\\tfrac{1}{2}a' + sym('l') + ' = \\bl{' + sf(a * a + 2 * a * L()) + '\\text{ cm}^2}'; }));
      refresh();
      return S;
    },
    /* Y2 L17 — a cuboid in a 2D oblique view (never 3D) and the angle read in a flat right triangle.
       Toggle 'two lines': face diagonal AH and space diagonal AG, right angle at H.
       Toggle 'line and base': AG and the base ABCD, projection AC, right angle at C.
       Sliders: length l = AB, depth d = AD, height h = AE. Readouts: the two legs, tan θ, θ.
       init: {window (plain), k: graph units per cm, O: [x, y] the corner A, T: [x, y] a corner of the
              flat triangle's box, l, d, h, lRange, dRange, hRange: [min, max, step], mode} */
    cuboidAngle(container, init) {
      const S = scaffold(container, init), g = S.g, k = init.k || 0.4;
      const TWO = 'two lines', BASE = 'line and base';
      let mode = init.mode || TWO;
      const dim = { l: init.l || 9, d: init.d || 6, h: init.h || 4 };
      const two = () => mode === TWO, base = () => !two();
      const sf = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(+v.toPrecision(3)));
      const [ox, oy] = init.O || [0, 0], [tx, ty] = init.T || [9, 0];
      const cx = Math.cos(Math.PI / 6) * 0.5, cy = Math.sin(Math.PI / 6) * 0.5;
      const P = (i, j, u) => () => ({ x: ox + (i * dim.l + j * dim.d * cx) * k, y: oy + (j * dim.d * cy + u * dim.h) * k });
      const A = P(0, 0, 0), B = P(1, 0, 0), C = P(1, 1, 0), D = P(0, 1, 0), E = P(0, 0, 1), F = P(1, 0, 1), G = P(1, 1, 1), H = P(0, 1, 1);
      /* shaded triangle in the solid */
      g.polygon(() => [A(), H(), G()], { visible: two });
      g.polygon(() => [A(), C(), G()], { visible: base });
      /* edges: hidden ones dashed */
      [[A, B], [B, C], [E, F], [F, G], [G, H], [H, E], [A, E], [B, F], [C, G]].forEach(([p, q]) => g.segment(p, q));
      [[D, A], [D, C], [D, H]].forEach(([p, q]) => g.segment(p, q, { dashed: true }));
      g.segment(A, H, { answer: true, visible: two });
      g.segment(A, C, { dashed: true, visible: base });
      g.segment(A, G, { answer: true });
      g.label(() => A().x, () => A().y, 'A', { anchor: 'sw' });
      g.label(() => G().x, () => G().y, 'G', { anchor: 'ne' });
      g.label(() => H().x, () => H().y, 'H', { anchor: 'nw', visible: two });
      g.label(() => C().x, () => C().y, 'C', { anchor: 'e', visible: base });
      g.label(() => (A().x + B().x) / 2, () => A().y, () => 'l = ' + dim.l, { anchor: 's' });
      g.label(() => A().x, () => (A().y + E().y) / 2, () => 'h = ' + dim.h, { anchor: 'w' });
      g.label(() => (B().x + C().x) / 2, () => (B().y + C().y) / 2, () => 'd = ' + dim.d, { anchor: 'se' });
      /* the flat right triangle: the leg from A (horizontal in 'line and base', vertical in 'two lines') */
      const adj = () => (two() ? Math.hypot(dim.d, dim.h) : Math.hypot(dim.l, dim.d));
      const opp = () => (two() ? dim.l : dim.h);
      const th = () => Math.atan2(opp(), adj()) * 180 / Math.PI;
      /* two lines: H top-left, G to its right, A below H.  line and base: A bottom-left, C right, G above C */
      const fA = () => (two() ? { x: tx, y: ty } : { x: tx, y: ty });
      const fR = () => (two() ? { x: tx, y: ty + adj() * k } : { x: tx + adj() * k, y: ty });            /* the right-angle vertex */
      const fG = () => (two() ? { x: tx + opp() * k, y: ty + adj() * k } : { x: tx + adj() * k, y: ty + opp() * k });
      g.polygon(() => [fA(), fR(), fG()]);
      g.segment(fA, fR); g.segment(fR, fG); g.segment(fA, fG, { answer: true });
      g.angle(fR, fG, fA); g.angle(fA, fR, fG);
      const bis = r => { const a = fA(), p = fR(), q = fG(); const u = [p.x - a.x, p.y - a.y], v = [q.x - a.x, q.y - a.y];
        const lu = Math.hypot(...u) || 1, lv = Math.hypot(...v) || 1, x = u[0] / lu + v[0] / lv, y = u[1] / lu + v[1] / lv, L = Math.hypot(x, y) || 1;
        return { x: a.x + r * x / L, y: a.y + r * y / L }; };
      /* θ on the bisector: further out for a narrow angle, never past two thirds of the leg from A */
      const rT = () => Math.min(0.65 * adj() * k, Math.max(1.6, 0.95 / Math.tan(th() * Math.PI / 360)));
      g.label(() => bis(rT()).x, () => bis(rT()).y, '\\theta', { anchor: 'c' });
      g.label(() => fA().x, () => fA().y, 'A', { anchor: 'sw' });
      g.label(() => fR().x, () => fR().y, () => (two() ? 'H' : 'C'), { anchor: () => (two() ? 'nw' : 'se') });
      g.label(() => fG().x, () => fG().y, 'G', { anchor: 'ne' });
      g.label(() => (fA().x + fR().x) / 2, () => (fA().y + fR().y) / 2, () => sf(adj()), { anchor: () => (two() ? 'w' : 's') });
      g.label(() => (fR().x + fG().x) / 2, () => (fR().y + fG().y) / 2, () => sf(opp()), { anchor: () => (two() ? 'n' : 'e') });
      /* controls */
      const gm = group(S.controls, 'The angle');
      S.toggles.push(toggle(gm, { options: [TWO, BASE], value: mode, onChange: v => { mode = v; S.refresh(); } }));
      const gs = group(S.controls, 'Cuboid (cm)');
      const rng = (r, dflt) => { const [min, max, step] = r || dflt; return { min, max, step }; };
      ['l', 'd', 'h'].forEach(n => S.sliders.push(slider(gs, Object.assign(rng(init[n + 'Range'], [2, 10, 1]),
        { value: dim[n], label: n, onChange: v => { dim[n] = v; S.refresh(); } }))));
      const gr = group(S.controls, 'In the flat triangle');
      S.readouts.push(readout(gr, () => two() ? 'AH = \\sqrt{d^2 + h^2} = \\sqrt{' + (dim.d * dim.d + dim.h * dim.h) + '}'
                                              : 'AC = \\sqrt{l^2 + d^2} = \\sqrt{' + (dim.l * dim.l + dim.d * dim.d) + '}'));
      S.readouts.push(readout(gr, () => '\\tan\\theta = ' + (two() ? '\\frac{HG}{AH} = \\frac{' + dim.l + '}{' + sf(adj()) + '}'
                                                                   : '\\frac{CG}{AC} = \\frac{' + dim.h + '}{' + sf(adj()) + '}')));
      S.readouts.push(readout(gr, () => '\\theta = \\bl{' + th().toFixed(1) + '^{\\circ}}'));
      S.refresh();
      return S;
    },
    /* G9X U3 L2 — a system of two lines, each from sliders m and c: one solution, none, or the same line */
    system2(container, init) {
      const S = scaffold(container, init), g = S.g, w = init.window;
      container.classList.add('sys2');   /* phone: L1 and L2 side by side, solutions below */
      const [C1, C2, CA] = init.colors || [CURVE, '#FF862F', HANDLE];
      let m1 = init.m1, c1 = init.c1, m2 = init.m2, c2 = init.c2;
      const F = Frac.of;
      const inter = () => { const a = F(m1), b = F(c1), p = F(m2), q = F(c2);
        if (a.eq(p)) return null; const x = q.sub(b).div(a.sub(p)); return { x, y: a.mul(x).add(b) }; };
      const inWin = () => { const q = inter(); return !!q && +q.x > w.xmin && +q.x < w.xmax && +q.y > w.ymin && +q.y < w.ymax; };
      g.fn(x => m1 * x + c1, { color: C1 });
      g.fn(x => m2 * x + c2, { color: C2 });
      const I = g.point({ x: 0, y: 0 }, { visible: inWin, color: CA, name: 'solution' });
      g.label(() => I.x, () => I.y, () => { const q = inter(); return '\\color{' + CA + '}{\\left(' + q.x.tex() + ',\\,' + q.y.tex() + '\\right)}'; },
        { anchor: 'ne', visible: inWin });
      const base = S.refresh;
      S.refresh = () => { const q = inter(); if (q) { I.x = +q.x; I.y = +q.y; } base(); };
      const fmt = v => F(v).tex();
      const line = (k, col, getM, getC, setM, setC) => {
        const gr = group(S.controls, '<span style="color:' + col + '">Line L<sub>' + k + '</sub></span>');
        S.sliders.push(slider(gr, { min: -5, max: 5, step: 0.5, value: getM(), label: '\\color{' + col + '}{m_' + k + '}', color: col, format: fmt, onChange: v => { setM(v); S.refresh(); } }));
        S.sliders.push(slider(gr, { min: -6, max: 6, step: 0.5, value: getC(), label: '\\color{' + col + '}{c_' + k + '}', color: col, format: fmt, onChange: v => { setC(v); S.refresh(); } }));
        S.readouts.push(readout(gr, () => '\\color{' + col + '}{L_' + k + ':\\ y = ' + linTex(F(getM()), F(getC())) + '}'));
        S.readouts.push(readout(gr, () => '\\color{' + col + '}{' + generalFromMC(F(getM()), F(getC())) + '}'));
      };
      line(1, C1, () => m1, () => c1, v => { m1 = v; }, v => { c1 = v; });
      line(2, C2, () => m2, () => c2, v => { m2 = v; }, v => { c2 = v; });
      const ks = group(S.controls, 'Solutions');
      S.readouts.push(readout(ks, () => { const q = inter();
        if (!q) return F(c1).eq(F(c2)) ? '\\text{Same line — infinitely many}' : '\\text{Parallel — no solution}';
        return '\\text{One solution: }\\color{' + CA + '}{\\left(' + q.x.tex() + ',\\ ' + q.y.tex() + '\\right)}'; }));
      S.refresh();
      return S;
    },
    /* G9X U3 L3 — two linear cost models C = a + b·x (fee and rate on sliders), where they cross,
       and which is cheaper at a chosen x (slider). Model 1 blue, model 2 orange, answer yellow. */
    compare2(container, init) {
      const S = scaffold(container, init), g = S.g, w = init.window;
      container.classList.add('sys2');
      const [C1, C2, CA] = init.colors || [CURVE, '#FF862F', HANDLE], F = Frac.of;
      const N = init.names || ['P', 'Q'], v = w.xname || 'x', V = w.yname || 'C';
      let a1 = init.a1, b1 = init.b1, a2 = init.a2, b2 = init.b2, x0 = init.x;
      const dec = f => String(Math.round(+f * 100) / 100);
      const inter = () => { const A1 = F(a1), B1 = F(b1), A2 = F(a2), B2 = F(b2);
        if (B1.eq(B2)) return null; const x = A2.sub(A1).div(B1.sub(B2)); return { x, y: A1.add(B1.mul(x)) }; };
      const inWin = () => { const q = inter(); return !!q && +q.x > w.xmin && +q.x < w.xmax && +q.y > w.ymin && +q.y < w.ymax; };
      g.fn(x => a1 + b1 * x, { color: C1 });
      g.fn(x => a2 + b2 * x, { color: C2 });
      g.segment(() => ({ x: x0, y: 0 }), () => ({ x: x0, y: Math.max(a1 + b1 * x0, a2 + b2 * x0) }), { dashed: true });
      const I = g.point({ x: 0, y: 0 }, { visible: inWin, color: CA, name: 'crossing' });
      g.label(() => I.x, () => I.y, () => { const q = inter(); return '\\textcolor{' + CA + '}{\\left(' + q.x.tex() + ',\\,' + q.y.tex() + '\\right)}'; },
        { anchor: 'nw', visible: inWin });
      const dots = [g.point({ x: 0, y: 0 }, { color: C1, name: N[0] }), g.point({ x: 0, y: 0 }, { color: C2, name: N[1] })];
      const base = S.refresh;
      S.refresh = () => { const q = inter(); if (q) { I.x = +q.x; I.y = +q.y; }
        dots[0].x = x0; dots[0].y = a1 + b1 * x0; dots[1].x = x0; dots[1].y = a2 + b2 * x0; base(); };
      const fr = r => ({ min: r[0], max: r[1], step: r[2] });
      const model = (k, col, name, getA, getB, setA, setB) => {
        const gr = group(S.controls, '<span style="color:' + col + '">' + name + '</span>');
        S.sliders.push(slider(gr, Object.assign(fr(init.feeRange || [0, 100, 10]), { value: getA(), label: '\\textcolor{' + col + '}{a_' + k + '}', color: col, onChange: t => { setA(t); S.refresh(); } })));
        S.sliders.push(slider(gr, Object.assign(fr(init.rateRange || [0, 20, 1]), { value: getB(), label: '\\textcolor{' + col + '}{b_' + k + '}', color: col, onChange: t => { setB(t); S.refresh(); } })));
        S.readouts.push(readout(gr, () => '\\textcolor{' + col + '}{' + V + ' = ' + getA() + ' + ' + getB() + v + '}'));
      };
      model(1, C1, N[0], () => a1, () => b1, t => { a1 = t; }, t => { b1 = t; });
      model(2, C2, N[1], () => a2, () => b2, t => { a2 = t; }, t => { b2 = t; });
      const ks = group(S.controls, 'Compare');
      S.readouts.push(readout(ks, () => { const q = inter();
        if (!q) return a1 === a2 ? '\\text{Same model — always equal}' : '\\text{Never equal — ' + (a1 < a2 ? N[0] : N[1]) + ' is always cheaper}';
        if (+q.x <= 0) return '\\text{They cross at } ' + v + ' \\le 0 \\text{: ' + (b1 < b2 ? N[0] : N[1]) + ' is always cheaper}';
        return '\\text{Same cost at } ' + v + ' = \\textcolor{' + CA + '}{' + q.x.tex() + '}\\text{, } ' + V + ' = \\textcolor{' + CA + '}{' + q.y.tex() + '}'; }));
      S.sliders.push(slider(ks, { min: w.xtickFrom ?? Math.max(0, w.xmin), max: w.xmax, step: init.xStep || 0.5, value: x0, label: v, color: INK, format: t => dec(t), onChange: t => { x0 = t; S.refresh(); } }));
      S.readouts.push(readout(ks, () => { const c1 = F(a1).add(F(b1).mul(F(x0))), c2 = F(a2).add(F(b2).mul(F(x0)));
        const who = c1.eq(c2) ? '\\text{same cost}' : '\\text{' + ((+c1 < +c2) ? N[0] : N[1]) + ' cheaper}';
        return v + ' = ' + dec(x0) + ':\\ \\textcolor{' + C1 + '}{' + dec(c1) + '}\\ \\text{vs}\\ \\textcolor{' + C2 + '}{' + dec(c2) + '}\\ \\text{— }' + who; }));
      S.refresh();
      return S;
    },
    /* Y1 L20 — y = a/(x − h) + k from integer sliders a, h, k: the curve (two live branches), its
       asymptotes x = h (colour of h) and y = k (colour of k), one point per branch (labelled on the side
       away from the curve: outside the corner the branch turns), the images of
       (1, 1) and (−1, −1). Toggle: y = 1/x shown dashed for comparison, with the point check.
       init: window, a, h, k, aRange/hRange/kRange [min, max] (default [−4, 4]), mode. */
    reciprocalAHK(container, init) {
      const S = scaffold(container, init), g = S.g, w = init.window, T = init.t2c || {};
      const CH = T.h || '#FC6255', CK = T.k || '#58C4DD', ON = 'with y = 1/x', OFF = 'curve only';
      let a = init.a, h = init.h, k = init.k, mode = init.mode || OFF;
      const span = Math.max(w.xmax - w.xmin, w.ymax - w.ymin), eps = (w.xmax - w.xmin) / 2000;
      const clampY = y => Math.max(w.ymin - span, Math.min(w.ymax + span, y));
      /* branch from xFar to xNear (next to the asymptote), sampled densely near xNear */
      const branch = (xFar, xNear, f) => { const ps = [], n = 240; for (let i = 0; i <= n; i++) { const t = i / n, x = xFar + (xNear - xFar) * (1 - Math.pow(1 - t, 4)); ps.push([x, clampY(f(x))]); } return ps; };
      const F = x => a / (x - h) + k;
      const base = () => mode === ON;
      g.path(() => branch(w.xmin, -eps * 4, x => 1 / x), { dashed: true, visible: base });
      g.path(() => branch(w.xmax, eps * 4, x => 1 / x), { dashed: true, visible: base });
      g.segment(() => ({ x: h, y: w.ymin }), () => ({ x: h, y: w.ymax }), { dashed: true, color: CH, visible: () => a !== 0 });
      g.segment(() => ({ x: w.xmin, y: k }), () => ({ x: w.xmax, y: k }), { dashed: true, color: CK });
      g.path(() => (a === 0 ? [[w.xmin, k], [w.xmax, k]] : branch(w.xmin, h - eps * 4, F)));
      g.path(() => branch(w.xmax, h + eps * 4, F), { visible: () => a !== 0 });
      const inWin = (x, y) => x > w.xmin + 0.5 && x < w.xmax - 0.5 && y > w.ymin + 0.5 && y < w.ymax - 0.5;
      const P1 = g.point({ x: 0, y: 0 }, { name: 'right branch', visible: () => a !== 0 && inWin(h + 1, k + a) });
      const P2 = g.point({ x: 0, y: 0 }, { name: 'left branch', visible: () => a !== 0 && inWin(h - 1, k - a) });
      const co = (x, y) => '(' + x + ',\\,' + y + ')';
      g.label(() => P1.x, () => P1.y, () => co(h + 1, k + a), { anchor: () => (a > 0 ? 'ne' : 'se'), visible: () => a !== 0 && inWin(h + 1, k + a) });
      g.label(() => P2.x, () => P2.y, () => co(h - 1, k - a), { anchor: () => (a > 0 ? 'sw' : 'nw'), visible: () => a !== 0 && inWin(h - 1, k - a) });
      g.label(() => h, () => w.ymax - 0.8, () => '\\textcolor{' + CH + '}{x = ' + h + '}', { anchor: 'e', visible: () => a !== 0 });
      g.label(() => w.xmin + 1.2, () => k, () => '\\textcolor{' + CK + '}{y = ' + k + '}', { anchor: 'n' });
      const baseRefresh = S.refresh;
      S.refresh = () => { P1.x = h + 1; P1.y = k + a; P2.x = h - 1; P2.y = k - a; baseRefresh(); };
      /* y = a/(x − h) + k written as it is read: x + 3 for h = −3, − 2 for k = −2 */
      const eqTex = () => {
        if (a === 0) return 'y = ' + k;
        const den = h === 0 ? 'x' : 'x ' + (h > 0 ? '- ' + h : '+ ' + (-h));
        const fr = (a < 0 ? '-' : '') + '\\dfrac{' + Math.abs(a) + '}{' + den + '}';
        return 'y = ' + fr + (k === 0 ? '' : k > 0 ? ' + ' + k : ' - ' + (-k)); };
      const rng = (r, d) => ({ min: (r || d)[0], max: (r || d)[1], step: 1 });
      const cg = group(S.controls, 'The curve');
      S.sliders.push(slider(cg, Object.assign(rng(init.aRange, [-4, 4]), { value: a, label: 'a', onChange: v => { a = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.hRange, [-4, 4]), { value: h, label: '\\textcolor{' + CH + '}{h}', color: CH, onChange: v => { h = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.kRange, [-4, 4]), { value: k, label: '\\textcolor{' + CK + '}{k}', color: CK, onChange: v => { k = v; S.refresh(); } })));
      S.readouts.push(readout(cg, eqTex));
      const tg = group(S.controls, 'Read off the curve');
      const stretchTex = () => Math.abs(a) === 1 ? (a < 0 ? '\\text{reflection in } x\\text{-axis}' : '')
        : '\\text{stretch } ' + Math.abs(a) + (a < 0 ? '\\text{, reflection}' : '');
      const moveTex = () => (h === 0 && k === 0) ? '' : '\\text{translation } \\left(\\begin{smallmatrix} ' + h + ' \\\\ ' + k + ' \\end{smallmatrix}\\right)';
      S.readouts.push(readout(tg, () => { if (a === 0) return '\\text{Not a reciprocal curve: } a = 0';
        const p = [stretchTex(), moveTex()].filter(Boolean); return p.length ? p.join(',\\ ') : '\\text{the curve } y = \\tfrac{1}{x} \\text{ itself}'; }));
      const ag = tg;
      S.readouts.push(readout(ag, () => a === 0 ? '\\text{—}' : '\\textcolor{' + CH + '}{x = ' + h + '},\\quad \\textcolor{' + CK + '}{y = ' + k + '}'));
      S.readouts.push(readout(ag, () => a === 0 ? '\\text{—}' : 'x \\neq ' + h + ',\\quad y \\neq ' + k));
      S.toggles.push(toggle(ag, { options: [OFF, ON], value: mode, onChange: v => { mode = v; S.refresh(); } }));
      S.readouts.push(readout(ag, () => !base() ? '\\text{Compare with } y = \\tfrac{1}{x}'
        : a === 0 ? '\\text{—}' : '(1,\\,1) \\mapsto ' + co(h + 1, k + a)));
      S.refresh();
      return S;
    },
    /* Y2 L20 — y = a sin(b(x + c)) + d: sliders a (step 0.5), b (step 0.5), c (multiples of π/12, slider on
       k = 12c/π), d (step 0.5). Draws y = sin x in the muted colour for reference, the dotted principal axis
       y = d, the curve, the start point (−c, d), the amplitude (dotted arrow from the axis to the first
       maximum after the start, or minimum if a < 0) and the period (v12: dotted arrow between two successive
       maxima, at their height, labelled x2 − x1 = period). Readouts: the equation; amplitude; period; principal axis; maximum; minimum.
       init: window (x in radians; xticks recommended), a, b, k, d, aRange/bRange/kRange/dRange [min, max, step]. */
    sinusoidABCD(container, init) {
      /* v13: layout 'wide' (default) = graph full width on top (window.aspect 3 unless set), controls below */
      if ((init.layout || 'wide') === 'wide' && init.window && !init.window.aspect) init.window = Object.assign({}, init.window, { aspect: 3 });
      if (init.layout === 'square' && init.window) { init.window = Object.assign({}, init.window); delete init.window.aspect; }
      const S = scaffold(container, init), g = S.g, w = init.window;
      let a = init.a ?? 2, b = init.b ?? 2, k = init.k ?? 2, d = init.d ?? 1;
      const W = trigKit(g, w);
      const C = () => k * Math.PI / 12, P = () => 2 * Math.PI / b, F = x => a * Math.sin(b * (x + C())) + d;
      g.path(() => W.samp(Math.sin), { color: MUTED });
      g.segment(() => ({ x: w.xmin, y: d }), () => ({ x: w.xmax, y: d }), { dotted: true });
      g.path(() => W.samp(F));
      const xm = () => { let x = -C() + P() / 4; while (x > w.xmax - 0.4) x -= P(); return x; };
      const ampOn = () => a !== 0 && xm() > w.xmin + 0.3;
      g.segment(() => ({ x: xm(), y: d }), () => ({ x: xm(), y: d + a }), { dotted: true, arrows: true, visible: ampOn });
      /* period measured between two successive maxima (teacher, 23/10/2026): x1 = the first maximum from
         x = −c (−c + π/(2b), or −c + 3π/(2b) if a < 0), moved back by whole periods while x1 + period
         leaves the window; dotted arrow at the maxima's height, its label computes x2 − x1 */
      const PF = () => new Frac(2).div(Frac.of(b));
      const M1F = () => { let f = new Frac(-k, 12).add(new Frac(a < 0 ? 3 : 1, 2).div(Frac.of(b)));
        while (f.add(PF()) * Math.PI > w.xmax - 0.05 && f * Math.PI > w.xmin + 0.05) f = f.sub(PF()); return f; };
      const M2F = () => M1F().add(PF()), yM = () => d + Math.abs(a);
      const perOn = () => a !== 0 && M1F() * Math.PI >= w.xmin + 0.05 && M2F() * Math.PI <= w.xmax - 0.05;
      const M1 = g.point({ x: 0, y: 0 }, { visible: perOn }), M2 = g.point({ x: 0, y: 0 }, { visible: perOn });
      g.segment(() => ({ x: M1F() * Math.PI, y: yM() }), () => ({ x: M2F() * Math.PI, y: yM() }), { dotted: true, arrows: true, visible: perOn });
      const negP = F => (F.n < 0 ? '\\left(' + W.piTex(F) + '\\right)' : W.piTex(F));
      /* label above the arrow (the curve never rises above it); with no room under the top of the window, under
         the curve's band instead */
      const lUp = () => yM() + 0.9 < w.ymax;
      g.label(() => (M1F() + M2F()) * Math.PI / 2, () => (lUp() ? yM() : d - Math.abs(a) - 0.3), () => W.piTex(M2F()) + ' - ' + negP(M1F()) + ' = ' + W.piTex(PF()),
        { anchor: () => (lUp() ? 'n' : 's'), visible: perOn });
      /* the start point (−c, d), its coordinates beside it; on a steep curve (|a|b > 4.5) a label beside the point
         collides with the curve, so it moves under the curve's band, clear of it */
      const St = g.point({ x: 0, y: 0 }, { color: HANDLE });
      const stBeside = () => Math.abs(a) * b <= 4.5 && !(w.aspect && window.matchMedia && matchMedia('(orientation: portrait)').matches);   /* a wide graph on a phone is too dense */
      const yBand = () => { const y = d - Math.abs(a) - 0.7; return y > w.ymin + 0.6 ? y : d + Math.abs(a) + 0.7; };
      g.label(() => -C(), () => (stBeside() ? d : yBand()), () => '\\left(' + W.piTex(new Frac(-k, 12)) + ',\\,' + W.dec(d) + '\\right)',
        { anchor: () => (stBeside() ? 'nw' : 'w') });
      const baseRefresh = S.refresh;
      S.refresh = () => { St.x = -C(); St.y = d; M1.x = M1F() * Math.PI; M2.x = M2F() * Math.PI; M1.y = M2.y = yM(); baseRefresh(); };
      const eqTex = () => (a === 0 ? 'y = ' + W.dec(d) : 'y = ' + W.coef(a) + W.argTex('\\sin', b, k) + W.plus(d));
      /* v13 guard (teacher, 23/10/2026): for every b and c a slider can reach, two successive maxima must lie in
         the window, or the period arrow vanishes — the lab says so in the console (the checker fails on it) */
      { const [b0, b1, bs] = init.bRange || [0.5, 3, 0.5], [k0, k1, ks] = init.kRange || [-12, 12, 1], bad = [];
        const a0 = a, bI = b, kI = k;
        for (let bb = b0; bb <= b1 + 1e-9; bb += bs) for (let kk = k0; kk <= k1 + 1e-9; kk += ks) for (const sg of [1, -1]) {
          a = sg; b = bb; k = kk; if (!perOn() && !bad.includes(bb)) bad.push(bb); }
        a = a0; b = bI; k = kI;
        if (bad.length) console.error(`sinusoidABCD: fewer than two maxima in the window for b = ${bad.join(', ')} - narrow bRange or widen the window`); }
      const cg = group(S.controls, 'The wave');
      const rng = (r, dflt) => { const q = r || dflt; return { min: q[0], max: q[1], step: q[2] }; };
      S.sliders.push(slider(cg, Object.assign(rng(init.aRange, [-3, 3, 0.5]), { value: a, label: 'a', format: W.dec, onChange: v => { a = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.bRange, [0.5, 3, 0.5]), { value: b, label: 'b', format: W.dec, onChange: v => { b = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.kRange, [-12, 12, 1]), { value: k, label: 'c', format: v => W.piTex(new Frac(v, 12)), onChange: v => { k = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.dRange, [-2, 2, 0.5]), { value: d, label: 'd', format: W.dec, onChange: v => { d = v; S.refresh(); } })));
      S.readouts.push(readout(cg, eqTex));
      const rg = group(S.controls, 'Read off the graph');
      S.readouts.push(readout(rg, () => a === 0 ? '\\text{Not a wave: } a = 0' : '\\text{amplitude } |a| = ' + W.dec(Math.abs(a))));
      S.readouts.push(readout(rg, () => '\\text{period } \\tfrac{2\\pi}{b} = ' + W.piTex(new Frac(2).div(Frac.of(b)))));
      S.readouts.push(readout(rg, () => '\\text{principal axis } y = ' + W.dec(d)));
      S.readouts.push(readout(rg, () => '\\text{maximum } d + |a| = ' + W.dec(d + Math.abs(a))));
      S.readouts.push(readout(rg, () => '\\text{minimum } d - |a| = ' + W.dec(d - Math.abs(a))));
      S.refresh();
      return S;
    },
    /* Y2 L20 — y = a tan(b(x + c)) + d: the same four sliders. Branches drawn one by one between consecutive
       asymptotes (never joined), asymptotes x = −c + π/(2b) + kπ/b dashed red, centres (−c + kπ/b, d) as points,
       the dotted line y = d. Readouts: the equation; period π/b; two asymptotes; the centre (−c, d); what a does
       (no amplitude). init as sinusoidABCD (defaults a 1, b 1, k 0, d 0). */
    tanABCD(container, init) {
      const S = scaffold(container, init), g = S.g, w = init.window, T = init.t2c || {};
      let a = init.a ?? 1, b = init.b ?? 1, k = init.k ?? 0, d = init.d ?? 0;
      const W = trigKit(g, w), RED = init.asymptoteColor || T.asym || '#FC6255', NB = 16;
      const span = Math.max(w.xmax - w.xmin, w.ymax - w.ymin);
      const C = () => k * Math.PI / 12, P = () => Math.PI / b;
      const j0 = () => Math.floor((w.xmin + C()) / P() - 0.5) - 1;          /* first asymptote index left of the window */
      const asym = i => -C() + P() / 2 + (j0() + i) * P();
      const inX = x => x > w.xmin + 1e-6 && x < w.xmax - 1e-6;
      const cps = [];
      for (let i = 0; i < NB; i++) {
        g.path(() => { const L = asym(i), m = L + P() / 2, um = Math.atan(2 * span / Math.max(Math.abs(a), 0.01)), ps = [];
          for (let q = 0; q <= 160; q++) { const u = -um + 2 * um * q / 160; ps.push([m + u / b, a * Math.tan(u) + d]); }
          return a === 0 ? [[L, d], [L + P(), d]] : ps; }, { visible: () => asym(i) < w.xmax && asym(i) + P() > w.xmin });
        g.segment(() => ({ x: asym(i), y: w.ymin }), () => ({ x: asym(i), y: w.ymax }), { dashed: true, color: RED, visible: () => a !== 0 && inX(asym(i)) });
        cps.push(g.point({ x: 0, y: 0 }, { visible: () => a !== 0 && asym(i) + P() / 2 > w.xmin + 0.2 && asym(i) + P() / 2 < w.xmax - 0.2 && Math.abs(asym(i) + P() / 2 + C()) > 1e-6 }));
      }
      g.segment(() => ({ x: w.xmin, y: d }), () => ({ x: w.xmax, y: d }), { dotted: true });
      const cen = g.point({ x: 0, y: 0 }, { color: HANDLE });   /* the centre (−c, d); its coordinates are in the readout */
      const baseRefresh = S.refresh;
      S.refresh = () => { cen.x = -C(); cen.y = d; cps.forEach((h, i) => { h.x = asym(i) + P() / 2; h.y = d; }); baseRefresh(); };
      const eqTex = () => (a === 0 ? 'y = ' + W.dec(d) : 'y = ' + W.coef(a) + W.argTex('\\tan', b, k) + W.plus(d));
      const cg = group(S.controls, 'The curve');
      const rng = (r, dflt) => { const q = r || dflt; return { min: q[0], max: q[1], step: q[2] }; };
      S.sliders.push(slider(cg, Object.assign(rng(init.aRange, [-3, 3, 0.5]), { value: a, label: 'a', format: W.dec, onChange: v => { a = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.bRange, [0.5, 3, 0.5]), { value: b, label: 'b', format: W.dec, onChange: v => { b = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.kRange, [-12, 12, 1]), { value: k, label: 'c', format: v => W.piTex(new Frac(v, 12)), onChange: v => { k = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.dRange, [-2, 2, 0.5]), { value: d, label: 'd', format: W.dec, onChange: v => { d = v; S.refresh(); } })));
      S.readouts.push(readout(cg, eqTex));
      const rg = group(S.controls, 'Read off the graph');
      const Pf = () => new Frac(1).div(Frac.of(b)), Cf = () => new Frac(-k, 12);
      const firstA = () => { let A = Cf().add(Pf().div(2)); while (+A < 0) A = A.add(Pf()); while (+A.sub(Pf()) >= 0) A = A.sub(Pf()); return A; };
      S.readouts.push(readout(rg, () => '\\text{period } \\tfrac{\\pi}{b} = ' + W.piTex(Pf())));
      S.readouts.push(readout(rg, () => a === 0 ? '\\text{—}' : '\\text{asymptotes } x = ' + W.piTex(firstA()) + ',\\ ' + W.piTex(firstA().add(Pf())) + ',\\ \\dots'));
      S.readouts.push(readout(rg, () => '\\text{centre } \\left(' + W.piTex(Cf()) + ',\\,' + W.dec(d) + '\\right)'));
      S.readouts.push(readout(rg, () => a === 0 ? '\\text{Not a tangent curve: } a = 0'
        : (a < 0 ? '\\text{reflection, ' : '\\text{') + (Math.abs(a) === 1 ? 'no stretch' : 'vertical stretch ' + W.dec(Math.abs(a))) + ' — no amplitude}'));
      S.refresh();
      return S;
    }
    ,
    /* v15 (Y2 L21, 23/10/2026) — a model from the story, and the time above a level. H(t) = a sin(b(t − c)) + d built
       from five sliders as the question states them: highest, lowest, period, time of a maximum, level k. Wide layout
       (window.aspect 3 unless set). Draws the curve, the dotted principal axis, the start of a cycle (c, d) in the
       answer colour, the period as a dotted arrow between two successive maxima labelled t2 − t1 = period (no
       drop-line), the line H = k in init.levelColor (default orange #FF862F), the time above k shaded in every cycle,
       the two crossings of each cycle, and a dotted measuring arrow just under the level in each full window, the first one labelled with its length.
       Readouts: d, a, b, c each with its substitution; the equation; the two crossings of the first full window
       (calculator values, three decimals and "…"); the time above k per cycle (3 s.f.), "never above" / "always
       above" outside the range. Logs a console error when some period in pRange leaves fewer than two maxima.
       init: window (t from 0; xname/yname), max, min, P, tmax, k, unit ('min'), maxRange/minRange/pRange/tRange/
       kRange as [min, max, step] (keep maxRange above minRange), levelColor. */
    sinusoidStory(container, init) {
      if (init.window && !init.window.aspect) init.window = Object.assign({}, init.window, { aspect: 3 });
      const S = scaffold(container, init), g = S.g, w = init.window, LEV = init.levelColor || '#FF862F';
      let mx = init.max ?? 68, mn = init.min ?? 4, P = init.P ?? 20, tm = init.tmax ?? 10, k = init.k ?? 60;
      const unit = init.unit || 'min', YN = w.yname || 'H';   /* v16: the model's letter (T for a temperature) */
      const W = trigKit(g, w);
      const d = () => (mx + mn) / 2, a = () => (mx - mn) / 2, b = () => 2 * Math.PI / P, c = () => tm - P / 4;
      const H = t => a() * Math.sin(b() * (t - c())) + d();
      const samp = (t0, t1) => { const ps = [], N = Math.max(8, Math.ceil(240 * (t1 - t0) / (w.xmax - w.xmin))); for (let i = 0; i <= N; i++) { const t = t0 + (t1 - t0) * i / N; ps.push([t, H(t)]); } return ps; };
      const s = () => (k - d()) / a(), inside = () => Math.abs(s()) < 1, as = () => Math.asin(Math.max(-1, Math.min(1, s())));   /* clamped: no NaN when k leaves the range */
      const up = n => c() + P * as() / (2 * Math.PI) + n * P, down = n => c() + P / 2 - P * as() / (2 * Math.PI) + n * P;
      const n0 = () => Math.floor((w.xmin - c()) / P) - 1, NW = 8;
      const win = i => { const n = n0() + i; return [up(n), down(n)]; };
      const full = i => { const [t1, t2] = win(i); return inside() && t1 >= w.xmin && t2 <= w.xmax; };
      const part = i => { const [t1, t2] = win(i); return inside() && t2 > w.xmin && t1 < w.xmax; };
      const ybar = () => Math.max(Math.max(w.ymin, 0) + 0.05 * (w.ymax - w.ymin), k - 0.17 * (w.ymax - w.ymin));
      const ybase = Math.max(w.ymin, 0), valAnchor = () => (ybar() - ybase < 0.14 * (w.ymax - w.ymin) ? 'n' : 's');   /* v18: near the t-axis the value goes above its arrow */   /* v18: the value under the arrow stays clear of the t-axis */   /* v17 (teacher): lower, below the level, the value above it between the two verticals */   /* just under the level, where the curve is above it */   /* under the tick numbers */
      /* shading, then the curve over it */
      for (let i = 0; i < NW; i++) g.polygon(() => { let [t1, t2] = win(i); t1 = Math.max(t1, w.xmin); t2 = Math.min(t2, w.xmax);
        if (t2 <= t1) return [{ x: w.xmin, y: k }, { x: w.xmin, y: k }, { x: w.xmin, y: k }];
        return [{ x: t1, y: k }].concat(samp(t1, t2).map(([x, y]) => ({ x, y }))).concat([{ x: t2, y: k }]); }, { visible: () => part(i) });
      g.segment(() => ({ x: w.xmin, y: d() }), () => ({ x: w.xmax, y: d() }), { dotted: true });
      g.path(() => samp(w.xmin, w.xmax));
      g.segment(() => ({ x: w.xmin, y: k }), () => ({ x: w.xmax, y: k }), { color: LEV });
      g.label(() => w.xmax - (k - ybase < 0.12 * (w.ymax - w.ymin) ? 0.07 : 0.02) * (w.xmax - w.xmin), () => k,   /* v20: a level near the t-axis keeps its label clear of the axis name */ () => '\\textcolor{' + LEV + '}{' + YN + ' = ' + W.dec(k) + '}', { anchor: 'n<', visible: () => k > w.ymin && k < w.ymax });
      const X1 = [], X2 = [];
      for (let i = 0; i < NW; i++) {
        X1.push(g.point({ x: 0, y: 0 }, { visible: () => part(i) && win(i)[0] >= w.xmin }));
        X2.push(g.point({ x: 0, y: 0 }, { visible: () => part(i) && win(i)[1] <= w.xmax }));
        g.segment(() => ({ x: win(i)[0], y: ybar() }), () => ({ x: win(i)[1], y: ybar() }), { color: INK, arrows: true, visible: () => full(i) });   /* v17: solid */
        /* v17 (teacher): two solid verticals through the crossings frame the time above the level */
        g.segment(() => ({ x: win(i)[0], y: ybar() }), () => ({ x: win(i)[0], y: mx }), { color: INK, visible: () => full(i) });
        g.segment(() => ({ x: win(i)[1], y: ybar() }), () => ({ x: win(i)[1], y: mx }), { color: INK, visible: () => full(i) });
        g.label(() => (win(i)[0] + win(i)[1]) / 2, ybar, () => (win(i)[1] - win(i)[0]).toPrecision(3), { anchor: valAnchor, fixed: true, visible: () => full(i) }   /* v19 (teacher): the value under every window's arrow */);   /* v18 (teacher): always centred under the arrow */
      }
      const firstFull = () => { for (let i = 0; i < NW; i++) if (full(i)) return i; return -1; };
      /* period between two successive maxima, at their height */
      const M1x = () => { let x = tm; while (x - P >= w.xmin) x -= P; while (x < w.xmin) x += P; return x; };
      const perOn = () => M1x() + P <= w.xmax;
      const Mp1 = g.point({ x: 0, y: 0 }, { visible: perOn }), Mp2 = g.point({ x: 0, y: 0 }, { visible: perOn });
      const yP = () => mx;   /* v17: figure rule 1, the period arrow at the height of the maxima */
      const dP = () => 0.018 * (w.xmax - w.xmin);   /* v18: the arrowheads stop short of the two maximum dots */
      g.segment(() => ({ x: M1x() + dP(), y: yP() }), () => ({ x: M1x() + P - dP(), y: yP() }), { dotted: true, arrows: 'end', visible: perOn });   /* v18 (teacher): one arrowhead, into the second maximum */
      g.label(() => M1x() + P / 2, yP, () => W.dec(M1x() + P) + ' - ' + W.dec(M1x()) + ' = ' + W.dec(P), { anchor: 'n', visible: perOn });
      /* the start of a cycle: the curve crosses its principal axis going up */
      const c0 = () => { let x = c(); while (x - P >= w.xmin) x -= P; while (x < w.xmin) x += P; return x; };
      const St = g.point({ x: 0, y: 0 }, { color: HANDLE });
      const baseRefresh = S.refresh;
      S.refresh = () => { St.x = c0(); St.y = d(); Mp1.x = M1x(); Mp2.x = M1x() + P; Mp1.y = Mp2.y = mx;
        for (let i = 0; i < NW; i++) { const [t1, t2] = win(i); X1[i].x = t1; X2[i].x = t2; X1[i].y = X2[i].y = k; } baseRefresh(); };
      { const [p0, p1, ps] = init.pRange || [8, 20, 1], bad = [];
        for (let pp = p0; pp <= p1 + 1e-9; pp += ps) if (w.xmax - w.xmin < 2 * pp) bad.push(pp);
        if (bad.length) console.error(`sinusoidStory: fewer than two maxima in the window for period = ${bad.join(', ')} - narrow pRange or widen the window`); }
      const rng = (r, dflt) => { const q = r || dflt; return { min: q[0], max: q[1], step: q[2] }; };
      const cg = group(S.controls, 'The story');
      S.sliders.push(slider(cg, Object.assign(rng(init.maxRange, [40, 80, 2]), { value: mx, label: '\\max', format: W.dec, onChange: v => { mx = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.minRange, [0, 30, 2]), { value: mn, label: '\\min', format: W.dec, onChange: v => { mn = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.pRange, [8, 20, 1]), { value: P, label: 'P', format: W.dec, onChange: v => { P = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.tRange, [0, 20, 0.5]), { value: tm, label: 't_{\\max}', format: W.dec, onChange: v => { tm = v; S.refresh(); } })));
      S.sliders.push(slider(cg, Object.assign(rng(init.kRange, [0, 80, 2]), { value: k, label: '\\textcolor{' + LEV + '}{k}', color: LEV, format: W.dec, onChange: v => { k = v; S.refresh(); } })));
      /* v20 (teacher, round 5): nothing moves when a slider moves. b's numerator carries a zero-width strut as tall as a digit (\rule{0em}{0.644em}, no glyph) so π/11 and
         2π/23 are the same height (the \left( \right) round it then never resize); the panel shows 2π/P alone when
         it does not simplify. Fixed heights for the equation box and the readout rows live in the template (.lab.story). */
      const bF = () => new Frac(2).div(Frac.of(P)), bSimp = () => !(bF().n === 2 && bF().eq(new Frac(2, P)));
      const piD = F => (F.d === 1 ? (F.n === 1 ? '' : F.n) + '\\pi' : '\\dfrac{\\rule{0em}{0.644em}' + (F.n === 1 ? '' : F.n) + '\\pi}{' + F.d + '}');
      const bT = () => piD(bF());
      container.classList.add('story');
      const cT = () => W.dec(tm) + ' - \\dfrac{' + W.dec(P) + '}{4} = ' + W.dec(c());
      const eqT = () => { const cc = c(), arg = cc === 0 ? 't' : '(t ' + (cc > 0 ? '- ' + W.dec(cc) : '+ ' + W.dec(-cc)) + ')';
        return YN + '(t) = ' + W.dec(a()) + '\\sin\\left(' + bT() + arg + '\\right)' + W.plus(d()); };
      /* v18 (teacher): the live model above the graph, full width, larger than the body text */
      { const gEl = container.querySelector('.lab-graph'), box = document.createElement('div'); box.className = 'lab-eqbox';
        gEl.parentNode.insertBefore(box, gEl); S.readouts.push(readout(box, eqT)); }
      const rg = group(S.controls, 'From the story');
      S.readouts.push(readout(rg, () => 'd = \\dfrac{' + W.dec(mx) + ' + ' + W.dec(mn) + '}{2} = ' + W.dec(d())));
      S.readouts.push(readout(rg, () => 'a = \\dfrac{' + W.dec(mx) + ' - ' + W.dec(mn) + '}{2} = ' + W.dec(a())));
      S.readouts.push(readout(rg, () => 'b = \\dfrac{2\\pi}{' + W.dec(P) + '}' + (bSimp() ? ' = ' + bT() : '')));
      S.readouts.push(readout(rg, () => 'c = ' + cT()));
      const tr = v => (Math.floor(v * 1000 + 1e-9) / 1000).toFixed(3) + '\\ldots';
      /* the time above k in one cycle: later crossing minus earlier crossing, calculator values kept in full */
      S.readouts.push(readout(rg, () => { const K = '\\textcolor{' + LEV + '}{' + YN + ' > ' + W.dec(k) + '}';
        if (k >= mx) return K + '\\text{: never}';
        /* v16: at k = min the curve touches the level, so "> k always" is false; k <= min reads >= and never below */
        if (k <= mn) return '\\textcolor{' + LEV + '}{' + YN + ' \\ge ' + W.dec(k) + '}\\text{: always, never below}';
        const i = firstFull(), T = P / 2 - P * Math.asin(s()) / Math.PI;
        return K + '\\text{: }' + (i < 0 ? '' : tr(win(i)[1]) + ' - ' + tr(win(i)[0]) + ' = ') + T.toPrecision(3) + '\\text{ ' + unit + ' per cycle}'; }));
      S.readouts[S.readouts.length - 1].el.style.gridColumn = '1 / -1';
      S.readouts[S.readouts.length - 1].el.classList.add('ro-line');
      S.refresh();
      return S;
    }
  };

  window.Lab = { graph, figure, placeAll: el => el.querySelectorAll('.lab-graph').forEach(w => w.__g && w.__g.redraw()), slider, toggle, readout, fitReadout, Frac, linTex, generalTex, presets };
})();
