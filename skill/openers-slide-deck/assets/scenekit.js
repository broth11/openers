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

  /* v22: the drawing alone, large (scene title cards). win sets the drawing's vertical scale; state.bare hides readouts */
  function sceneArt(el, win, kind, state, opts) {
    opts = opts || {};
    if (kind === 'track' || kind === 'ride' || kind === 'lanes') return motionArt(el, kind, state, opts);
    const W = 600, H = 1000;
    const sc = document.createElement('div'); sc.className = 'scene'; el.appendChild(sc);
    if (kind === 'phone') { phoneArt(sc, state || {}, opts); return { el: sc }; }
    if (kind === 'scatter') { scatterArt(sc, state || {}, opts); return { el: sc }; }
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', class: 'scene-svg', role: 'img', 'aria-label': opts.alt || kind }, sc);
    const labs = document.createElement('div'); labs.className = 'scene-labels'; sc.appendChild(labs);
    const Y = v => (win.ymax - v) / (win.ymax - win.ymin) * H;
    const grp = mk('g', {}, svg);
    const api = { W, H, Y, win, el: (t, a, p) => mk(t, a, p || grp),
      text(x, y, html, cls, anchor) { const d = document.createElement('div'); d.className = 'scene-text ' + (cls || '');
        d.style.left = (x / W * 100) + '%'; d.style.top = (y / H * 100) + '%';
        d.style.transform = { w: 'translate(0,-50%)', e: 'translate(-100%,-50%)', c: 'translate(-50%,-50%)', nw: 'translate(0,0)', n: 'translate(-50%,0)', s: 'translate(-50%,-100%)', sw: 'translate(0,-100%)' }[anchor || 'w'];
        d.innerHTML = prose(html); labs.appendChild(d); return d; } };
    SCENES[kind](api, Object.assign({ bare: true }, state || {}));
    if ((state || {}).bare !== false) labs.querySelectorAll('.sc-read').forEach(n => n.remove());   /* title cards: the drawing alone (readouts hidden) */
    return { el: sc };
  }

  /* v22b: the phone as an object (title cards): 49 x 100, a real phone's proportions; the screen fills to P % */
  function phoneArt(sc, s, opts) {
    const W = 490, H = 1000, svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene-svg', role: 'img', 'aria-label': opts.alt || 'phone' }, sc);
    const id = 'pa' + Math.random().toString(36).slice(2, 8);
    mk('rect', { x: 8, y: 8, width: W - 16, height: H - 16, rx: 74, fill: '#D6DEE6', stroke: '#9AA8B4', 'stroke-width': 8 }, svg);
    const sx = 34, sy = 70, sw = W - 68, sh = H - 140;
    mk('rect', { x: sx, y: sy, width: sw, height: sh, rx: 44 }, mk('clipPath', { id }, mk('defs', {}, svg)));
    const scr = mk('g', { 'clip-path': `url(#${id})` }, svg);
    mk('rect', { x: sx, y: sy, width: sw, height: sh, fill: '#FFFFFF' }, scr);
    const P = Math.max(0, Math.min(100, s.P || 0)), fy = sy + sh * (1 - P / 100);
    if (P > 0) mk('rect', { x: sx, y: fy, width: sw, height: sy + sh - fy, style: s.Pn === 'E' ? 'fill:var(--sc-red);fill-opacity:.75' : `fill:${CURVE_C};fill-opacity:.85` }, scr);
    if (s.cap != null) mk('line', { x1: sx, x2: sx + sw, y1: sy + sh * (1 - s.cap / 100), y2: sy + sh * (1 - s.cap / 100), stroke: '#55636F', 'stroke-width': 5, 'stroke-dasharray': '18 12' }, scr);
    mk('rect', { x: sx, y: sy, width: sw, height: sh, rx: 44, fill: 'none', stroke: '#9AA8B4', 'stroke-width': 4 }, svg);
    mk('rect', { x: W / 2 - 46, y: 34, width: 92, height: 14, rx: 7, fill: '#9AA8B4' }, svg);
    mk('rect', { x: W / 2 - 56, y: H - 48, width: 112, height: 10, rx: 5, fill: '#9AA8B4' }, svg);
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
    if (s.bare) return;
    /* v22: a zoomed window (top of the graph just above 100) leaves room for one row only: t on the left, the level on the right */
    if (!s.avail && top100 - 40 < 190) {
      const yy = Math.max(30, (top100 - 40) / 2);
      if (s.t != null) a.text(14, yy, `$t=${fx(s.t, dp ? 1 : 0)}\\text{ yr}$`, 'sc-read sc-sm', 'w');
      if (s.P != null && !hasG) a.text(586, yy, `$${s.Pn || 'A'}=${fx(P, dp)}\\%$`, 'sc-read sc-sm ' + (s.Pn === 'E' ? 'sc-T' : 'sc-S'), 'e');   /* beside the gauge, the lab's own readout carries the level */
      return;
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
      cur += (o.max - o.min) * dt * (window.LAB_SPEED || 1) / o.seconds;   /* v22: deck-wide speed (meta.animSpeed) */
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
      guideFrom: 0, group: 'Time in years', eq: ['E(t)=5\\cdot 2^{t/2}', 'P(t)=\\dfrac{80}{1+15e^{-0.381t}}'], eqTitle: '', outTitle: '',
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
      reads: [(v) => `E=${fx(PHONE.E(v), 1)}\\%,\\quad P=${fx(PHONE.L(v), 1)}\\%`],
      scene: v => ({ t: v, P: PHONE.L(v), G: PHONE.E(v), cap: 80, dp: 1, Pn: 'P' }) },
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
    Lab.slider(gp, { min: 40, max: 100, step: 2, value: st.M, label: 'L', format: x => num(x, 0), onChange: x => { st.M = x; refresh(); } });
    Lab.slider(gp, { min: 1, max: 30, step: 1, value: st.P0, label: '\\text{start}', format: x => num(x, 0), onChange: x => { st.P0 = x; refresh(); } });
    Lab.slider(gp, { min: 0, max: tmax, step: 0.1, value: st.t, label: 't', format: x => fx(x, 1), onChange: x => { st.t = x; refresh(); } });
    const gr = grp('Readings');
    const r0 = Lab.readout(gr, () => `P(t)=\\dfrac{${num(st.M, 0)}}{1+${num(Aof(st), 2)}e^{-${num(st.k, 2)}t}}`);
    r0.el.classList.add('ro-frac');   /* a stacked fraction with an exponent needs a taller fixed row than the other readouts */
    const r1 = Lab.readout(gr, () => `P(${fx(st.t, 1)})=${fx(Lf(st.t, st), 1)}\\%`);
    const r2 = Lab.readout(gr, () => Aof(st) > 1 ? `\\text{steepest: }t=${fx(Math.log(Aof(st)) / st.k, 1)}` : '\\text{steepest: before }t=0');
    const readouts = [r0, r1, r2];
    function refresh() { const y = Lf(st.t, st); mp.x = st.t; mp.y = y; g.redraw(); sr.draw({ t: st.t, P: y, cap: st.M, dp: 1, Pn: 'P' }); readouts.forEach(r => r.update()); }
    refresh();
    const state = { g, controls: right, readouts, refresh, enter() {}, leave() {} };
    container.__lab = state;
    return state;
  }

  /* ---------- motion scenes (MAI HL U12 L1, 1/11/2026): an object on a track above a standard s-t graph ----------
     Lab.motionSlide(figEl, spec, shownFn) -> {redraw, enter(byNext), stepped(), stop}   (an example slide's figure)
     spec.scene = {kind: 'track' | 'ride', layout: 'stack', color, sec, from, motion, states: [[reveal, {t, read, ...}], ...]}
     motion = {pts: [[t, s], ...] (sampled by the generator), dot (one strobe dot per this many time units), xmin, xmax, lab, ...}
     Nothing is drawn ahead of the cursor t: dots, trace and ground are all cut at t. The cursor moves by animation
     (arrival by Next, or a reveal whose state has a later t); Back and jumps show the finished state without replay. */
  const MOTION = {};
  const ip = window.Lab.interp;
  const strip = (kind, M) => (kind === 'ride' ? 290 : kind === 'lanes' ? 290 : (M && M.vpts ? 326 : 250));
  const PH = 450, PANEL = 148;   /* the stacked sign-diagram panels (viewBox 1000 x 420) */
  function textApi(labs, W, H, grpGet) {
    return { W, H, el: (t, a, p) => mk(t, a, p || grpGet()),
      text(x, y, html, cls, anchor) { const d = document.createElement('div'); d.className = 'scene-text ' + (cls || '');
        d.style.left = (x / W * 100) + '%'; d.style.top = (y / H * 100) + '%';
        d.style.transform = { w: 'translate(0,-50%)', e: 'translate(-100%,-50%)', c: 'translate(-50%,-50%)', n: 'translate(-50%,0)', s: 'translate(-50%,-100%)' }[anchor || 'w'];
        d.innerHTML = prose(html); labs.appendChild(d); return d; } };
  }
  function motionRow(el, win, kind, sc) {
    const ladder = sc.layout === 'ladder', W = 1000, signs = sc.layout === 'signs' || ladder, ph = ladder ? 510 : PH;   /* v25: the ladder shares the signs frame */
    const row = document.createElement('div'); row.className = 'scene-row stack'; el.appendChild(row);
    row.style.setProperty('--asp', String(win.aspect || 1.9));
    if (signs) row.classList.add('signs');
    if (ladder) row.classList.add('ladder');
    const st = document.createElement('div'); st.className = 'scene mstrip'; row.appendChild(st);
    const svg = mk('svg', { viewBox: '0 0 1000 100', class: 'scene-svg', role: 'img', 'aria-label': sc.alt || kind }, st);
    const labs = document.createElement('div'); labs.className = 'scene-labels'; st.appendChild(labs);
    let grp = mk('g', {}, svg), gh = null, psvg, plabs, pgrp;
    const fitStrip = () => { const H = strip(kind, sc.motion); st.style.aspectRatio = W + ' / ' + H; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); return H; };
    fitStrip();
    if (signs) {   /* the three stacked panels under the strip: one svg, text laid over it */
      const pn = document.createElement('div'); pn.className = 'scene mpanels'; pn.style.aspectRatio = W + ' / ' + ph; row.appendChild(pn);
      psvg = mk('svg', { viewBox: `0 0 ${W} ${ph}`, class: 'scene-svg', role: 'img', 'aria-label': 'Graphs and sign diagrams of s, v and a' }, pn);
      plabs = document.createElement('div'); plabs.className = 'scene-labels'; pn.appendChild(plabs);
      pgrp = mk('g', {}, psvg);
    } else { gh = document.createElement('div'); gh.className = 'scene-graph'; row.appendChild(gh); }
    function draw(state) {
      const H = fitStrip();
      grp.remove(); grp = mk('g', {}, svg); labs.innerHTML = '';
      MOTION[kind](textApi(labs, W, H, () => grp), state || {}, sc.motion, sc.color || HANDLE_C);
      if (signs) { pgrp.remove(); pgrp = mk('g', {}, psvg); plabs.innerHTML = ''; (ladder ? drawLadder : drawPanels)(textApi(plabs, W, ph, () => pgrp), sc.motion, state || {}, sc.color || HANDLE_C); }
    }
    return { row, draw, gh };
  }
  /* the stacked panels: s, v and a against t, each with its sign diagram; cut at the cursor unless state.full */
  function drawPanels(a, M, s, C) {
    const t = s.t || 0, show = s.show || 3, full = !!s.full, T = M.T, X = u => 100 + u / T * 870, lim = full ? T : t;
    const tabs = [['s', M.pts, M.smax], ['v', M.vpts, M.vmax], ['a', M.apts, M.amax]];
    for (let i = 0; i < show; i++) {
      const [k, pts, mx] = tabs[i], top = 6 + i * PANEL, cy = top + 40, hh = 37, sy = top + 88, sh = 34, Yf = v => cy - v / (mx * 1.08) * hh;
      a.text(16, cy, `$${k}$`, 'sc-name', 'w');
      a.el('line', { x1: 100, x2: 975, y1: cy, y2: cy, class: 'sc-tick', 'stroke-width': 3 });
      a.text(990, cy, '$t$', 'sc-num', 'e');
      const ps = [];
      for (const [u, v] of pts) { if (u <= lim + 1e-9) ps.push(`${X(u).toFixed(1)},${Yf(v).toFixed(1)}`); else { ps.push(`${X(lim).toFixed(1)},${Yf(ip(pts, lim)).toFixed(1)}`); break; } }
      if (ps.length > 1) a.el('polyline', { points: ps.join(' '), fill: 'none', stroke: 'var(--title)', 'stroke-width': 5, 'stroke-linejoin': 'round' });
      for (const [t0, t1, sg] of M.segs[k]) { const e = Math.min(t1, lim); if (e <= t0 + 1e-9) continue;
        const fill = sg === '+' ? 'var(--sc-curve)' : sg === '-' ? 'var(--sc-red)' : 'var(--note)';
        a.el('rect', { x: X(t0), y: sy, width: X(e) - X(t0), height: sh, fill, 'fill-opacity': .38, stroke: fill, 'stroke-width': 2 });
        if (X(e) - X(t0) > 40) a.text((X(t0) + X(e)) / 2, sy + sh / 2, sg === '+' ? '$+$' : sg === '-' ? '$-$' : '$0$', 'sc-sign', 'c'); }
      (M.zeros[k] || []).forEach(z => { if (z > lim + 1e-9) return;
        a.el('line', { x1: X(z), x2: X(z), y1: sy - 6, y2: sy + sh + 6, stroke: C, 'stroke-width': 5 });
        a.text(X(z), sy + sh + 24, `$${num(z, 2)}$`, 'sc-num', 'c'); });
      if (s.cursor !== false) a.el('circle', { cx: X(Math.min(t, T)), cy: Yf(ip(pts, t)), r: 9, fill: C });
    }
    if (s.cursor !== false) a.el('line', { x1: X(Math.min(t, T)), x2: X(Math.min(t, T)), y1: 4, y2: 6 + (show - 1) * PANEL + 126, stroke: C, 'stroke-width': 3, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' });
  }
  /* v25 (U12 L3): the ladder. a-t over v-t over s-t on one t axis; every curve is cut at the cursor and the area under a and under v is shaded live.
     M.T, M.ts (t tick step), M.panels = {a|v|s: {ymin, ymax, dp, dname (the area readout's name), rpos ('tl' | 'tr' | 'bl' | 'br'),
       series: [{pts, area (cumulative area table), color, posColor, negColor, sub, opacity}]}}.
     state: t, show (1 to 3 panels), shade (panel names), areas (panels whose area readout shows), vals (panels whose value shows), refs (panels whose
     dashed reference lines show: P.refs = [{y, label}]), areaFrom. P.yticks lists the y-axis labels (default: ymax, and ymin when negative). */
  const LAD_H = 161;
  function drawLadder(a, M, s, C) {
    const T = M.T, t = Math.min(s.t || 0, T), X = u => 100 + u / T * 870, show = s.show || 3, shade = s.shade || [], areas = s.areas || [], vals = s.vals || [];
    const names = ['a', 'v', 's'], runs = window.Lab.areaRuns;
    let yb = 0;
    for (let i = 0; i < show; i++) {
      const k = names[i], P = M.panels[k]; if (!P) continue;
      const top = 4 + i * LAD_H, y0 = top + 32, y1 = top + LAD_H - 20, Y = v => y1 - (v - P.ymin) / (P.ymax - P.ymin) * (y1 - y0);
      yb = y1;
      a.text(112, top + 16, `$${k}(t)$`, 'sc-name', 'w');   /* name above the axis, clear of the tick numerals */
      a.el('line', { x1: 100, x2: 975, y1: Y(0), y2: Y(0), class: 'sc-tick', 'stroke-width': 3 });
      a.el('line', { x1: 100, x2: 100, y1: y0 - 4, y2: y1 + 4, class: 'sc-tick', 'stroke-width': 3 });
      a.text(990, Y(0), '$t$', 'sc-num', 'e');
      const lab = (v) => num(v, P.tdp == null ? 0 : P.tdp);
      (P.yticks || [P.ymax > 0 ? P.ymax : null, P.ymin < 0 ? P.ymin : null].filter(v => v != null)).forEach(v => {
        a.el('line', { x1: 94, x2: 106, y1: Y(v), y2: Y(v), class: 'sc-tick', 'stroke-width': 3 }); a.text(88, Y(v), lab(v), 'sc-num', 'e'); });
      if ((s.refs || []).includes(k)) (P.refs || []).forEach(r => { a.el('line', { x1: 100, x2: 975, y1: Y(r.y), y2: Y(r.y), stroke: C, 'stroke-width': 3, 'stroke-dasharray': '10 8' });
        if (r.label) a.text(140, Y(r.y) - 14, `$${r.label}$`, 'sc-ar', 'w').style.color = C; });
      for (let u = 0; u <= T + 1e-9; u += (M.ts || 1)) a.el('line', { x1: X(u), x2: X(u), y1: Y(0) - 5, y2: Y(0) + 5, class: 'sc-tick', 'stroke-width': 3 });
      if (shade.includes(k)) P.series.forEach(ser => runs(ser.pts).forEach(r => { const e = Math.min(t, r.t1); if (e <= r.t0 + 1e-9) return;
        const ring = [[X(r.t0), Y(0)], [X(r.t0), Y(ip(ser.pts, r.t0))]];
        ser.pts.forEach(([u, v]) => { if (u > r.t0 + 1e-9 && u < e - 1e-9) ring.push([X(u), Y(v)]); });
        ring.push([X(e), Y(ip(ser.pts, e))], [X(e), Y(0)]);
        a.el('polygon', { points: ring.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill: r.sg > 0 ? (ser.posColor || ser.color) : (ser.negColor || ser.color), 'fill-opacity': ser.opacity == null ? .38 : ser.opacity, stroke: 'none' }); }));
      P.series.forEach(ser => { const ps = [];
        for (const [u, v] of ser.pts) { if (u <= t + 1e-9) ps.push(`${X(u).toFixed(1)},${Y(v).toFixed(1)}`); else { ps.push(`${X(t).toFixed(1)},${Y(ip(ser.pts, t)).toFixed(1)}`); break; } }
        if (ps.length > 1) a.el('polyline', { points: ps.join(' '), fill: 'none', stroke: ser.color, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
        a.el('circle', { cx: X(t), cy: Y(ip(ser.pts, t)), r: 8, fill: ser.color }); });
      const lines = [];
      P.series.forEach(ser => { const sub = ser.sub ? `_{${ser.sub}}` : '';
        if (areas.includes(k) && ser.area) lines.push([`${P.dname}${sub}=${num(ip(ser.area, t) - ip(ser.area, s.areaFrom || 0), P.dp == null ? 1 : P.dp)}`, ser.color]);
        if (vals.includes(k)) lines.push([`${k}${sub}(t)=${num(ip(ser.pts, t), P.dp == null ? 1 : P.dp)}`, ser.color]); });
      lines.forEach(([tx, col], j) => a.text(965 - (lines.length - 1 - j) * 250, top + 16, `$${tx}$`, 'sc-ar', 'e').style.color = col);   /* the readout row sits above the plot, clear of every curve */
    }
    for (let u = 0; u <= T + 1e-9; u += (M.ts || 1)) a.text(X(u), yb + 18, num(u, 0), 'sc-num', 'c');
    a.el('line', { x1: X(t), x2: X(t), y1: 4, y2: yb + 4, stroke: C, 'stroke-width': 3, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' });
  }
  /* readout row: t and s on one line (s only when the state allows it) */
  function motionRead(a, s, M, C, y) {
    if (s.bare || s.read === 'none') return;
    if (M.xmin != null) a.text(960, y, `$s\\ (\\text{${M.unit}})$`, 'sc-unit', 'e');
    a.text(40, y, `$t=${num(s.t, Math.abs(s.t - Math.round(s.t)) < 0.005 ? 0 : 1)}\\ \\text{${M.tunit}}$`, 'sc-read', 'w');   /* tenths only while the cursor is between whole units */
    if (s.read !== 't') a.text(360, y, `$s=${num(ip(M.pts, s.t), M.sdp == null ? 1 : M.sdp)}\\ \\text{${M.unit}}$`, 'sc-read', 'w').style.color = C;
  }
  const dirAt = (pts, t) => { const d = ip(pts, t) - ip(pts, Math.max(0, t - 0.01)); return t < 0.011 ? 1 : (Math.abs(d) < 1e-9 ? 0 : Math.sign(d)); };
  MOTION.track = (a, s, M, C) => {
    const arrows = !!M.vpts && !s.bare && s.arrows !== false, big = !!M.vpts;
    const t = s.t || 0, y0 = big ? 250 : 168, yr = big ? 212 : 130, X = v => 50 + (v - M.xmin) / (M.xmax - M.xmin) * 900, step = M.step || 1;
    const pos = ip(M.pts, t), mk_ = a.el;
    mk_('line', { x1: 30, x2: 970, y1: yr, y2: yr, class: 'sc-road', 'stroke-width': 8, 'stroke-linecap': 'round' });
    mk_('line', { x1: 30, x2: 962, y1: y0, y2: y0, class: 'sc-tick', 'stroke-width': 4 });
    mk_('polygon', { points: `976,${y0} 958,${y0 - 9} 958,${y0 + 9}`, class: 'sc-tickfill' });
    for (let v = Math.ceil(M.xmin / step - 1e-9) * step; v <= M.xmax + 1e-9; v += step) {
      const o = Math.abs(v) < 1e-9, lab = o || Math.abs(v % (M.lab || 1)) < 1e-9;
      mk_('line', { x1: X(v), x2: X(v), y1: y0 - (o ? 16 : 8), y2: y0 + (o ? 16 : 8), class: o ? 'sc-origin' : 'sc-tick', 'stroke-width': o ? 6 : 3 });
      if (lab) a.text(X(v), y0 + 56, o ? '$\\mathbf{O}$' : `$${Math.round(v)}$`, o ? 'sc-unit' : 'sc-num', 'c');
    }
    if (!s.bare && !s.hide) {   /* v24: s.hide keeps the number line and hides the car, its dots and its trace until the reveal */
      /* strobe dots and the traced line: forward motion on the number line, backward motion one row below it */
      const rowY = d => (d < 0 ? y0 + 26 : y0), tr = [];
      for (let u = 0; u <= t + 1e-9; u += 0.02) { const q = Math.min(u, t); tr.push(`${X(ip(M.pts, q)).toFixed(1)},${rowY(dirAt(M.pts, q))}`); if (q >= t) break; }
      if (t > 0) tr.push(`${X(pos).toFixed(1)},${rowY(dirAt(M.pts, t))}`);
      if (tr.length > 1) mk_('polyline', { points: tr.join(' '), fill: 'none', stroke: C, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: .55 });
      for (let k = 0; k * M.dot <= t + 1e-9; k++) { const tk = k * M.dot;
        mk_('circle', { cx: X(ip(M.pts, tk)), cy: rowY(k ? dirAt(M.pts, tk) : 1), r: 11, fill: C }); }
      mk_('line', { x1: X(pos), x2: X(pos), y1: yr + 6, y2: y0 - 12, stroke: C, 'stroke-width': 4, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' });
    }
    /* the car: it faces right while moving right and is flipped to face left while moving left */
    if (!s.hide) {
    const dir = s.bare ? 1 : (dirAt(M.pts, t) || 1);
    const g = mk_('g', { transform: `translate(${X(pos)},${yr}) scale(${dir},1)` });
    mk_('path', { d: 'M -58 -16 L -58 -36 Q -58 -44 -50 -44 L -32 -44 L -20 -64 Q -16 -70 -8 -70 L 14 -70 Q 22 -70 26 -64 L 38 -46 L 50 -42 Q 60 -40 60 -30 L 60 -16 Z', fill: '#F2F4F7', stroke: '#55636F', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    mk_('path', { d: 'M -16 -46 L -6 -62 L 14 -62 L 24 -46 Z', fill: '#9AC4E0', stroke: '#55636F', 'stroke-width': 3 }, g);
    mk_('rect', { x: 50, y: -36, width: 10, height: 9, rx: 3, fill: '#F5D547' }, g);
    mk_('rect', { x: -58, y: -38, width: 7, height: 10, rx: 3, fill: '#CF5044' }, g);
    [-32, 32].forEach(x => { mk_('circle', { cx: x, cy: -14, r: 15, fill: '#2B3640', stroke: '#9AA8B4', 'stroke-width': 3 }, g); mk_('circle', { cx: x, cy: -14, r: 5, fill: '#9AA8B4' }, g); });
    }
    if (arrows) {   /* velocity above, and the rubber band (acceleration) below it: each points the way its sign points */
      const px = X(pos), one = (y, val, mx, col, name) => {
        const L = val / mx * 120, sg = Math.sign(L);
        if (Math.abs(L) < 5) { const right = px < 700; mk_('circle', { cx: px, cy: y, r: 7, fill: col }); a.text(px + (right ? 18 : -18), y, `$${name}=0$`, 'sc-ar', right ? 'w' : 'e').style.color = col; return; }
        mk_('line', { x1: px, y1: y, x2: px + L - sg * 14, y2: y, stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round' });
        mk_('polygon', { points: `${px + L},${y} ${px + L - sg * 26},${y - 15} ${px + L - sg * 26},${y + 15}`, fill: col });
        a.text(px - sg * 16, y, `$${name}$`, 'sc-ar', sg > 0 ? 'e' : 'w').style.color = col;
      };
      one(66, ip(M.vpts, t), M.vmax, 'var(--sc-curve)', 'v');
      one(112, ip(M.apts, t), M.amax, 'var(--sc-red)', 'a');
    }
    motionRead(a, s, M, C, 28);
  };
  MOTION.ride = (a, s, M, C) => {
    const t = s.t || 0, base = 282, d = ip(M.pts, t), mk_ = a.el;
    const H = M.hill, hx = H.map(r => [r[0], r[1]]), hy = H.map(r => [r[0], r[2]]);
    const P = q => [ip(hx, q), ip(hy, q)];
    let ang = 0, px, py;
    if (s.bare || s.hide) { px = 320; py = 232; mk_('rect', { x: 0, y: py, width: 1000, height: base - py, fill: '#8B7355' }); mk_('line', { x1: 0, x2: 1000, y1: py, y2: py, stroke: '#6FA05A', 'stroke-width': 9 }); }
    else {
      const pts = H.filter(r => r[0] <= d + 1e-9).map(r => [r[1], r[2]]), end = P(d);
      if (!pts.length || pts[pts.length - 1][0] < end[0] - 1e-9) pts.push(end);
      pts.unshift([0, pts[0][1]]);   /* the flat run-in behind the start: nothing ahead of him is drawn */
      const gid = 'gf' + Math.random().toString(36).slice(2, 7), gd = mk_('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: end[0] - 90, x2: end[0], y1: 0, y2: 0 });
      mk_('stop', { offset: 0, 'stop-color': '#8B7355', 'stop-opacity': .9 }, gd); mk_('stop', { offset: 1, 'stop-color': '#8B7355', 'stop-opacity': 0 }, gd);
      mk_('polygon', { points: [[0, base]].concat(pts, [[end[0], base]]).map(q => q.map(v => v.toFixed(1)).join(',')).join(' '), fill: `url(#${gid})` });
      mk_('polyline', { points: pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' '), fill: 'none', stroke: '#6FA05A', 'stroke-width': 9, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      for (let k = 0; k * M.dot <= t + 1e-9; k++) { const [x, y] = P(ip(M.pts, k * M.dot)); mk_('circle', { cx: x, cy: y - 2, r: 9, fill: C, stroke: '#14202B', 'stroke-width': 2 }); }
      [px, py] = end; const back = P(Math.max(0, d - 90)); ang = Math.atan2(py - back[1], px - back[0]) * 180 / Math.PI; if (d < 90) ang = Math.atan2(P(90)[1] - back[1], P(90)[0] - back[0]) * 180 / Math.PI;
      if (s.mark != null) { const [mx, my] = P(ip(M.pts, s.mark)); mk_('circle', { cx: mx, cy: my - 2, r: 22, fill: 'none', stroke: 'var(--bl)', 'stroke-width': 6 }); a.text(mx - 34, my - 2, '$\\text{steepest}$', 'sc-mk', 'e'); }
    }
    if (!s.hide) {   /* v24: hidden until the reveal */
    const g = mk_('g', { transform: `translate(${px.toFixed(1)},${(py - 6).toFixed(1)}) rotate(${ang.toFixed(1)})` });
    [-26, 26].forEach(x => mk_('circle', { cx: x, cy: -16, r: 16, fill: 'none', stroke: 'var(--title)', 'stroke-width': 4 }, g));
    mk_('polyline', { points: '-26,-16 -6,-16 6,-40 22,-40 26,-16', fill: 'none', stroke: 'var(--title)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    mk_('line', { x1: 6, y1: -40, x2: -6, y2: -16, stroke: 'var(--title)', 'stroke-width': 4 }, g);
    mk_('polyline', { points: '-6,-16 -10,-52 6,-68', fill: 'none', stroke: C, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    mk_('circle', { cx: 10, cy: -82, r: 11, fill: C }, g);
    }
    motionRead(a, s, M, C, 28);
  };
  /* v25 (U12 L3): two cars in two lanes above one number line. M.cars = [{name, color, pts: [[t, s], ...]}]; each car keeps a row of strobe dots
     on the number line in its own colour (the first car's row above the line, the second car's below it). state.hide hides cars, dots and positions. */
  MOTION.lanes = (a, s, M, C) => {
    const t = s.t || 0, y0 = 226, lanes = [102, 182], rows = [-15, 15], X = v => 50 + (v - M.xmin) / (M.xmax - M.xmin) * 900, step = M.step || 1, mk_ = a.el;
    lanes.slice(0, M.cars.length).forEach((y, i) => { mk_('line', { x1: 30, x2: 970, y1: y, y2: y, class: 'sc-road', 'stroke-width': 8, 'stroke-linecap': 'round' });
      if (!s.bare) a.text(14, y - 34, `$\\mathbf{${M.cars[i].name}}$`, 'sc-unit', 'w').style.color = M.cars[i].color; });
    mk_('line', { x1: 30, x2: 962, y1: y0, y2: y0, class: 'sc-tick', 'stroke-width': 4 });
    mk_('polygon', { points: `976,${y0} 958,${y0 - 9} 958,${y0 + 9}`, class: 'sc-tickfill' });
    for (let v = Math.ceil(M.xmin / step - 1e-9) * step; v <= M.xmax + 1e-9; v += step) {
      const o = Math.abs(v) < 1e-9, lab = o || Math.abs(v % (M.lab || 1)) < 1e-9;
      mk_('line', { x1: X(v), x2: X(v), y1: y0 - (o ? 16 : 8), y2: y0 + (o ? 16 : 8), class: o ? 'sc-origin' : 'sc-tick', 'stroke-width': o ? 6 : 3 });
      if (lab) a.text(X(v), y0 + 44, o ? '$\\mathbf{O}$' : `$${Math.round(v)}$`, o ? 'sc-unit' : 'sc-num', 'c');
    }
    M.cars.forEach((car, i) => {
      const pos = ip(car.pts, t), yr = lanes[i];
      if (!s.bare && !s.hide) {
        for (let k = 0; k * M.dot <= t + 1e-9; k++) mk_('circle', { cx: X(ip(car.pts, k * M.dot)), cy: y0 + rows[i], r: 9, fill: car.color });
        mk_('circle', { cx: X(pos), cy: y0 + rows[i], r: 12, fill: 'none', stroke: car.color, 'stroke-width': 4 });
      }
      if (!s.hide) {
        const g = mk_('g', { transform: `translate(${X(pos)},${yr})` });
        mk_('path', { d: 'M -58 -16 L -58 -36 Q -58 -44 -50 -44 L -32 -44 L -20 -64 Q -16 -70 -8 -70 L 14 -70 Q 22 -70 26 -64 L 38 -46 L 50 -42 Q 60 -40 60 -30 L 60 -16 Z', fill: car.color, 'fill-opacity': .85, stroke: '#55636F', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
        mk_('path', { d: 'M -16 -46 L -6 -62 L 14 -62 L 24 -46 Z', fill: '#DCEBF5', stroke: '#55636F', 'stroke-width': 3 }, g);
        mk_('rect', { x: 50, y: -36, width: 10, height: 9, rx: 3, fill: '#F5D547' }, g);
        [-32, 32].forEach(x => { mk_('circle', { cx: x, cy: -14, r: 15, fill: '#2B3640', stroke: '#9AA8B4', 'stroke-width': 3 }, g); mk_('circle', { cx: x, cy: -14, r: 5, fill: '#9AA8B4' }, g); });
      }
    });
    if (!s.bare && s.read !== 'none') {
      a.text(960, 18, `$s\\ (\\text{${M.unit}})$`, 'sc-unit', 'e');
      a.text(40, 18, `$t=${num(t, Math.abs(t - Math.round(t)) < 0.005 ? 0 : 1)}\\ \\text{${M.tunit}}$`, 'sc-read', 'w');
      if (s.read === 'ts') M.cars.forEach((car, i) => a.text(300 + i * 270, 18, `$s_{${car.name}}=${num(ip(car.pts, t), M.sdp == null ? 0 : M.sdp)}\\ \\text{${M.unit}}$`, 'sc-read', 'w').style.color = car.color);
    }
  };
  function motionArt(el, kind, state, opts) {
    const W = 1000, H = strip(kind), sc = document.createElement('div'); sc.className = 'scene'; el.appendChild(sc);
    el.style.aspectRatio = W + ' / ' + H;
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene-svg', role: 'img', 'aria-label': opts.alt || kind }, sc);
    const labs = document.createElement('div'); labs.className = 'scene-labels'; sc.appendChild(labs);
    const grp = mk('g', {}, svg), a = { W, H, el: (t, at, p) => mk(t, at, p || grp),
      text(x, y, html, cls, anchor) { const d = document.createElement('div'); d.className = 'scene-text ' + (cls || '');
        d.style.left = (x / W * 100) + '%'; d.style.top = (y / H * 100) + '%';
        d.style.transform = { w: 'translate(0,-50%)', e: 'translate(-100%,-50%)', c: 'translate(-50%,-50%)' }[anchor || 'w'];
        d.innerHTML = prose(html); labs.appendChild(d); return d; } };
    MOTION[kind](a, Object.assign({ bare: true, t: 0 }, state || {}), opts.motion, opts.color || HANDLE_C);
  }
  function motionSlide(figEl, sp, shownFn) {
    const sc = sp.scene, M = sc.motion;
    const host = document.createElement('div'); host.style.cssText = 'display:contents'; figEl.appendChild(host);
    const sr = motionRow(host, sp.window, sc.kind, sc);
    let curT = 0, raf = 0, lastN = 0, prevN = 0;
    const g = sr.gh ? window.Lab.figure(sr.gh, sp, shownFn, { t: () => curT, M }) : { redraw() {} };
    /* v24 (U12 L2): a v-t graph with shaded area. The readout under the graph gives the area since state.areaFrom (default 0), live with the cursor. */
    const ai = (sp.items || []).find(i => i.kind === 'area'), ar = ai && document.createElement('div');
    if (ar) { ar.className = 'area-read'; if (sp.window.xtickBottom) ar.style.marginTop = '1.2em'; sr.row.appendChild(ar); }
    const areaText = (t, st) => { if (!ar) return; ar.style.visibility = st.read === 'none' ? 'hidden' : '';
      const a0 = st.areaFrom || 0, v = ip(M.area, t) - ip(M.area, a0), z = Math.abs(v) < 5e-3, whole = Math.abs(v - Math.round(v)) < 0.005 || Math.abs(v) >= 100;
      ar.innerHTML = math((a0 ? `\\text{area since } t=${a0}` : '\\text{area so far}') + ' = ' + (z || num(Math.abs(v), whole ? 0 : 1) === '0' ? '0' : (v > 0 ? '+' : '-') + num(Math.abs(v), whole ? 0 : 1)));
      ar.style.color = z ? '' : (v > 0 ? ai.posColor : ai.negColor); };
    const stateAt = n => { let st = {}; (sc.states || []).forEach(([k, v]) => { if (k <= n) st = v; }); return st; };
    const paint = (t, st) => { curT = t; g.redraw(); sr.draw(Object.assign({}, st, { t })); areaText(t, st); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    function run(from, to, st) {
      stop(); const dur = Math.abs(to - from) * (sc.sec || 1) / (window.LAB_SPEED || 1);
      if (reduced() || dur <= 0) { paint(to, st); return; }
      const t0 = performance.now(); paint(from, st);
      const frame = now => { const f = Math.min(1, (now - t0) / 1000 / dur); paint(from + (to - from) * f, st); raf = f < 1 ? requestAnimationFrame(frame) : 0; };
      raf = requestAnimationFrame(frame);
    }
    return { g, stop,
      redraw() { stop(); prevN = lastN; lastN = shownFn(); const st = stateAt(lastN); paint(st.t || 0, st); },
      enter(byNext) { const st = stateAt(shownFn()); if (byNext && sc.from != null && sc.from < (st.t || 0)) run(sc.from, st.t, st); },
      stepped() { const a = stateAt(prevN).t || 0, b = stateAt(lastN).t || 0; if (lastN === prevN + 1 && b > a) run(a, b, stateAt(lastN)); } };
  }
  /* recap lab (U12 L1): pick a motion, scrub or play it, and read it through s, v and a (graphs, sign diagrams, arrows on the car) */
  function motionSignsLab(container, init) {
    container.classList.add('lab', 'scenelab', 'mslab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const cases = init.cases; let ci = 0, v = 0, pl = null;
    const sc = { kind: 'track', layout: 'signs', alt: init.alt, color: init.color || HANDLE_C, motion: cases[0] };
    const sr = motionRow(left, { aspect: 2 }, 'track', sc);
    const grp = title => { const g = document.createElement('div'); g.className = 'lab-group';
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; g.appendChild(h); } right.appendChild(g); return g; };
    const C = () => cases[ci];
    const gp = grp('');
    window.Lab.toggle(gp, { options: cases.map(c => c.name), value: cases[0].name, onChange: nm => { ci = cases.findIndex(c => c.name === nm); sc.motion = C();
      if (pl) pl.stop(); po.max = C().T; po.seconds = C().seconds; sl.input.max = C().T; v = 0; sl.input.value = 0; showT(0); refresh(); } });
    const gt = grp('');
    const fmt = x => `${fx(x, 2)}\\ \\text{${C().tunit}}`;
    const showT = x => { const out = sl.input.parentNode.querySelector('output'); if (out) out.innerHTML = math(fmt(x)); };
    const sl = window.Lab.slider(gt, { min: 0, max: cases[0].T, step: 0.05, value: 0, label: 't', format: fmt,
      onChange: x => { v = x; if (pl && pl.playing()) pl.stop(); refresh(); } });
    ['pointerdown', 'keydown'].forEach(ev => sl.input.addEventListener(ev, () => pl && pl.stop()));
    const po = { min: 0, max: cases[0].T, seconds: cases[0].seconds, get: () => v, set: x => { v = x; sl.input.value = x; showT(x); refresh(); } };
    pl = player(gt, po);
    const gr = grp('Reading the motion');
    const val = k => ip(C()[k === 's' ? 'pts' : k + 'pts'], v), tex = x => { if (Math.abs(x) < 5e-4) return '0'; let r = fx(x, Math.abs(x) >= 100 ? 0 : 2); if (r.includes('.')) r = r.replace(/0+$/, '').replace(/\.$/, ''); return r; };
    const eps = k => 0.012 * C()[k + 'max'];
    const rs = window.Lab.readout(gr, () => { const x = val('s'); return `s=${tex(x)}\\ \\mathrm{${C().unit}}\\ \\ \\text{${Math.abs(x) < 0.5 * eps('s') ? 'at O' : x > 0 ? 'right of O' : 'left of O'}}`; });
    const rv = window.Lab.readout(gr, () => { const x = val('v'); return `v=${tex(x)}\\ \\mathrm{${C().vunit}}\\ \\ \\text{${Math.abs(x) < eps('v') ? 'at rest' : x > 0 ? 'moving right' : 'moving left'}}`; });
    const ra = window.Lab.readout(gr, () => { const x = val('a'); return `a=${tex(x)}\\ \\mathrm{${C().aunit}}\\ \\ \\text{${Math.abs(x) < eps('a') ? 'no pull' : x > 0 ? 'pulls right' : 'pulls left'}}`; });
    const rt = window.Lab.readout(gr, () => { const x = val('v'), y = val('a');
      if (Math.abs(x) < eps('v')) return `t=${fx(v, 1)}:\\ \\text{at rest: can turn round}`;
      if (Math.abs(y) < eps('a')) return `t=${fx(v, 1)}:\\ \\text{no pull: steady speed}`;
      return x * y > 0 ? `t=${fx(v, 1)}:\\ \\text{v, a agree: speeding up}` : `t=${fx(v, 1)}:\\ \\text{v, a disagree: slowing down}`; });
    const readouts = [rs, rv, ra, rt];
    function refresh() { sr.draw({ t: v, read: 'ts', arrows: true, show: 3, full: true }); readouts.forEach(r => r.update()); }
    refresh();
    const state = { controls: right, readouts, refresh, enter() { if (pl) pl.stop(); }, leave() { if (pl) pl.stop(); } };
    container.__lab = state;
    return state;
  }
  window.Lab.presets.motionSigns = motionSignsLab;

  /* recap lab (U12 L2): drag t1 and t2 along the t-axis (snap 0.5), switch between v and |v|, read the signed area and the total area.
     init = {window, T, vt: [[t, v], ...], F: [[n, d], ...] and G: [[n, d], ...] (signed area and area under |v| from 0 to t = k / 2, exact),
             posColor, negColor, start: [t1, t2], cards: [..3 strings..]} */
  function areaLab(container, init) {
    container.classList.add('lab', 'scenelab', 'arlab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const L = window.Lab, g = L.graph(left, init.window), vt = init.vt, T = init.T, Fr = L.Frac;
    let abs = false, seen = { v: true, abs: false };
    const Y = x => (abs ? Math.abs(ip(vt, x)) : ip(vt, x)), runs = L.areaRuns(vt);
    g.path(() => vt.filter(p => p[0] >= 0).map(p => [p[0], Y(p[0])]), { color: '#8A98A6' });
    runs.forEach(r => g.polygon(() => { const lo = Math.max(r.t0, A.x), hi = Math.min(r.t1, B.x); if (hi <= lo + 1e-9) return [];
      const ring = [{ x: lo, y: 0 }, { x: lo, y: Y(lo) }]; vt.forEach(([x]) => { if (x > lo + 1e-9 && x < hi - 1e-9) ring.push({ x, y: Y(x) }); });
      ring.push({ x: hi, y: Y(hi) }, { x: hi, y: 0 }); return ring; }, { color: r.sg > 0 ? init.posColor : init.negColor, opacity: 0.5 }));
    const h = () => 0;
    const A = g.point({ x: init.start[0], y: 0 }, { drag: true, snap: 0.5, name: 't1', onMove: p => { p.y = h(); p.x = Math.max(0, Math.min(B.x - 0.5, p.x)); refresh(); } });
    const B = g.point({ x: init.start[1], y: 0 }, { drag: true, snap: 0.5, name: 't2', onMove: p => { p.y = h(); p.x = Math.max(A.x + 0.5, Math.min(T, p.x)); refresh(); } });
    g.segment(() => ({ x: A.x, y: 0 }), () => ({ x: A.x, y: Y(A.x) }), { dashed: true });
    g.segment(() => ({ x: B.x, y: 0 }), () => ({ x: B.x, y: Y(B.x) }), { dashed: true });
    g.label(() => A.x, 0, 't_1', { anchor: 'sw' }); g.label(() => B.x, 0, 't_2', { anchor: 'se' });
    const grp = title => { const d = document.createElement('div'); d.className = 'lab-group';
      if (title) { const q = document.createElement('div'); q.className = 'lab-group-title'; q.innerHTML = title; d.appendChild(q); } right.appendChild(d); return d; };
    const ga = grp('Area between the cursors');
    L.toggle(ga, { options: ['v', '|v|'], value: 'v', onChange: o => { abs = o === '|v|'; seen[abs ? 'abs' : 'v'] = true; refresh(); } });
    const k = x => Math.round(x * 2), sg = (arr, i) => new Fr(arr[i][0], arr[i][1]);
    const dec = f => { const v = +f; return (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace(/0+$/, '')).replace('-', '−'); };
    const show = f => (f.d === 1 ? dec(f) : f.tex() + '\\approx ' + dec(f));
    const rt = L.readout(ga, () => `\\text{showing }${abs ? '|v|' : 'v'}:\\quad t_1=${A.x},\\ t_2=${B.x}`);
    const rs = L.readout(ga, () => `\\text{signed area}=${show(sg(init.F, k(B.x)).sub(sg(init.F, k(A.x))))}`);
    const ru = L.readout(ga, () => `\\text{total area}=${show(sg(init.G, k(B.x)).sub(sg(init.G, k(A.x))))}`);
    const gc = grp('');
    const cards = init.cards.map(txt => { const c = document.createElement('div'); c.className = 'ar-card'; gc.appendChild(c); return [c, txt]; });
    const paintCards = () => { const open = [seen.v, seen.abs, seen.v && seen.abs];
      cards.forEach(([c, txt], i) => { c.classList.toggle('on', open[i]); c.innerHTML = open[i] ? prose(txt) : '<span class="ar-lock">' + ['Switch to v', 'Switch to |v|', 'Use both'][i] + '</span>'; }); };
    const readouts = [rt, rs, ru];
    function refresh() { g.redraw(); readouts.forEach(r => r.update()); paintCards(); }
    refresh();
    const state = { g, controls: right, readouts, refresh, enter() {}, leave() {} };
    container.__lab = state;
    return state;
  }
  window.Lab.presets.areaLab = areaLab;

  /* recap lab (U12 L3): a(t) is fixed. Two known values (v and s at chosen times) are set with sliders, and the working finds the constants of
     integration C and D, then s(t). A toggle moves the known values from t = 0 to t = t1 and t = t2. The a-t, v-t and s-t panels follow.
     init = {T, a, t0, modes: {start: {t1, t2, v, s}, known: {t1, t2, v, s}}, v: {min, max, step}, s: {min, max, step}, colors: {a, v, s, pos, neg}, prompt} */
  function ladderLab(container, init) {
    container.classList.add('lab', 'scenelab', 'mslab', 'llab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const L = window.Lab, T = init.T || 6, K = init.colors, ac = init.a;
    let mode = 'start', vk = init.modes.start.v, sk = init.modes.start.s, v = init.t0 == null ? 3 : init.t0, pl = null, moved = { v: false, s: false };
    const trim = x => String(+(+x).toFixed(3)), minus = s => s.replace(/-/g, '−');
    const md = () => init.modes[mode];
    const consts = () => { const m = md(), C = vk - ac * m.t1, D = sk - (ac * m.t2 * m.t2 / 2 + C * m.t2); return { C, D, u: C, s0: D, m }; };
    const niceCeil = x => { if (x <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(x))), q = x / p; return (q <= 1 ? 1 : q <= 2 ? 2 : q <= 5 ? 5 : 10) * p; };
    const range = arr => { const lo = Math.min(0, ...arr), hi = Math.max(0, ...arr); let ymax = hi > 0 ? niceCeil(hi * 1.1) : 0, ymin = lo < 0 ? -niceCeil(-lo * 1.1) : 0; if (ymax - ymin < 1e-9) ymax = 1; return [ymin, ymax]; };
    function build() {
      const { u, s0 } = consts(), N = Math.round(T / 0.05), ap = [], vp = [], sp = [], aa = [], da = [];
      for (let i = 0; i <= N; i++) { const t = +(i * 0.05).toFixed(2); ap.push([t, ac]); vp.push([t, u + ac * t]); sp.push([t, s0 + u * t + ac * t * t / 2]); da.push([t, u * t + ac * t * t / 2]); aa.push([t, ac * t]); }
      const ser = (pts, area, col) => ({ pts, area, color: col, posColor: K.pos, negColor: K.neg });
      const ra = range(ap.map(q => q[1])), rv = range(vp.map(q => q[1])), rs = range(sp.map(q => q[1]));
      const lo = Math.min(0, ...sp.map(q => q[1])), hi = Math.max(0, ...sp.map(q => q[1])), span = Math.max(hi - lo, 1);
      const lo2 = lo - span * 0.08, hi2 = hi + span * 0.08, step = [1, 2, 5, 10, 20, 50, 100].find(q => (hi2 - lo2) / q <= 10);
      return { T, ts: 1, pts: sp, dot: 1, unit: 'm', tunit: 's', sdp: 1, xmin: Math.floor(lo2 / step) * step, xmax: Math.ceil(hi2 / step) * step, lab: step, step: step < 2 ? 1 : step / 2,
        panels: { a: { ymin: ra[0], ymax: ra[1], dp: 1, dname: '\\Delta v', series: [ser(ap, aa, K.a)] },
                  v: { ymin: rv[0], ymax: rv[1], dp: 1, dname: '\\Delta s', series: [ser(vp, da, K.v)] },
                  s: { ymin: rs[0], ymax: rs[1], dp: 1, series: [{ pts: sp, color: K.s }] } } };
    }
    const sc = { kind: 'track', layout: 'ladder', alt: init.alt, color: init.color || HANDLE_C, motion: build() };
    const sr = motionRow(left, { aspect: 2 }, 'track', sc);
    const grp = title => { const g = document.createElement('div'); g.className = 'lab-group';
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; g.appendChild(h); } right.appendChild(g); return g; };
    const gs = grp('Known values at');
    const rebuild = () => { sc.motion = build(); refresh(); };
    const names = () => (mode === 'start' ? ['v(0)', 's(0)'] : ['v(' + md().t1 + ')', 's(' + md().t2 + ')']);
    L.toggle(gs, { options: ['t = 0', 't = ' + init.modes.known.t1 + ', ' + init.modes.known.t2], value: 't = 0', onChange: o => {
      mode = o === 't = 0' ? 'start' : 'known'; vk = md().v; sk = md().s; sv.input.value = vk; ss.input.value = sk;
      sv.set(vk); ss.set(sk); labs(); } });
    const sv = L.slider(gs, { min: init.v.min, max: init.v.max, step: init.v.step, value: vk, label: 'v', format: x => `${trim(x)}`, onChange: x => { vk = x; moved.v = true; rebuild(); } });
    const ss = L.slider(gs, { min: init.s.min, max: init.s.max, step: init.s.step, value: sk, label: 's', format: x => `${trim(x)}`, onChange: x => { sk = x; moved.s = true; rebuild(); } });
    const labs = () => { const [a, b] = names(); sv.input.parentNode.querySelector('label').innerHTML = math(a); ss.input.parentNode.querySelector('label').innerHTML = math(b); };
    const showT = x => { const out = st.input.parentNode.querySelector('output'); if (out) out.innerHTML = math(`${fx(x, 2)}\\ \\text{s}`); };
    const st = L.slider(gs, { min: 0, max: T, step: 0.05, value: v, label: 't', format: x => `${fx(x, 2)}\\ \\text{s}`, onChange: x => { v = x; if (pl && pl.playing()) pl.stop(); refresh(); } });
    ['pointerdown', 'keydown'].forEach(ev => st.input.addEventListener(ev, () => pl && pl.stop()));
    const po = { min: 0, max: T, seconds: 6, get: () => v, set: x => { v = x; st.input.value = x; showT(x); refresh(); } };
    pl = player(gs, po);
    const gr = grp('The working');
    const term = (c, p) => { if (Math.abs(c) < 1e-9) return ''; const ab = Math.abs(c); return (c < 0 ? '-' : '+') + (ab === 1 && p ? '' : trim(ab)) + p; };
    const poly = cs => minus((term(cs[0], '') + term(cs[1], 't') + term(cs[2], 't^{2}')).replace(/^\+/, '') || '0');
    const aT = () => (ac === 1 ? '' : trim(ac));
    const r1 = document.createElement('div'); r1.className = 'lab-fixed'; r1.innerHTML = math(`v(t)=\\int ${trim(ac)}\\,dt=${aT()}t+C`); gr.appendChild(r1);
    const r2 = L.readout(gr, () => { const { C, m } = consts(); return minus(`v(${m.t1})=${trim(ac)}(${m.t1})+C:\\ ${trim(vk)}=${trim(ac * m.t1)}+C\\ \\Rightarrow\\ C=${trim(C)}`); });
    const r3 = L.readout(gr, () => { const { C } = consts(); return minus(`s(t)=\\int(${poly([C, ac, 0])})\\,dt=${poly([0, C, ac / 2])}+D`); });
    const r4 = L.readout(gr, () => { const { C, D, m } = consts(); const q = ac / 2, cs = C < 0 ? `-${trim(-C)}` : `+${trim(C)}`;
      return minus(`s(${m.t2})=${q === 1 ? '' : trim(q)}${m.t2}^{2}${cs}(${m.t2})+D:\\ ${trim(sk)}=${trim(ac * m.t2 * m.t2 / 2 + C * m.t2)}+D\\ \\Rightarrow\\ D=${trim(D)}`); });
    const r5 = L.readout(gr, () => { const { C, D } = consts(); const tt = fx(v, 2).replace(/\.?0+$/, ''); return minus(`s(t)=${poly([D, C, ac / 2])}:\\ s(${tt})=${trim(+(D + C * v + ac * v * v / 2).toFixed(2))}`); });
    const readouts = [r2, r3, r4, r5];   /* r1 is the same for every slider position */
    function refresh() { sr.draw({ t: v, read: 'ts', show: 3, shade: ['a', 'v'], areas: ['a', 'v'], vals: ['a', 'v', 's'] }); readouts.forEach(r => r.update()); }
    labs(); refresh();
    const state = { controls: right, readouts, refresh, enter() { if (pl) pl.stop(); }, leave() { if (pl) pl.stop(); } };
    container.__lab = state;
    return state;
  }
  window.Lab.presets.ladderLab = ladderLab;
  window.Lab.motionSlide = motionSlide;
  window.Lab.sceneRow = sceneRow;
  window.Lab.sceneArt = sceneArt;

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
      /* v22: what / why may be lists (bullets); exp may be a list of steps, each a string or [string, [sub-steps]] (a notepad procedure) */
      [[(init.headings || [])[0] || 'What grows', it.what], [(init.headings || [])[1] || 'Why it levels off', it.why]].forEach(([h, t]) => { const q = mk('cat-q'); q.appendChild(mk('cat-h', 'span', h));
        if (Array.isArray(t)) { const ul = mk('', 'ul'); t.forEach(x => { const li = mk('', 'li'); li.innerHTML = prose(x); ul.appendChild(li); }); q.appendChild(ul); }
        else q.appendChild(mk('', 'p', t)); main.appendChild(q); });
      if (Array.isArray(it.exp)) {
        exp.classList.add('pad');
        const top = mk('pad-top'); top.appendChild(mk('', 'span', 'How could I conduct an experiment to measure?')); top.appendChild(mk('', 'span', 'Procedure')); exp.appendChild(top);
        const bodyp = mk('pad-body'), ol = mk('', 'ol');
        it.exp.forEach(stp => { const li = mk('', 'li'), [txt, subs] = Array.isArray(stp) ? stp : [stp, null];
          const sp = mk('', 'span'); sp.innerHTML = prose(txt); li.appendChild(sp);
          if (subs && subs.length) { const o2 = mk('', 'ol'); subs.forEach(x => { const l2 = mk('', 'li'); l2.innerHTML = prose(x); o2.appendChild(l2); }); li.appendChild(o2); }
          ol.appendChild(li); });
        bodyp.appendChild(ol); exp.appendChild(bodyp);
      } else { exp.appendChild(mk('cat-h', 'span', 'How could I conduct an experiment to measure?')); exp.appendChild(mk('', 'p', it.exp)); }
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
  /* ---------- MAI HL U5 L6: scatter title-card art and the scatter lab (Ben, 31/10/2026, v2) ----------
     scatterArt: a square drawing of the scene's own graph (state.win = the graph window, state.pts in data units,
       state.cols optional, state.xname / state.yname the axis names as TeX).
     scatterLab: one lab for every correlation scene.
       init.window                 graph window (xname / yname name the variables of the story)
       init.sets  [{name, pts:[[x,y]..]}]  datasets; a toggle switches between them. A set with {x, noise, ymean, ysd}
                                    is an r-set: its points are rebuilt so that Pearson's r equals the slider exactly
       init.start                  name of the set shown first
       init.rslider {min,max,step,start,seconds,auto}   slider for r (r-sets only), autoplays once on arrival by Next
       init.fit                    draw the least-squares line of the points shown
       init.extra  {at:[x,y], on:bool, toggle:bool}   one more draggable point (an outlier)
       init.dragIndex              the index of one data point that becomes draggable (an athlete)
       init.rs                     show r_s as well as r (ranks average ties)
       init.cards                  show the four recap cards */
  function scatterArt(sc, s, opts) {
    const W = 1000, w = s.win || { xmin: 0, xmax: 1, ymin: 0, ymax: 1 };
    const host = sc.parentNode; host.style.aspectRatio = '1 / 1'; host.style.height = 'min(50cqh, 60cqw)';
    const svg = mk('svg', { viewBox: `0 0 ${W} ${W}`, class: 'scene-svg', role: 'img', 'aria-label': opts.alt || 'scatter diagram' }, sc);
    const labs = document.createElement('div'); labs.className = 'scene-labels'; sc.appendChild(labs);
    const X = x => 40 + (x - w.xmin) / (w.xmax - w.xmin) * (W - 80), Y = y => W - 40 - (y - w.ymin) / (w.ymax - w.ymin) * (W - 80);
    const ax = Math.max(X(0), X(w.xmin)), ay = Math.min(Y(0), Y(w.ymin));
    mk('line', { x1: ax, y1: ay, x2: W - 20, y2: ay, class: 'sc-tick', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
    mk('line', { x1: ax, y1: ay, x2: ax, y2: 20, class: 'sc-tick', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
    (s.pts || []).forEach((p, i) => mk('circle', { cx: X(p[0]), cy: Y(p[1]), r: 24, fill: (s.cols && s.cols[i]) || CURVE_C }, svg));
    const lab = (x, y, t, anchor) => { const d = document.createElement('div'); d.className = 'scene-text sc-unit';
      d.style.left = (x / W * 100) + '%'; d.style.top = (y / W * 100) + '%'; d.style.transform = anchor; d.innerHTML = math(t); labs.appendChild(d); };
    if (s.xname) lab(W - 20, ay - 12, s.xname, 'translate(-100%,-100%)');
    if (s.yname) lab(ax + 24, 30, s.yname, 'translate(0,0)');
  }
  const rankOf = v => { const idx = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const r = new Array(v.length); let i = 0;
    while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1; } return r; };
  const meanOf = v => v.reduce((a, b) => a + b, 0) / v.length;
  const pearsonR = (x, y) => { const mx = meanOf(x), my = meanOf(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; } return sxy / Math.sqrt(sxx * syy); };
  /* r-set: standardised x, and a noise vector made exactly uncorrelated with x and scaled to unit spread */
  function rSetBasis(set) {
    const x = set.x, n = x.length, mx = meanOf(x), sx = Math.sqrt(x.reduce((a, b) => a + (b - mx) * (b - mx), 0) / n);
    const zx = x.map(v => (v - mx) / sx), e = set.noise, me = meanOf(e);
    const c = e.reduce((a, v, i) => a + (v - me) * zx[i], 0) / n;
    const res = e.map((v, i) => v - me - c * zx[i]), sr = Math.sqrt(res.reduce((a, b) => a + b * b, 0) / n);
    return { zx, ew: res.map(v => v / sr) };
  }
  function scatterLab(container, init) {
    container.classList.add('lab', 'scenelab', 'scatlab'); if (init.cards) container.classList.add('famlab');
    const left = document.createElement('div'); left.className = 'lab-left';
    const right = document.createElement('div'); right.className = 'lab-controls';
    container.appendChild(left); container.appendChild(right);
    const w = init.window, g = Lab.graph(left, w), sets = init.sets, SC = [0.25, 0.5, 0.75, 0.9];
    sets.forEach(s => { if (s.x) s.basis = rSetBasis(s); });
    const RS = init.rslider;
    let cur = sets.find(s => s.name === init.start) || sets[0], sp = RS ? RS.start : 0;
    let extraOn = init.extra ? init.extra.on !== false : false;
    const maxN = Math.max(...sets.map(s => s.x ? s.x.length : s.pts.length));
    let P = [];
    const load = () => { if (cur.x) { const b = cur.basis, k = Math.sqrt(Math.max(0, 1 - sp * sp));
        P = cur.x.map((x, i) => [x, cur.ymean + cur.ysd * (sp * b.zx[i] + k * b.ew[i])]); }
      else P = cur.pts.map(p => p.slice()); };
    load();
    const ex = init.extra ? { x: init.extra.at[0], y: init.extra.at[1] } : null;
    const hs = [];
    for (let i = 0; i < maxN; i++) {
      const dragIt = init.dragIndex != null && i === init.dragIndex;
      hs.push(g.point({ x: 0, y: 0 }, dragIt ? { drag: true, snap: 0, name: 'athlete', onMove: q => { P[i][0] = q.x; P[i][1] = q.y; refresh(); },
        visible: () => i < P.length } : { color: CURVE_C, visible: () => i < P.length }));
    }
    const eh = ex ? g.point({ x: ex.x, y: ex.y }, { drag: true, snap: 0, name: 'extra point', visible: () => extraOn,
      onMove: q => { ex.x = q.x; ex.y = q.y; refresh(); } }) : null;
    const xs = () => P.map(p => p[0]).concat(extraOn && ex ? [ex.x] : []), ys = () => P.map(p => p[1]).concat(extraOn && ex ? [ex.y] : []);
    const R = () => pearsonR(xs(), ys()), RSP = () => pearsonR(rankOf(xs()), rankOf(ys()));
    const line = () => { const x = xs(), y = ys(), mx = meanOf(x), my = meanOf(y); let sxy = 0, sxx = 0;
      for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); }
      const a = sxy / sxx; return { a, b: my - a * mx }; };
    if (init.fit) g.line(() => ({ x: w.xmin, y: line().a * w.xmin + line().b }), () => ({ x: w.xmax, y: line().a * w.xmax + line().b }), { color: RED_C });
    const word = r => { const a = Math.abs(r), d = r < 0 ? 'negative' : 'positive';
      return a < SC[0] ? 'very weak' : a < SC[1] ? `weak ${d}` : a < SC[2] ? `moderate ${d}` : a < SC[3] ? `strong ${d}` : `very strong ${d}`; };
    const grp = (title, cls) => { const s = document.createElement('div'); s.className = 'lab-group' + (cls ? ' ' + cls : '');
      if (title) { const h = document.createElement('div'); h.className = 'lab-group-title'; h.innerHTML = title; s.appendChild(h); } right.appendChild(s); return s; };
    let pl = null, slider = null;
    if (sets.length > 1) { const gd = grp('Data');
      Lab.toggle(gd, { options: sets.map(s => s.name), value: cur.name, onChange: n => { cur = sets.find(s => s.name === n); load(); refresh(); } }); }
    if (RS) { const gs = grp('Correlation');
      slider = Lab.slider(gs, { min: RS.min, max: RS.max, step: RS.step, value: sp, label: 'r', format: v => fx(v, 2),
        onChange: v => { sp = v; load(); refresh(); } });
      ['pointerdown', 'keydown'].forEach(ev => slider.input.addEventListener(ev, () => pl && pl.stop()));
      pl = player(gs, { min: RS.min, max: RS.max, seconds: RS.seconds || 8, get: () => sp,
        set: v => { sp = Math.round(v * 100) / 100; slider.input.value = sp; const out = slider.input.parentNode.querySelector('output'); if (out) out.innerHTML = math(fx(sp, 2)); load(); refresh(); } }); }
    if (init.extra && init.extra.toggle) { const ge = grp('Extra point');
      Lab.toggle(ge, { options: ['Off', 'On'], value: extraOn ? 'On' : 'Off', onChange: v => { extraOn = v === 'On'; refresh(); } }); }
    const gr = grp('Readings');
    const readouts = [Lab.readout(gr, () => `r=${fx(R(), 3)}`)];
    if (init.rs) readouts.push(Lab.readout(gr, () => `r_s=${fx(RSP(), 3)}`));
    let slots = [];
    if (init.cards) {
      const gc = document.createElement('div'); gc.className = 'fam-cards'; container.appendChild(gc);
      gc.innerHTML = '<div class="fc-head">Recap cards</div>';
      for (let i = 0; i < 4; i++) { const d = document.createElement('div'); d.className = 'fam-card'; gc.appendChild(d); slots.push(d); }
    }
    const cardsNow = () => { const r = R(), s = RSP(), out = [];
      out.push({ title: 'Strength and direction', tone: 'curve', line: `$r=${fx(r, 2)}$ is ${word(r)}. Closer to $\\pm 1$ means a tighter straight-line pattern.` });
      out.push(init.rs && s - r > 0.03
        ? { title: '$r_s$ is larger than $r$', tone: 'ans', line: 'This suggests the data rise (or fall) steadily but along a curve, or that an extreme point is dragging $r$ down. Check the scatter.' }
        : { title: 'Compare $r$ and $r_s$', line: init.rs ? 'When $r_s$ is not clearly larger than $r$, the straight-line fit is doing about as well as the ranks.' : 'Show $r_s$ in the next scene.' });
      out.push({ title: '$r$ measures straight lines', line: 'A relationship can always rise and still score below $1$ if it curves.' });
      out.push({ title: 'Correlation is not causation', tone: 'red', line: 'A strong $r$ says the variables move together. It does not say one causes the other.' });
      return out; };
    function refresh() {
      hs.forEach((h, i) => { if (i < P.length) { h.x = P[i][0]; h.y = P[i][1]; } });
      if (eh) { eh.x = ex.x; eh.y = ex.y; }
      g.redraw(); readouts.forEach(r => r.update());
      if (slots.length) { const cs = cardsNow(); slots.forEach((d, i) => { const c = cs[i]; d.className = 'fam-card' + (c ? ' t-' + (c.tone || 'none') : ' empty');
        d.innerHTML = c ? `<div class="fc-t">${prose(c.title)}</div><div class="fc-l">${prose(c.line)}</div>` : ''; }); }
    }
    refresh();
    const state = { g, controls: right, readouts, refresh,
      enter(byNext) { if (!pl) return; pl.stop(); if (byNext && RS.auto && !reduced()) pl.play(true); },
      leave() { if (pl) pl.stop(); } };
    container.__lab = state;
    return state;
  }

  window.Lab.presets.catalogue = catalogue;
  window.Lab.presets.scatterLab = scatterLab;
  window.Lab.presets.logisticLab = logisticLab;
  window.Lab.scenes = SCENES;
  window.Lab.presets.coffeeScene = coffeeScene;
  window.Lab.presets.sceneLab = sceneLab;
  window.Lab.presets.growthFamily = growthFamily;
})();
