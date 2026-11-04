/* statkit.js — AP Statistics scenes and labs for the openers deck (v26, AP Stats Unit 3 closer, 4/11/2026).
     Lab.scenes.enose(api, state)        the E-Nose and one test of n people, each guess a tick or a cross
                                         state: {n, marks: '1101...' (1 = correct, 0 = wrong, '' = not yet), head, bare}
     Lab.presets.pHatLab(container, init) simulate a guessing machine: dots of p-hat pile up into the normal curve,
                                         an n slider narrows it; the tail beyond the observed p-hat is shaded
   Colours: graph strokes use the skyblue role hexes (the picker swaps them per theme); object colours stay natural. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const C = { blue: '#1C758A', pink: '#94424F', teal: '#49A88F', grey: '#55636F', handle: '#4230A8', indigo: '#3B5BDB', green: '#699C52' };
  const OK_C = '#2E9E5B', NO_C = '#D64541', BODY = '#8E9BA8';
  const KO = { throwOnError: false, strict: false, trust: true };
  const math = s => katex.renderToString(s, KO);
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fx = (v, dp) => (+v).toFixed(dp);

  /* ---------- numbers ---------- */
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  const upper = z => 0.5 * (1 - erf(z / Math.SQRT2));
  const pdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  /* one simulated test: n guesses, each right with probability p */
  function test(n, i, p, seed) { const r = mulberry(seed * 1000003 + n * 7919 + i * 104729 + 17); let s = '';
    for (let j = 0; j < n; j++) s += r() < p ? '1' : '0'; return s; }
  const count = s => { let k = 0; for (const ch of s) if (ch === '1') k++; return k; };

  /* ---------- scene: the E-Nose and the people it tested ---------- */
  function person(a, cx, cy, sc, fill) {
    a.el('circle', { cx, cy: cy - 22 * sc, r: 13 * sc, fill });
    a.el('path', { d: `M${cx - 22 * sc},${cy + 26 * sc} Q${cx - 22 * sc},${cy - 6 * sc} ${cx},${cy - 6 * sc} Q${cx + 22 * sc},${cy - 6 * sc} ${cx + 22 * sc},${cy + 26 * sc} Z`, fill });
  }
  function tick(a, x, y, s) { a.el('path', { d: `M${x - 11 * s},${y} L${x - 3 * s},${y + 9 * s} L${x + 13 * s},${y - 11 * s}`, fill: 'none', stroke: OK_C, 'stroke-width': 7 * s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); }
  function cross(a, x, y, s) { a.el('path', { d: `M${x - 10 * s},${y - 10 * s} L${x + 10 * s},${y + 10 * s} M${x + 10 * s},${y - 10 * s} L${x - 10 * s},${y + 10 * s}`, fill: 'none', stroke: NO_C, 'stroke-width': 7 * s, 'stroke-linecap': 'round' }); }
  function enose(a, s) {
    const n = s.n || 24, marks = s.marks || '';
    /* the machine */
    a.el('rect', { x: 140, y: 40, width: 320, height: 170, rx: 30, fill: '#DCE3EA', stroke: BODY, 'stroke-width': 6 });
    a.el('rect', { x: 180, y: 72, width: 240, height: 86, rx: 12, fill: '#1E2A36' });
    a.el('polyline', { points: '196,118 230,118 246,92 262,140 280,104 296,124 318,118 352,118 366,100 380,132 404,118', fill: 'none', stroke: '#45C8BA', 'stroke-width': 5, 'stroke-linejoin': 'round' });
    a.el('circle', { cx: 420, cy: 186, r: 8, fill: s.lit === false ? BODY : '#45C8BA' });
    a.el('path', { d: 'M270,210 L330,210 L318,250 L282,250 Z', fill: BODY });
    a.text(300, 292, 'E-Nose', 'sc-unit', 'c');
    /* the people tested: a person per guess (n up to 48), a small square per guess beyond that */
    const big = n <= 48, cols = n <= 24 ? 4 : big ? 6 : 12, rows = Math.ceil(n / cols);
    const x0 = 40, x1 = 560, y0 = 340, y1 = s.bare ? 960 : 845, cw = (x1 - x0) / cols, ch = (y1 - y0) / rows;
    for (let i = 0; i < n; i++) {
      const cx = x0 + cw * (i % cols + 0.5), cy = y0 + ch * (Math.floor(i / cols) + 0.5), m = marks[i];
      if (big) { const sc = Math.min(cw / 130, ch / 86) * 1.25;
        person(a, cx - 18 * sc, cy, sc, BODY);
        if (m === '1') tick(a, cx + 30 * sc, cy, sc); else if (m === '0') cross(a, cx + 30 * sc, cy, sc);
        else a.el('circle', { cx: cx + 30 * sc, cy, r: 7 * sc, fill: BODY, 'fill-opacity': 0.5 }); }
      else a.el('rect', { x: cx - cw * 0.36, y: cy - ch * 0.36, width: cw * 0.72, height: ch * 0.72, rx: 4,
        fill: m === '1' ? OK_C : m === '0' ? NO_C : BODY, 'fill-opacity': m ? 1 : 0.4 });
    }
    if (!s.bare) {
      const k = count(marks);
      a.text(300, 905, marks ? `$${k}$ of $${n}$ correct` : (s.head || `$${n}$ people`), 'sc-read', 'c');
      if (marks) a.text(300, 962, `$\\hat p = ${fx(k / n, 3)}$`, 'sc-read', 'c');
    }
  }
  window.Lab.scenes.enose = enose;

  /* ---------- lab: a guessing E-Nose, simulated ---------- */
  function pHatLab(container, init) {
    const p = init.p ?? 0.5, NMAX = init.sims || 200, seed = init.seed || 7, obs = init.obs ?? 17 / 24;
    const nR = init.nRange || [24, 240, 24];
    container.classList.add('lab', 'scenelab', 'phatlab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    let n = init.n || 24, k = NMAX, curveOn = true, tests = [], g = null, sr = null, refresh = () => {};
    const sig = () => Math.sqrt(p * (1 - p) / n);
    const xticks = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map(v => [v, String(v)]);
    /* one fixed graph; y is shown in display units (density / the window top for this n), so the axes never move
       when n changes: the curve keeps its height on screen and narrows (the y-axis carries no numbers) */
    const w = { xmin: 0.15, xmax: 0.85, ymin: -0.1, ymax: 1, gridx: 0.1, gridy: 10, xticks, yticks: [], xname: 'p̂', yname: ' ', labelMask: true };
    let D = null;
    function layout() {
      tests = []; for (let i = 0; i < NMAX; i++) tests.push(test(n, i, p, seed));
      const m = Math.max(1, Math.ceil(0.02 * n - 1e-9)), b = m / n, dh = 1 / (NMAX * b);
      const bins = {}, dots = tests.map(t => { const j = Math.round(count(t) / m); const h = bins[j] = (bins[j] || 0) + 1; return { x: j * m / n, y: (h - 0.5) * dh }; });
      const top = Math.max(1.2 * pdf(p, p, sig()), (Math.max(...Object.values(bins)) + 0.6) * dh), F = 1 / top;
      const r = 0.4 * Math.min(b / (w.xmax - w.xmin), dh * F / (w.ymax - w.ymin));
      D = { dots, F, rx: r * (w.xmax - w.xmin), ry: r * (w.ymax - w.ymin) };
    }
    layout();
    sr = Lab.sceneRow(left, w, 'enose', { alt: 'The E-Nose and the people in the latest simulated test, beside a dotplot of simulated sample proportions' });
    g = sr.g;
    g.polygon(() => { const out = [{ x: obs, y: 0 }]; for (let i = 0; i <= 60; i++) { const x = obs + (w.xmax - obs) * i / 60; out.push({ x, y: D.F * pdf(x, p, sig()) }); } out.push({ x: w.xmax, y: 0 }); return out; },
      { color: C.pink, opacity: 0.35, visible: () => curveOn });
    const RING = [...Array(16)].map((_, q) => q / 16 * 2 * Math.PI);
    for (let i = 0; i < NMAX; i++) g.polygon(() => { const d = D.dots[i]; return RING.map(a => ({ x: d.x + D.rx * Math.cos(a), y: d.y * D.F + D.ry * Math.sin(a) })); },
      { color: C.teal, opacity: 0.9, visible: () => i < k });
    g.fn(x => D.F * pdf(x, p, sig()), { color: C.blue, visible: () => curveOn });
    g.segment({ x: obs, y: 0 }, { x: obs, y: w.ymax }, { dashed: true, color: C.pink });
    g.label(obs - 0.004, 0.93 * w.ymax, `\\textcolor{${C.pink}}{\\hat p=${fx(obs, 3)}}`, { anchor: 'w', fixed: true });
    g.segment({ x: p, y: 0 }, { x: p, y: w.ymax }, { dotted: true, color: '#8B5A2B' });
    const grp = title => { const s = document.createElement('div'); s.className = 'lab-group';
      const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); right.appendChild(s); return s; };
    const gs = grp('Simulated tests of a guesser');
    let pl = null;
    const slK = Lab.slider(gs, { min: 0, max: NMAX, step: 1, value: k, label: '\\text{tests}', format: v => String(v),
      onChange: x => { k = x; refresh(); } });
    ['pointerdown', 'keydown'].forEach(ev => slK.input.addEventListener(ev, () => pl && pl.stop()));
    let auto = false;
    pl = Lab.player(gs, { min: 0, max: NMAX, seconds: init.seconds || 9, get: () => k,
      set: x => { k = Math.round(x); slK.input.value = k; const out = slK.input.parentNode.querySelector('output'); if (out) out.innerHTML = math(String(k));
        if (auto && k >= NMAX) { auto = false; setCurve(true); } refresh(); } });
    const rCount = Lab.readout(gs, () => { if (!k) return '\\text{no tests yet}'; const c = tests.slice(0, k).filter(t => count(t) / n >= obs - 1e-9).length;
      return `\\hat p\\ge ${fx(obs, 3)}:\\ ${c}\\text{ of }${k}\\approx ${fx(100 * c / k, 1)}\\%`; });
    const gm = grp('Sample size and normal model');
    Lab.slider(gm, { min: nR[0], max: nR[1], step: nR[2], value: n, label: 'n', format: v => String(v),
      onChange: x => { if (pl) pl.stop(); n = x; layout(); refresh(); } });
    const tg = Lab.toggle(gm, { options: ['Hide curve', 'Show curve'], value: 'Show curve', onChange: o => { curveOn = o === 'Show curve'; refresh(); } });
    const setCurve = on => { const b = gm.querySelector(`[data-opt="${on ? 'Show curve' : 'Hide curve'}"]`); if (b) b.click(); };
    const rTail = Lab.readout(gm, () => { const sg = `\\sigma_{\\hat p}=${fx(sig(), 3)}`; if (!curveOn) return sg + ',\\ \\text{curve hidden}';
      const z = (obs - p) / sig(), P = upper(z);
      return `${sg},\\ z=${fx(z, 2)},\\ P(\\hat p\\ge ${fx(obs, 3)})${P < 0.0005 ? '\\approx 0' : '=' + fx(P, 3)}`; });
    const readouts = [rCount, rTail];
    refresh = function () { g.redraw(); sr.draw({ n, marks: k ? tests[k - 1] : '', head: `$${n}$ people` }); readouts.forEach(r => r.update()); };
    refresh();
    const state = { g, controls: right, readouts, refresh,
      enter(byNext) { pl.stop(); if (byNext && init.auto !== false && !reduced()) { auto = true; setCurve(false); pl.play(true); } },
      leave() { pl.stop(); auto = false; } };
    container.__lab = state;
    return state;
  }
  window.Lab.presets.pHatLab = pHatLab;
})();
