/* ===== gdc slide: fx-CG50 keys and screens (renderer after the fx-CG50 Skill Finder) ===== */
const GDC = (() => {
  const K = { F1:'F1',F2:'F2',F3:'F3',F4:'F4',F5:'F5',F6:'F6',SHIFT:'SHIFT',OPTN:'OPTN',VARS:'VARS',MENU:'MENU',ALPHA:'ALPHA',
    SQR:'x²',POW:'^',EXIT:'EXIT',XTT:'X,θ,T',LOG:'log',LN:'ln',SIN:'sin',COS:'cos',TAN:'tan',FRAC:'▫⁄▫',SD:'S⇔D',LP:'(',RP:')',
    COMMA:',',STO:'→',DEL:'DEL',AC:'AC/ON',MUL:'×',DIV:'÷',ADD:'+',SUB:'−',DOT:'.',EXP:'×10ˣ',NEG:'(−)',EXE:'EXE',
    UP:'▲',DOWN:'▼',LEFT:'◀',RIGHT:'▶',0:'0',1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9' };
  const MENU_ITEMS = [
    ['RUN','Run-Matrix','1','#3f6fd8','×÷'],['STAT','Statistics','2','#d6662c','x̄'],['EACT','eActivity','3','#6b7a99','e'],
    ['SSHT','Spreadsheet','4','#2e9a5a','▦'],['GRAPH','Graph','5','#1d8fc2','∿'],['DYNA','Dyna Graph','6','#8a55d4','∿∿'],
    ['TABLE','Table','7','#4b8b3b','▤'],['RECUR','Recursion','8','#b6487a','aₙ'],['CONIC','Conic Graphs','9','#c2582f','◯'],
    ['EQUA','Equation','A','#2f5ec4','='],['PRGM','Program','B','#55607a','{ }'],['FIN','Financial','C','#2f8f6e','$']];
  const dk = c => '#' + [1,3,5].map(i => Math.round(parseInt(c.slice(i,i+2),16)*0.72).toString(16).padStart(2,'0')).join('');
  const e = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* step markup: [KEY] is a key chip, {-2.5} a typed entry (Skill Finder syntax) */
  const step = t => t.replace(/\[([A-Z0-9]+)\]|\{([^}]+)\}/g, (m, k, v) =>
    k ? `<span class="kc">${e(K[k] || k)}</span>` : `<span class="entry">${e(v.replace(/^-/, '−'))}</span>`);
  /* keys a step presses, in order: [KEY] as named; a typed {entry} lights its digits, DOT, and NEG for a leading minus */
  const keysOf = t => { const out = [];
    t.replace(/\[([A-Z0-9]+)\]|\{([^}]+)\}/g, (m, k, v) => { if (k) out.push(k);
      else [...v].forEach((c, i) => { if (/[0-9]/.test(c)) out.push(c); else if (c === '.') out.push('DOT'); else if (c === '-') out.push(i ? 'SUB' : 'NEG'); }); });
    return out; };
  /* keypad: the keys of the body capture (region 34,480 560x776 of calc_body.webp); each key is a transparent box placed at its centre, in % of that region */
  const KW = 560, KH = 776, KX = { F:[60,148,236,324,410,498], A:[64,148,236,320], C6:[66,148,236,322,410,496], C5:[66,174,280,384,488] };
  const KP = {}; const put = (ids, xs, y, w, h) => ids.forEach((id, i) => { KP[id] = [xs[i], y, w, h]; });
  put(['F1','F2','F3','F4','F5','F6'], KX.F, 66, 54, 50);
  put(['SHIFT','OPTN','VARS','MENU'], KX.A, 146, 80, 42); put(['ALPHA','SQR','POW','EXIT'], KX.A, 216, 80, 42);
  KP.UP = [458,128,40,40]; KP.DOWN = [458,212,40,40]; KP.LEFT = [414,170,40,40]; KP.RIGHT = [502,170,40,40];
  put(['XTT','LOG','LN','SIN','COS','TAN'], KX.C6, 300, 82, 42); put(['FRAC','SD','LP','RP','COMMA','STO'], KX.C6, 370, 82, 42);
  put(['7','8','9','DEL','AC'], KX.C5, 464, 94, 52); put(['4','5','6','MUL','DIV'], KX.C5, 552, 94, 52);
  put(['1','2','3','ADD','SUB'], KX.C5, 636, 94, 52); put(['0','DOT','EXP','NEG','EXE'], KX.C5, 724, 94, 52);
  const keypad = () => `<div class="kimg">${Object.entries(KP).map(([id, [x, y, w, h]]) =>
    `<span class="hk" data-k="${id}" style="left:${(100 * x / KW).toFixed(2)}%;top:${(100 * y / KH).toFixed(2)}%;width:${(100 * w / KW).toFixed(2)}%;height:${(100 * h / KH).toFixed(2)}%"></span>`).join('')}</div>`;
  const light = (box, keys) => {
    box.querySelectorAll('.hk').forEach(el => { el.classList.remove('lit'); el.querySelector('.badge')?.remove(); });
    const order = {}; keys.forEach((k, i) => (order[k] = order[k] || []).push(i + 1));
    Object.entries(order).forEach(([k, n]) => { const el = box.querySelector(`.hk[data-k="${k}"]`); if (!el) return;
      el.classList.add('lit'); if (keys.length > 1){ const b = document.createElement('span'); b.className = 'badge';
        b.textContent = n.length > 2 ? `${n[0]}…` : n.join(','); el.appendChild(b); } });
  };
  const fk = f => `<div class="fk">${(f || []).concat(Array(6).fill('')).slice(0, 6).map(x => `<span>${e(x)}</span>`).join('')}</div>`;
  const sb = s => `<div class="sb"><span class="bat"></span><span>${e(s || '')}</span></div>`;
  const msg = m => m ? `<div class="msg">${e(m)}<small>Press:[EXIT]</small></div>` : '';
  const S = {
    menu(s){ return `<div class="menu">${MENU_ITEMS.map(m => `<div class="ic ${m[0] === s.sel ? 'sel' : ''}"><span class="g" style="background:${dk(m[3])}">${m[4]}<small>${m[2]}</small></span>${e(m[1])}</div>`).join('')}</div>`; },
    run(){ return '<div class="hist"><div class="in"><span class="cur"></span></div></div>'; },
    form(s){ const n = 5, st = Math.max(0, Math.min((s.sel || 0) - n + 2, s.rows.length - n));
      return `<div class="ttl">${e(s.title)}</div>` + s.rows.slice(st, st + n).map((r, i) =>
        `<div class="row ${st + i === s.sel ? 'sel' : ''}"><span>${e(r[0])} :</span><span class="v">${e(r[1])}</span></div>`).join(''); },
    yeq(s){ const cols = ['var(--plot1)', 'var(--plot2)', '#1e9e4a', '#b25bd6'];
      return `<div class="ttl">${e(s.title || 'Graph Func :Y=')}</div><div class="yeq">` + s.items.map((it, i) => {
        const has = !!it[1], on = has && it[2] !== 'off' && !it[1].includes('cur');
        return `<div class="row ${i === s.sel ? 'sel' : ''}"><span><span class="sw" style="background:${has ? cols[i] : 'transparent'}"></span>${e(it[0])}${has ? `<span class="eq ${on ? 'on' : ''}">=</span>` : ':'}</span><span class="v">${it[1]}</span></div>`; }).join('') + '</div>'; },
    graph(s){
      const [x0, x1, y0, y1] = s.win, W = 384, H = 150;
      const X = x => (x - x0) / (x1 - x0) * W, Y = y => H - (y - y0) / (y1 - y0) * H, cols = ['var(--plot1)', 'var(--plot2)'];
      let g = '';
      if (y0 <= 0 && y1 >= 0) g += `<line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="#111"/>`;
      if (x0 <= 0 && x1 >= 0) g += `<line y1="0" y2="${H}" x1="${X(0)}" x2="${X(0)}" stroke="#111"/>`;
      const nice = sp => { const r = sp / 10, p = 10 ** Math.floor(Math.log10(r)); return [1, 2, 5, 10].map(m => m * p).find(v => v >= r); };
      const sx = nice(x1 - x0), sy = nice(y1 - y0);
      if (y0 <= 0 && y1 >= 0) for (let i = Math.ceil(x0 / sx) * sx; i <= x1; i += sx) if (Math.abs(i) > 1e-9) g += `<line x1="${X(i)}" x2="${X(i)}" y1="${Y(0) - 2.5}" y2="${Y(0) + 2.5}" stroke="#111"/>`;
      if (x0 <= 0 && x1 >= 0) for (let i = Math.ceil(y0 / sy) * sy; i <= y1; i += sy) if (Math.abs(i) > 1e-9) g += `<line y1="${Y(i)}" y2="${Y(i)}" x1="${X(0) - 2.5}" x2="${X(0) + 2.5}" stroke="#111"/>`;
      s.curves.forEach((pts, i) => { let d = '', pen = false;
        pts.forEach(([x, y]) => { if (y === null || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) { pen = false; return; } d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`; pen = true; });
        g += `<path d="${d}" fill="none" stroke="${cols[i % 2]}" stroke-width="2"/>`; });
      if (s.box){ const [a, b, c, d] = s.box; g += `<rect x="${Math.min(X(a), X(c))}" y="${Math.min(Y(b), Y(d))}" width="${Math.abs(X(c) - X(a))}" height="${Math.abs(Y(d) - Y(b))}" fill="none" stroke="#111" stroke-width="1.4" stroke-dasharray="5 3"/>`; }
      if (s.mark){ const mx = X(s.mark[0]), my = Y(s.mark[1]);
        g += `<line x1="${mx - 7}" x2="${mx + 7}" y1="${my}" y2="${my}" stroke="#111" stroke-width="1.4"/><line y1="${my - 7}" y2="${my + 7}" x1="${mx}" x2="${mx}" stroke="#111" stroke-width="1.4"/><circle cx="${mx}" cy="${my}" r="3.2" fill="#111"/>`; }
      let h = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="gc"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#gc)">${g}</g></svg>`;
      if (s.head) h += `<div class="gtext" style="top:1cqw">${e(s.head)}</div>`;
      if (s.foot) h += `<div class="gtext" style="bottom:.6cqw">${s.foot.map(e).join('&ensp;&ensp;')}</div>`;
      return h;
    },
  };
  const img = s => `<div class="shot"><img src="${s.src}" alt="${e(s.alt || 'Calculator screen')}">${(s.labels || []).map(l => `<span class="lbl${l[4] === "MAIN MENU" ? " t" : ""}" style="left:${l[0]}%;top:${l[1]}%;width:${l[2]}%;height:${l[3]}%${l[5] ? `;background:${l[5]}` : ''}">${e(l[4])}</span>`).join('')}${s.hl ? `<span class="hl" style="left:${s.hl[0]}%;top:${s.hl[1]}%;width:${s.hl[2]}%;height:${s.hl[3]}%"></span>` : ''}</div>`;
  const lcd = s => s && s.type === 'img' ? img(s) : s ? `${sb(s.sb)}<div class="scr"${s.type === 'graph' ? ' style="padding:0"' : ''}>${(S[s.type] || (() => ''))(s)}${msg(s.msg)}</div>${fk(s.fk)}` : '';
  return { step, lcd, keysOf, keypad, light, BODY:'__CALCBODY__' };
})();
