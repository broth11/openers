/* scenekit.js — context scenes for the deck (experiment, 29/10/2026, MAI HL U5 L3).
   Ported from the openers' context stage: a drawn scene beside the graph, sharing the graph's vertical scale,
   redrawn from a state. Example slides draw the scene frozen at each reveal; labs drive it from a slider
   with Play and Loop (autoplay once on arrival by Next).
     Lab.sceneRow(el, window, kind, opts)  -> {row, g, draw(state)}   (g = the Lab.graph beside the scene)
     Lab.scenes.<kind>(api, state)          api: {el(tag, attrs), W, H, Y(v), text(x, y, html, cls, anchor)}
     Lab.presets.coffeeScene(container, init)   live cooling-coffee lab
     Lab.presets.growthFamily(container, init)  recap explorer with fixed-height cards
   Colours: object colours stay natural (cup, wood, mercury); text, tubes and ticks use the theme's CSS
   variables (--title, --note, --bl, --sc-curve, --sc-red), so the picker recolours them. Graph strokes use the
   skyblue role hexes, which the picker swaps per theme. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CURVE_C = '#1C758A', RED_C = '#CF5044', HANDLE_C = '#4230A8';
  const KO = { throwOnError: false, strict: false, trust: true };
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag);
    for (const k in attrs) { if (k === 'style') e.setAttribute('style', attrs[k]); else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e); return e; };
  const math = s => katex.renderToString(s, KO);
  const prose = s => String(s).replace(/\$([^$]+)\$/g, (_, m) => math(m));
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const num = (v, dp) => { const r = +(+v).toFixed(dp); return (Object.is(r, -0) ? 0 : r).toString(); };
  const fx = (v, dp) => (+v).toFixed(dp);

  /* ---------- the scene row: drawing on the left, graph on the right, one vertical scale ---------- */
  function sceneRow(el, win, kind, opts) {
    opts = opts || {};
    const W = 600, H = 1000;
    const row = document.createElement('div'); row.className = 'scene-row'; el.appendChild(row);
    const sc = document.createElement('div'); sc.className = 'scene'; row.appendChild(sc);
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', class: 'scene-svg', role: 'img', 'aria-label': opts.alt || kind }, sc);
    const labs = document.createElement('div'); labs.className = 'scene-labels'; sc.appendChild(labs);
    const gh = document.createElement('div'); gh.className = 'scene-graph'; row.appendChild(gh);
    const g = window.Lab.graph(gh, win);
    const Y = v => (win.ymax - v) / (win.ymax - win.ymin) * H;
    let grp = mk('g', {}, svg);
    function draw(state) {
      grp.remove(); grp = mk('g', {}, svg); labs.innerHTML = '';
      const api = { W, H, Y, win, el: (t, a, p) => mk(t, a, p || grp),
        text(x, y, html, cls, anchor) { const d = document.createElement('div'); d.className = 'scene-text ' + (cls || '');
          d.style.left = (x / W * 100) + '%'; d.style.top = (y / H * 100) + '%';
          d.style.transform = { w: 'translate(0,-50%)', e: 'translate(-100%,-50%)', c: 'translate(-50%,-50%)', nw: 'translate(0,0)', n: 'translate(-50%,0)', s: 'translate(-50%,-100%)', sw: 'translate(0,-100%)' }[anchor || 'w'];
          d.innerHTML = prose(html); labs.appendChild(d); return d; } };
      SCENES[kind](api, state || {});
    }
    return { row, g, draw };
  }

  /* ---------- drawings ---------- */
  const SCENES = {
    /* cooling coffee: cup on a table (steam fades as T falls), thermometer on the graph's T scale */
    coffee(a, s) {
      const T = s.T == null ? 92 : s.T, t = s.t || 0, top = s.top || 100;
      const base = a.Y(0), tall = a.Y(0) - a.Y(top), W = a.W;
      // table: a wood band under the cup, the surface line in the theme's ink
      a.el('rect', { x: 0, y: base + 10, width: W, height: 34, fill: '#B88A5A', rx: 4 });
      a.el('rect', { x: 0, y: base + 10, width: W, height: 8, fill: '#8A6440' });
      // cup
      const cw = Math.min(W * 0.46, tall * 0.36), ch = tall * 0.3, cx = W * 0.3, rimY = base - ch;
      a.el('ellipse', { cx, cy: base + 4, rx: cw * 0.74, ry: 12, fill: '#E3DDD2' });
      a.el('path', { d: `M ${cx + cw / 2 - 4} ${rimY + ch * 0.18} q ${cw * 0.32} 4 ${cw * 0.22} ${ch * 0.34} q ${-cw * 0.06} ${ch * 0.16} ${-cw * 0.32} ${ch * 0.2}`,
        fill: 'none', stroke: '#C9C2B6', 'stroke-width': 13, 'stroke-linecap': 'round' });
      a.el('path', { d: `M ${cx - cw / 2} ${rimY} L ${cx + cw / 2} ${rimY} L ${cx + cw * 0.36} ${base - 5} Q ${cx} ${base + 9} ${cx - cw * 0.36} ${base - 5} Z`,
        fill: '#F4F1EC', stroke: '#9AA8B4', 'stroke-width': 4 });
      a.el('ellipse', { cx, cy: rimY, rx: cw / 2, ry: 13, fill: '#6B3F24', stroke: '#9AA8B4', 'stroke-width': 4 });
      // steam: strongest when hot
      const steam = Math.max(0, Math.min(1, (T - 25) / 67));
      for (let i = 0; i < 3; i++) {
        const sx = cx - cw * 0.22 + i * cw * 0.22, sy = rimY - 22, hh = 40 + 110 * steam;
        a.el('path', { d: `M ${sx} ${sy} q -18 ${-hh * 0.3} 0 ${-hh * 0.5} q 18 ${-hh * 0.3} 0 ${-hh * 0.5}`, fill: 'none',
          class: 'sc-steam', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: (0.15 + 0.75 * steam).toFixed(3) });
      }
      // thermometer on the graph's scale: the mercury top sits level with T on the graph
      const tx = W * 0.7, tw = 30;
      a.el('rect', { x: tx, y: a.Y(top) - 6, width: tw, height: tall + 6, rx: tw / 2, fill: '#FFFFFF', stroke: '#9AA8B4', 'stroke-width': 4 });
      const mTop = a.Y(Math.max(0, Math.min(top, T)));
      a.el('rect', { x: tx + 8, y: mTop, width: tw - 16, height: base - mTop + 14, class: 'sc-merc' });
      a.el('circle', { cx: tx + tw / 2, cy: base + 22, r: 24, class: 'sc-merc', stroke: '#9AA8B4', 'stroke-width': 4 });
      for (let v = 0; v <= top; v += 20) {
        a.el('line', { x1: tx + tw + 4, x2: tx + tw + 22, y1: a.Y(v), y2: a.Y(v), class: 'sc-tick', 'stroke-width': 3 });
      }
      a.text(tx + tw / 2, a.Y(top) - 14, '$^{\\circ}\\mathrm{C}$', 'sc-unit', 's');
      a.text(14, 10, `$t=${fx(t, 1)}$ min`, 'sc-read', 'nw');
      a.text(14, 82, `$${fx(T, 1)}\\,{}^{\\circ}\\mathrm{C}$`, 'sc-read sc-T', 'nw');
    },
    /* typing: a laptop whose screen fills with lines as the speed grows, a wpm gauge on the graph's S scale */
    typing(a, s) {
      const S = s.S == null ? 20 : s.S, h = s.h == null ? 1 : s.h, top = s.top || 70;
      const base = a.Y(0), tall = a.Y(0) - a.Y(top), W = a.W;
      a.el('rect', { x: 0, y: base + 10, width: W, height: 34, fill: '#B88A5A', rx: 4 });
      a.el('rect', { x: 0, y: base + 10, width: W, height: 8, fill: '#8A6440' });
      const lx = W * 0.06, lw = W * 0.56, scrH = tall * 0.42, scrY = base - scrH - 30;
      a.el('rect', { x: lx, y: scrY, width: lw, height: scrH, rx: 10, fill: '#FFFFFF', stroke: '#9AA8B4', 'stroke-width': 5 });
      const n = Math.max(0, Math.min(8, Math.round(S / 10))), lh = (scrH - 30) / 8;
      for (let i = 0; i < n; i++) {
        const fr = 0.45 + 0.5 * rnd(i, 7);
        a.el('rect', { x: lx + 16, y: scrY + 15 + i * lh, width: (lw - 32) * (i === n - 1 ? 0.5 : fr), height: lh * 0.48, rx: 4, fill: '#1C758A', opacity: 0.6 });
      }
      a.el('path', { d: `M ${lx - 14} ${base - 30} L ${lx + lw + 14} ${base - 30} L ${lx + lw - 6} ${base + 8} L ${lx + 6} ${base + 8} Z`, fill: '#D6DEE6', stroke: '#9AA8B4', 'stroke-width': 4 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 9; c++)
        a.el('rect', { x: lx + 18 + c * ((lw - 36) / 9), y: base - 24 + r * 14, width: (lw - 36) / 9 - 5, height: 8, rx: 2, fill: '#FFFFFF' });
      const gx = W * 0.74, gw = 30;
      a.el('rect', { x: gx, y: a.Y(top) - 6, width: gw, height: tall + 6, rx: 8, fill: '#FFFFFF', stroke: '#9AA8B4', 'stroke-width': 4 });
      const fTop = a.Y(Math.max(0, Math.min(top, S)));
      a.el('rect', { x: gx + 7, y: fTop, width: gw - 14, height: Math.max(0, base - fTop), fill: '#E8890C' });
      for (let v = 0; v <= top; v += 10)
        a.el('line', { x1: gx + gw + 4, x2: gx + gw + 22, y1: a.Y(v), y2: a.Y(v), class: 'sc-tick', 'stroke-width': 3 });
      a.text(gx + gw / 2, a.Y(top) - 14, 'wpm', 'sc-unit', 's');
      a.text(14, 10, `$h=${h < 10 ? fx(h, 1) : fx(h, 0)}$ h`, 'sc-read', 'nw');
      a.text(14, 82, `$${fx(S, 1)}$ wpm`, 'sc-read sc-S', 'nw');
    },
    /* pH: a coloured strip on the graph's pH scale, foods at their pH, a marker that follows the slider */
    ph(a, s) {
      const top = s.top || 8, W = a.W, foods = s.foods || PH_FOODS;
      const sx = W * 0.62, sw = 38, steps = 80;
      for (let i = 0; i < steps; i++) { const p0 = top * i / steps, p1 = top * (i + 1) / steps;
        a.el('rect', { x: sx, y: a.Y(p1), width: sw, height: a.Y(p0) - a.Y(p1) + 0.8, fill: phColor((p0 + p1) / 2) }); }
      a.el('rect', { x: sx, y: a.Y(top), width: sw, height: a.Y(0) - a.Y(top), fill: 'none', stroke: '#9AA8B4', 'stroke-width': 4, rx: 6 });
      for (let p = 0; p <= top; p++)
        a.el('line', { x1: sx + sw + 4, x2: sx + sw + 22, y1: a.Y(p), y2: a.Y(p), class: 'sc-tick', 'stroke-width': 3 });
      a.text(sx + sw / 2, a.Y(top) - 14, 'pH', 'sc-unit', 's');
      foods.forEach(f => { const fy = a.Y(f.pH);
        a.el('line', { x1: W * 0.2, x2: sx, y1: fy, y2: fy, stroke: f.color, 'stroke-width': 4, 'stroke-dasharray': '8 8' });
        a.el('circle', { cx: W * 0.12, cy: fy, r: 26, fill: f.color, stroke: '#FFFFFF', 'stroke-width': 5 });
        a.text(0, fy - 34, f.name, 'sc-food', 'sw'); });
      if (s.marker != null) { const my = a.Y(s.marker);
        a.el('path', { d: `M ${sx + sw + 6} ${my} l 26 -17 l 0 34 z`, class: 'sc-mark' }); }
    }
  };
  /* phone: a big phone silhouette that fills with adoption (0 to 100 on the graph's scale), an 80 % style cap line,
     and, when state.G is given, a gauge beside it for a model that can pass 100 (red above the phone's full line).
     state: {t, P (fills the phone, capped at 100), G (gauge), cap (number, dashed line), avail (bool), dp, Pn (name shown with P)} */
  SCENES.phone = function (a, s) {
    const dp = s.dp == null ? 0 : s.dp, W = a.W, base = a.Y(0), top100 = a.Y(100), ph = base - top100;
    const hasG = s.G != null, pw = Math.min(280, ph * 0.5), px = hasG ? 40 : (W - pw) / 2;
    const P = s.P == null ? 0 : s.P;
    a.el('rect', { x: px - 16, y: top100 - 40, width: pw + 32, height: ph + 40 + 36, rx: 34, fill: '#D6DEE6', stroke: '#9AA8B4', 'stroke-width': 5 });
    a.el('rect', { x: px, y: top100, width: pw, height: ph, fill: '#FFFFFF' });
    const fv = Math.max(0, Math.min(100, P)), fy = a.Y(fv);
    if (fv > 0) a.el('rect', { x: px, y: fy, width: pw, height: base - fy, style: s.Pn === 'E' ? 'fill:var(--sc-red);fill-opacity:.75' : `fill:${CURVE_C};fill-opacity:.85` });
    a.el('rect', { x: px, y: top100, width: pw, height: ph, fill: 'none', stroke: '#9AA8B4', 'stroke-width': 3 });
    a.el('rect', { x: px + pw / 2 - 34, y: top100 - 26, width: 68, height: 10, rx: 5, fill: '#9AA8B4' });
    a.el('rect', { x: px + pw / 2 - 36, y: base + 14, width: 72, height: 8, rx: 4, fill: '#9AA8B4' });
    if (s.cap != null) a.el('line', { x1: px - 16, x2: px + pw + 16, y1: a.Y(s.cap), y2: a.Y(s.cap), class: 'sc-tick', 'stroke-width': 4, 'stroke-dasharray': '14 10' });
    if (hasG) {
      const gx = 500, gw = 30, gTop = a.win.ymax - 6, g1 = Math.max(0, Math.min(100, s.G));
      a.el('rect', { x: gx, y: a.Y(gTop) - 6, width: gw, height: a.Y(0) - a.Y(gTop) + 6, rx: 8, fill: '#FFFFFF', stroke: '#9AA8B4', 'stroke-width': 4 });
      if (g1 > 0) a.el('rect', { x: gx + 7, y: a.Y(g1), width: gw - 14, height: base - a.Y(g1), style: 'fill:var(--sc-red);fill-opacity:.55' });
      if (s.G > 100) { const g2 = Math.min(s.G, gTop); a.el('rect', { x: gx + 7, y: a.Y(g2), width: gw - 14, height: a.Y(100) - a.Y(g2), style: 'fill:var(--sc-red)' }); }
      for (let v = 0; v <= gTop; v += 20) a.el('line', { x1: gx + gw + 4, x2: gx + gw + 22, y1: a.Y(v), y2: a.Y(v), class: 'sc-tick', 'stroke-width': 3 });
      a.el('line', { x1: px + pw + 16, x2: gx + gw + 22, y1: top100, y2: top100, class: 'sc-tick', 'stroke-width': 4, 'stroke-dasharray': '14 10' });
    }
    /* readouts: the name sits right-aligned and the "=" starts the value, so every equals sign shares one x */
    const XE = s.avail ? 236 : 66;
    const row = (y, lhs, rhs, cls) => { a.text(XE, y, `$${lhs}$`, 'sc-read ' + cls, 'e'); a.text(XE + 8, y, `$=${rhs}$`, 'sc-read ' + cls, 'w'); };
    let y = 52;
    if (s.t != null) { row(y, 't', `${fx(s.t, dp ? 1 : 0)}\\ \\text{years}`, ''); y += 92; }
    if (s.avail) { row(y, '\\text{adopted}', `${fx(P, dp)}\\%`, 'sc-S'); y += 92;
      row(y, '\\text{available}', `${fx(100 - P, dp)}\\%`, ''); return; }
    if (s.P != null) row(y, s.Pn || 'A', `${fx(P, dp)}\\%`, s.Pn === 'E' ? 'sc-T' : 'sc-S');
  };
  const PH_FOODS = [{ name: 'Lemon juice', pH: 2.0, color: '#E8C52E' }, { name: 'Tomato', pH: 4.4, color: '#D9432E' }, { name: 'Pure water', pH: 7.0, color: '#3A8FD0' }];
  function phColor(p) {
    const st = [[0, [214, 40, 40]], [2, [232, 112, 40]], [4, [245, 190, 46]], [6, [120, 190, 70]], [7, [70, 170, 120]], [8, [40, 120, 190]]];
    for (let i = 1; i < st.length; i++) if (p <= st[i][0]) { const [p0, c0] = st[i - 1], [p1, c1] = st[i], f = (p - p0) / (p1 - p0);
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(',')})`; }
    return 'rgb(40,120,190)';
  }
  function rnd(i, salt) { let x = (i + 1) * 374761393 + salt * 668265263; x = Math.imul(x ^ (x >>> 13), 1274126177); x = x ^ (x >>> 16); return (x >>> 0) / 4294967295; }

  /* ---------- shared lab controls: Play / Pause and Loop ---------- */
  function player(el, o) {
    const row = document.createElement('div'); row.className = 'lab-play';
    row.innerHTML = '<button type="button" class="lab-btn play" aria-label="Play">' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path class="i-play" d="M4 2.5v11l9-5.5z"/><path class="i-pause" d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg><span>Play</span></button>' +
      '<button type="button" class="lab-btn loop" aria-pressed="false" aria-label="Loop">' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 7.5a4.5 4.5 0 0 1 8.2-2.6M13 8.5a4.5 4.5 0 0 1-8.2 2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11.8 1.8l.2 3.6-3.5-.4zM4.2 14.2l-.2-3.6 3.5.4z"/></svg><span>Loop</span></button>';
    el.appendChild(row);
    const bPlay = row.querySelector('.play'), bLoop = row.querySelector('.loop');
    let raf = 0, playing = false, loop = false, last = 0, wait = 0, cur = o.min;
    const paint = () => { bPlay.classList.toggle('on', playing); bPlay.querySelector('span').textContent = playing ? 'Pause' : 'Play';
      bPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play'); bLoop.setAttribute('aria-pressed', loop); };
    function frame(now) {
      if (!playing) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (wait > 0) { wait -= dt; if (wait <= 0) { cur = o.min; o.set(cur); } raf = requestAnimationFrame(frame); return; }
      cur += (o.max - o.min) * dt / o.seconds;
      if (cur >= o.max) { cur = o.max; o.set(cur); if (loop) { wait = 0.7; raf = requestAnimationFrame(frame); return; } stop(); return; }
      o.set(cur); raf = requestAnimationFrame(frame);
    }
    function play(fromStart) { cur = o.get(); if (fromStart || cur >= o.max - 1e-9) { cur = o.min; o.set(cur); }
      playing = true; wait = 0; last = performance.now(); paint(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    function stop() { playing = false; cancelAnimationFrame(raf); paint(); }
    bPlay.addEventListener('click', e => { e.stopPropagation(); playing ? stop() : play(false); });
    bLoop.addEventListener('click', e => { e.stopPropagation(); loop = !loop; paint(); if (loop && !playing) play(false); });
    paint();
    return { play, stop, playing: () => playing };
  }

  /* ---------- labs: a scene driven by one slider (coffee, typing, pH) ---------- */
  const mm = p => 1000 * Math.pow(10, -p);
  const sci = v => { const e = Math.floor(Math.log10(v)); return `${fx(v / Math.pow(10, e), 2)}\\times 10^{${e}}`; };
  const SPEC = {
    coffee: { name: 't', min: 0, max: 30, step: 0.1, start: 0, dp: 1, play: true, auto: true, seconds: 12, alt: 'Cup of coffee and a thermometer beside the graph of T against t',
      group: 'Time in minutes', eq: 'T=70(0.9)^{t}+22', outTitle: 'Temperature',
      f: v => 70 * Math.pow(0.9, v) + 22, pt: (v, f) => ({ x: v, y: f(v) }),
      static(g, w) { g.segment({ x: w.xmin, y: 22 }, { x: w.xmax, y: 22 }, { dashed: true }); g.label(24, 22, 'y=22', { anchor: 's' });
        g.fn(this.f, { color: CURVE_C });
        g.point({ x: 0, y: 92 }); g.label(0, 92, '(0,\\,92)', { anchor: 'ne' }); g.point({ x: 2, y: 78.7 }); g.label(2, 78.7, '(2,\\,78.7)', { anchor: 'ne' }); },
      reads: [(v, f) => `T=70(0.9)^{${fx(v, 1)}}+22`, (v, f) => `T=${fx(f(v), 1)}\\,{}^{\\circ}\\mathrm{C}`],
      scene: (v, f) => ({ T: f(v), t: v }) },
    typing: { name: 'h', min: 1, max: 110, step: 0.5, start: 1, dp: 1, play: true, auto: true, seconds: 12, alt: 'A laptop and a words-per-minute gauge beside the graph of S against h',
      group: 'Hours of practice', eq: 'S=20+10\\ln h', outTitle: 'Speed',
      f: v => 20 + 10 * Math.log(v), pt: (v, f) => ({ x: v, y: f(v) }),
      static(g, w) { const pts = []; for (let i = 0; i <= 400; i++) { const x = 0.03 * Math.pow((w.xmax + 2) / 0.03, i / 400); pts.push([x, Math.max(w.ymin - 20, this.f(x))]); }
        g.path(pts, { color: CURVE_C });
        g.point({ x: 1, y: 20 }); g.label(1, 20, '(1,\\,20)', { anchor: 'se' }); g.point({ x: 10, y: 43.03 }); g.label(10, 43.03, '(10,\\,43.03)', { anchor: 'nw' }); },
      reads: [(v, f) => `S=20+10\\ln ${fx(v, 1)}`, (v, f) => `S=${fx(f(v), 1)}\\text{ wpm}`],
      scene: (v, f) => ({ S: f(v), h: v }) },
    ph: { name: '\\mathrm{pH}', min: 1.5, max: 7.5, step: 0.05, start: 2, dp: 2, play: true, auto: false, seconds: 10, alt: 'A pH strip with lemon juice, tomato and water beside the graph of pH against hydrogen ion concentration',
      group: 'Acidity', eq: '\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]', outTitle: 'Concentration',
      f: v => mm(v), pt: (v, f) => ({ x: f(v), y: v }),
      static(g, w) { const pts = []; for (let i = 0; i <= 400; i++) { const p = 1.05 + (w.ymax + 0.5 - 1.05) * i / 400; pts.push([mm(p), p]); }
        g.path(pts, { color: CURVE_C }); },
      reads: [(v, f) => `[\\mathrm{H}^+]=10^{-${fx(v, 2)}}`, (v, f) => `[\\mathrm{H}^+]=${sci(Math.pow(10, -v))}\\text{ mol/L}`],
      scene: v => ({ marker: v }) },
    /* smartphone adoption (MAI HL U5 L4): the phone fills with the logistic model L, the gauge shows the exponential E */
    phone: { name: 't', min: 0, max: 16, step: 0.1, start: 0, dp: 1, play: true, auto: true, seconds: 14,
      alt: 'A phone that fills with adoption and a gauge for the exponential forecast beside the graph of adoption against time',
      guideFrom: 0, group: 'Time in years', eq: ['E(t)=5\\cdot 2^{t/2}', 'L(t)=\\dfrac{80}{1+15e^{-0.381t}}'], eqTitle: '', outTitle: '',
      f: v => PHONE.L(v), pt: (v, f) => ({ x: v, y: f(v) }),
      static(g, w) {
        g.segment({ x: 0, y: 100 }, { x: w.xmax, y: 100 }, { dashed: true });
        g.segment({ x: 0, y: 80 }, { x: w.xmax, y: 80 }, { dashed: true });
        const e = []; for (let i = 0; i <= 200; i++) { const t = 10.4 * i / 200; e.push([t, PHONE.E(t)]); }
        g.path(e, { color: RED_C });
        const l = []; for (let i = 0; i <= 300; i++) { const t = w.xmax * i / 300; l.push([t, PHONE.L(t)]); }
        g.path(l, { color: CURVE_C });
        g.point({ x: 0, y: 5 }); g.point({ x: 2, y: 10 }); },
      extra(g, getV, w) {
        const ep = g.point({ x: getV(), y: PHONE.E(getV()) }, { color: RED_C, visible: () => PHONE.E(getV()) <= w.ymax - 4 });
        return () => { ep.x = getV(); ep.y = PHONE.E(getV()); }; },
      reads: [(v) => `E=${fx(PHONE.E(v), 1)}\\%,\\quad L=${fx(PHONE.L(v), 1)}\\%`],
      scene: v => ({ t: v, P: PHONE.L(v), G: PHONE.E(v), cap: 80, dp: 1, Pn: 'L' }) },
  };
  const PHONE = { k: Math.log(15 / 7) / 2, E: t => 5 * Math.pow(2, t / 2) };
  PHONE.L = t => 80 / (1 + 15 * Math.exp(-PHONE.k * t));
  function sceneLab(container, init) {
    const K = SPEC[init.kind || 'coffee'];
    container.classList.add('lab', 'scenelab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const w = init.window, f = K.f;
    const sr = sceneRow(left, w, init.kind || 'coffee', { alt: K.alt });
    const g = sr.g;
    let v = init.start ?? K.start;
    K.static(g, w);
    g.segment(() => ({ x: K.pt(v, f).x, y: w.ymin }), () => K.pt(v, f), { dotted: true });
    g.segment(() => ({ x: K.guideFrom == null ? w.xmin : K.guideFrom, y: K.pt(v, f).y }), () => K.pt(v, f), { dotted: true });
    const mp = g.point(K.pt(v, f), { color: HANDLE_C });
    const upd = K.extra ? K.extra(g, () => v, w) : null;
    const grp = (title) => { const s = document.createElement('div'); s.className = 'lab-group';
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); } right.appendChild(s); return s; };
    const eq = grp(K.eqTitle === undefined ? 'The model' : K.eqTitle);
    [].concat(K.eq).forEach(q => { const eqd = document.createElement('div'); eqd.className = 'lab-eqline'; eqd.innerHTML = math(q); eq.appendChild(eqd); });
    const gt = grp(K.group);
    const fmt = K.fmt || (x => fx(x, K.dp));
    let user = true, pl = null;
    const sl = Lab.slider(gt, { min: K.min, max: K.max, step: K.step, value: v, label: K.name, format: fmt,
      onChange: x => { v = x; if (user && pl && pl.playing()) pl.stop(); refresh(); } });
    ['pointerdown', 'keydown'].forEach(ev => sl.input.addEventListener(ev, () => pl && pl.stop()));
    if (K.play) pl = player(gt, { min: K.min, max: K.max, seconds: init.seconds || K.seconds, get: () => v,
      set: x => { v = x; sl.input.value = x; const out = sl.input.parentNode.querySelector('output'); if (out) out.innerHTML = math(fmt(x)); refresh(); } });
    const gr = grp(K.outTitle);
    const readouts = K.reads.map(r => Lab.readout(gr, () => r(v, f)));
    function refresh() { const q = K.pt(v, f); mp.x = q.x; mp.y = q.y; if (upd) upd(); g.redraw(); sr.draw(K.scene(v, f)); readouts.forEach(r => r.update()); }
    refresh();
    const state = { g, controls: right, readouts, refresh,
      enter(byNext) { if (!pl) return; pl.stop(); if (byNext && K.auto && !reduced()) pl.play(true); },
      leave() { if (pl) pl.stop(); } };
    container.__lab = state;
    return state;
  }
  const coffeeScene = (c, init) => sceneLab(c, Object.assign({ kind: 'coffee' }, init));

  /* ---------- lab: growth family recap (opener scene 4) ---------- */
  const V = { xmin: -7, xmax: 9, ymin: -6, ymax: 9 };
  function familyModel(st) {
    if (st.fam === 'log') return { f: x => st.la + st.lb * Math.log(x) };
    const f = st.fam === 'nat' ? x => st.k * Math.exp(st.r * x) + st.c : x => st.k * Math.pow(st.a, x) + st.c;
    return { f };
  }
  const sg = (v, dp) => (v < 0 ? `-${num(-v, dp)}` : `+${num(v, dp)}`);
  function eqTex(st) {
    if (st.fam === 'log') return `y=${num(st.la, 1)}${st.lb < 0 ? '-' : '+'}${num(Math.abs(st.lb), 1)}\\ln x`;
    const k = st.k === 1 ? '' : st.k === -1 ? '-' : num(st.k, 1), tail = st.c === 0 ? '' : sg(st.c, 1);
    return st.fam === 'nat' ? `y=${k}e^{${num(st.r, 2)}x}${tail}` : `y=${k}(${num(st.a, 2)})^{x}${tail}`;
  }
  function invTex(st) {
    if (st.fam === 'log') return st.lb === 0 ? '\\text{none (constant)}' : `y=e^{(x${st.la < 0 ? '+' : '-'}${num(Math.abs(st.la), 1)})/${num(st.lb, 1)}}`;
    return `x=${st.fam === 'nat' ? `${num(st.k, 1)}e^{${num(st.r, 2)}y}` : `${num(st.k, 1)}(${num(st.a, 2)})^{y}`}${st.c === 0 ? '' : sg(st.c, 1)}`;
  }
  /* the recap cards, worded as in the opener (growth-family/index.js), at most five */
  function cards(st) {
    const out = [];
    if (st.fam === 'log') {
      const a = st.la, b = st.lb;
      out.push({ title: 'Logarithmic model', tone: 'curve', line: `$y=a+b\\ln x$ is defined only for $x>0$. The $y$-axis is a vertical asymptote: as $x\\to 0$, $y\\to ${b >= 0 ? '-' : ''}\\infty$.` });
      out.push({ title: '$a$ is the value at $x=1$', tone: 'ans', line: `$\\ln 1=0$, so $y(1)=a=${num(a, 1)}$.` });
      out.push({ title: 'Slow growth, no limit', line: b === 0 ? '$b=0$ gives the constant $y=a$.' : `Multiplying $x$ by $10$ changes $y$ by $b\\ln 10=${fx(b * Math.LN10, 2)}$. No horizontal asymptote, but ${b > 0 ? 'the climb' : 'the fall'} keeps slowing.` });
      out.push(st.inv ? { title: 'Inverse: the exponential', tone: 'red', line: 'Swap $x$ and $y$: $x=a+b\\ln y$, so $y=e^{(x-a)/b}$. The asymptote $x=0$ becomes $y=0$.' }
        : { title: 'Where you meet it', line: 'Diminishing returns: practice and skill, dose and effect, and the time to reach a level in an exponential model.' });
      return out;
    }
    const nat = st.fam === 'nat', ratio = nat ? Math.exp(st.r) : st.a;
    const flat = st.k === 0 || Math.abs(ratio - 1) < 1e-9;
    out.push(nat ? { title: 'The $e^{rx}$ form', tone: 'curve', line: `$ke^{rx}+c$ is $ka^x+c$ with $a=e^{r}=${fx(Math.exp(st.r), 3)}$. Here $r=${num(st.r, 2)}$ is the continuous rate: ${st.r > 0 ? 'growth' : st.r < 0 ? 'decay' : 'none'}.` }
      : { title: 'Exponential model', tone: 'curve', line: `$y=ka^x+c$: each step of $1$ in $x$ multiplies the gap from $c$ by $a=${num(st.a, 2)}$.` });
    if (flat) out.push({ title: 'No change', line: st.k === 0 ? '$k=0$ leaves only the constant $y=c$.' : '$a=1$ multiplies by $1$ every step, so $y$ stays constant.' });
    else {
      out.push({ title: ratio > 1 ? 'Growth: the gap grows' : 'Decay: the gap shrinks', line: `The gap $y-c$ is multiplied by $${fx(ratio, 3)}$ for each step in $x$, so it ${ratio > 1 ? 'grows' : 'shrinks'}.` });
      out.push({ title: ratio > 1 ? 'Doubling time' : 'Half-life', tone: 'ans', line: ratio > 1 ? `The gap from $c$ doubles every $\\frac{\\ln 2}{\\ln a}=${fx(Math.log(2) / Math.log(ratio), 2)}$ steps.` : `The gap from $c$ halves every $\\frac{\\ln 0.5}{\\ln a}=${fx(Math.log(0.5) / Math.log(ratio), 2)}$ steps.` });
    }
    out.push({ title: 'Initial value and asymptote', line: `$y(0)=k+c=${num(st.k + st.c, 2)}$. The line $y=${num(st.c, 1)}$ is the horizontal asymptote${st.k === 0 ? '' : ': the curve never reaches it'}.` });
    if (st.inv) out.push({ title: 'Inverse: the logarithm', tone: 'red', line: 'Solving for $x$ undoes the exponential with a logarithm. The asymptote $y=c$ becomes $x=c$.' });
    return out.slice(0, 5);
  }
  function growthFamily(container, init) {
    container.classList.add('lab', 'famlab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const w = Object.assign({}, V, init.window || {});
    const g = Lab.graph(left, w);
    const st = Object.assign({ fam: 'exp', k: 2, a: 1.5, r: 0.3, c: 1, la: 1, lb: 2, inv: false }, init.start || {});
    const M = () => familyModel(st);
    const pad = 0.6, clipY = y => Math.max(w.ymin - 3, Math.min(w.ymax + 3, y));
    const curvePts = () => { const f = M().f, pts = [];
      if (st.fam === 'log') { for (let i = 0; i <= 500; i++) { const x = 0.0004 * Math.pow((w.xmax + pad) / 0.0004, i / 500); pts.push([x, clipY(f(x))]); } }
      else for (let i = 0; i <= 500; i++) { const x = w.xmin - pad + (w.xmax - w.xmin + 2 * pad) * i / 500; pts.push([x, clipY(f(x))]); }
      return pts; };
    const invPts = () => curvePts().map(([x, y]) => [y, x]).filter(([x]) => x >= w.xmin - 3 && x <= w.xmax + 3);
    const flat = () => (st.fam === 'log' ? st.lb === 0 : st.k === 0);
    g.path(() => [[w.xmin - 1, w.xmin - 1], [w.xmax + 1, w.xmax + 1]], { dotted: true, visible: () => st.inv });
    g.path(invPts, { dashed: true, color: RED_C, visible: () => st.inv && !flat() });
    g.path(() => (st.fam === 'log' ? [[0, w.ymin - 1], [0, w.ymax + 1]] : [[w.xmin - 1, st.c], [w.xmax + 1, st.c]]), { dashed: true });
    g.label(() => -4.5, () => st.c, () => `y=${num(st.c, 1)}`, { anchor: () => (st.k >= 0 ? 's' : 'n'), visible: () => st.fam !== 'log' });
    g.path(curvePts, { color: CURVE_C, visible: () => !(st.fam === 'log' && flat()) });
    const key = () => (st.fam === 'log' ? { x: 1, y: st.la } : { x: 0, y: M().f(0) });
    const inWin = () => { const q = key(); return q.y > w.ymin + 0.3 && q.y < w.ymax - 0.3; };
    const kp = g.point(key(), { color: HANDLE_C, visible: inWin });
    g.label(() => key().x, () => key().y, () => `(${key().x},\\,${num(key().y, 2)})`, { anchor: 'ne', visible: inWin });

    const grp = (title, cls) => { const s = document.createElement('div'); s.className = 'lab-group' + (cls ? ' ' + cls : '');
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); } right.appendChild(s); return s; };
    const gm = grp('Model');
    const FAMS = { exp: 'aˣ', nat: 'eʳˣ', log: 'ln x' }, back = {}; Object.keys(FAMS).forEach(k => back[FAMS[k]] = k);
    Lab.toggle(gm, { options: Object.values(FAMS), value: FAMS[st.fam], onChange: v => { st.fam = back[v]; buildSliders(); refresh(); } });
    const r0 = Lab.readout(gm, () => eqTex(st));
    const gs = grp('', 'fam-sliders');
    const SL = { k: ['k', -4, 4, 0.5, 1], a: ['a', 0.4, 2.5, 0.05, 2], r: ['r', -0.6, 0.6, 0.05, 2], c: ['c', -3, 3, 0.5, 1], la: ['a', -3, 3, 0.5, 1], lb: ['b', -3, 3, 0.5, 1] };
    const USE = { exp: ['k', 'a', 'c'], nat: ['k', 'r', 'c'], log: ['la', 'lb'] };
    function buildSliders() { gs.innerHTML = '';
      USE[st.fam].forEach(id => { const [lab, mn, mx, step, dp] = SL[id];
        Lab.slider(gs, { min: mn, max: mx, step, value: st[id], label: lab, format: v => num(v, dp), onChange: v => { st[id] = v; refresh(); } }); });
      for (let i = USE[st.fam].length; i < 3; i++) { const sp = document.createElement('div'); sp.className = 'lab-slider spacer'; sp.innerHTML = '<span></span>'; gs.appendChild(sp); }
    }
    buildSliders();
    const gi = grp('Inverse');
    Lab.toggle(gi, { options: ['Off', 'On'], value: st.inv ? 'On' : 'Off', onChange: v => { st.inv = v === 'On'; refresh(); } });
    const r1 = Lab.readout(gi, () => invTex(st));
    const gc = document.createElement('div'); gc.className = 'fam-cards'; container.appendChild(gc);
    gc.innerHTML = '<div class="fc-head">Recap cards</div>';
    const slots = []; for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'fam-card'; gc.appendChild(d); slots.push(d); }
    const readouts = [r0, r1];
    function refresh() {
      const kk = key(); kp.x = kk.x; kp.y = kk.y;
      g.redraw(); readouts.forEach(r => r.update());
      const cs = cards(st);
      slots.forEach((d, i) => { const c = cs[i]; d.className = 'fam-card' + (c ? ' t-' + (c.tone || 'none') : ' empty');
        d.innerHTML = c ? `<div class="fc-t">${prose(c.title)}</div><div class="fc-l">${prose(c.line)}</div>` : ''; });
    }
    refresh();
    const state = { g, controls: right, readouts, refresh };
    container.__lab = state;
    return state;
  }

  /* ---------- lab: logistic parameters (MAI HL U5 L4, scene 6) ----------
     L(t) = M / (1 + A e^{-kt}), A = (M - P0) / P0. Sliders: growth parameter k, limit M, start P0, and time t.
     The opening model (k 0.38, M 80, P0 5) stays on the graph in grey, so each change is a comparison. No autoplay. */
  function logisticLab(container, init) {
    container.classList.add('lab', 'scenelab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const w = init.window, st = Object.assign({ k: 0.38, M: 80, P0: 5, t: 8 }, init.start || {});
    const Aof = p => (p.M - p.P0) / p.P0, Lf = (t, p) => p.M / (1 + Aof(p) * Math.exp(-p.k * t));
    const sr = sceneRow(left, w, 'phone', { alt: 'A phone that fills with adoption beside the graph of adoption against time' });
    const g = sr.g, REF = { k: 0.38, M: 80, P0: 5 }, tmax = Math.floor(w.xmax - 1.5);
    g.segment({ x: 0, y: 100 }, { x: w.xmax, y: 100 }, { dashed: true });
    g.segment(() => ({ x: 0, y: st.M }), () => ({ x: w.xmax, y: st.M }), { dashed: true, visible: () => st.M !== 100 });
    const pts = p => { const a = []; for (let i = 0; i <= 300; i++) { const t = w.xmax * i / 300; a.push([t, Lf(t, p)]); } return a; };
    g.path(pts(REF), { color: '#55636F' });
    g.path(() => pts(st), { color: CURVE_C });
    const mp = g.point({ x: st.t, y: Lf(st.t, st) }, { color: HANDLE_C });
    g.segment(() => ({ x: st.t, y: w.ymin }), () => ({ x: st.t, y: Lf(st.t, st) }), { dotted: true });
    g.segment(() => ({ x: 0, y: Lf(st.t, st) }), () => ({ x: st.t, y: Lf(st.t, st) }), { dotted: true });
    const grp = (title) => { const s = document.createElement('div'); s.className = 'lab-group';
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); } right.appendChild(s); return s; };
    const gp = grp('Change the model');
    Lab.slider(gp, { min: 0.1, max: 1, step: 0.02, value: st.k, label: 'k', format: x => num(x, 2), onChange: x => { st.k = x; refresh(); } });
    Lab.slider(gp, { min: 40, max: 100, step: 2, value: st.M, label: '\\text{limit}', format: x => num(x, 0), onChange: x => { st.M = x; refresh(); } });
    Lab.slider(gp, { min: 1, max: 30, step: 1, value: st.P0, label: '\\text{start}', format: x => num(x, 0), onChange: x => { st.P0 = x; refresh(); } });
    Lab.slider(gp, { min: 0, max: tmax, step: 0.1, value: st.t, label: 't', format: x => fx(x, 1), onChange: x => { st.t = x; refresh(); } });
    const gr = grp('Readings');
    const r0 = Lab.readout(gr, () => `L(t)=\\dfrac{${num(st.M, 0)}}{1+${num(Aof(st), 2)}e^{-${num(st.k, 2)}t}}`);
    const r1 = Lab.readout(gr, () => `L(${fx(st.t, 1)})=${fx(Lf(st.t, st), 1)}\\%`);
    const r2 = Lab.readout(gr, () => Aof(st) > 1 ? `\\text{steepest: }t=${fx(Math.log(Aof(st)) / st.k, 1)}` : '\\text{steepest: before }t=0');
    const readouts = [r0, r1, r2];
    function refresh() { const y = Lf(st.t, st); mp.x = st.t; mp.y = y; g.redraw(); sr.draw({ t: st.t, P: y, cap: st.M, dp: 1, Pn: 'L' }); readouts.forEach(r => r.update()); }
    refresh();
    const state = { g, controls: right, readouts, refresh, enter() {}, leave() {} };
    container.__lab = state;
    return state;
  }

  window.Lab.sceneRow = sceneRow;

  /* ---------- catalogue: a list of cases on the left, one case's panes on the right (clicked, or Up / Down) ---------- */
  function catalogue(container, init) {
    const items = init.items, mk = (cls, tag, txt) => { const e = document.createElement(tag || 'div'); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    container.classList.add('catbox');
    const body = mk('cat-body'), list = mk('cat-list'), stack = mk('cat-stack');
    body.appendChild(list); body.appendChild(stack); container.appendChild(body);
    const btns = [], panes = []; let group = null, cur = 0;
    const select = i => { cur = i; btns.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); panes.forEach((p, j) => p.classList.toggle('on', j === i)); };
    items.forEach((it, i) => {
      if (it.group !== group) { group = it.group; list.appendChild(mk('cat-group', 'div', group)); }
      const b = mk('cat-btn', 'button', it.title); b.type = 'button'; b.addEventListener('click', e => { e.stopPropagation(); select(i); });
      list.appendChild(b); btns.push(b);
      const pane = mk('cat-item'), main = mk('cat-main'), exp = mk('cat-exp');
      pane.appendChild(mk('cat-title', 'h3', it.title));
      [['What grows', it.what], ['Why it levels off', it.why]].forEach(([h, t]) => { const q = mk('cat-q'); q.appendChild(mk('cat-h', 'span', h)); q.appendChild(mk('', 'p', t)); main.appendChild(q); });
      exp.appendChild(mk('cat-h', 'span', 'How could I conduct an experiment to measure?')); exp.appendChild(mk('', 'p', it.exp));
      const row = mk('cat-row'); row.appendChild(main); row.appendChild(exp); pane.appendChild(row);
      stack.appendChild(pane); panes.push(pane);
    });
    document.addEventListener('keydown', e => {
      if (!container.closest('.slide.active') || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      e.preventDefault(); select(Math.max(0, Math.min(items.length - 1, cur + (e.key === 'ArrowDown' ? 1 : -1))));
    });
    select(0);
    return { enter() {}, leave() {} };
  }
  window.Lab.presets.catalogue = catalogue;
  window.Lab.presets.logisticLab = logisticLab;
  window.Lab.scenes = SCENES;
  window.Lab.presets.coffeeScene = coffeeScene;
  window.Lab.presets.sceneLab = sceneLab;
  window.Lab.presets.growthFamily = growthFamily;
})();
