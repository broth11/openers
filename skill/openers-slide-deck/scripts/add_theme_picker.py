#!/usr/bin/env python3
"""Add a live theme picker to a deck built from this kit (called by build_deck.py; no need to run it by hand).

The deck is built in the template's own skyblue look. This module appends:
  1. one <style id="skin-css"> with the other themes, generated from assets/themes/*.css (every selector
     prefixed with html:root[data-skin="NAME"]); skyblue is the untouched base, so a page with no data-skin
     looks exactly as a plain skyblue build
  2. an early <script id="skin-early"> that sets data-skin (stored choice, ?skin=NAME, else the build's theme)
     before the engine measures anything
  3. \\gr / \\bl KaTeX macros become \\htmlClass{sk-gr} / \\htmlClass{sk-bl} (CSS-coloured, so a theme change
     recolours maths without a re-render)
  4. a late <script id="skin-js">: palette button + menu in the bottom toolbar, the T / Shift+T keys, a help row,
     and recolouring of the graph colours by role inside the lab SVGs
"""
import json, re
from pathlib import Path

THEMES = Path(__file__).resolve().parent.parent / 'assets' / 'themes'

# order shown in the selector; skyblue is the page's own look
SKINS = [
    ('skyblue',   'Sky blue'),
    ('3b1b',      '3b1b'),
    ('goldteal',  'Gold-teal'),
    ('bluebrown', 'Blue-brown'),
    ('greengrey', 'Green-grey'),
]

def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

def split_rules(css):
    """yield (selector, body) for top-level rules; at-rules (@container ...) are dropped"""
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            depth += {'{': 1, '}': -1}.get(css[k], 0)
            k += 1
        body = css[j + 1:k - 1]
        i = k
        if sel.startswith('@'):
            continue
        yield sel, body.strip()

def skin_css(name):
    css = strip_comments((THEMES / f'{name}.css').read_text(encoding='utf8'))
    pre = f'html:root[data-skin="{name}"]'
    out = [f'/* ---- {name} ---- */']
    for sel, body in split_rules(css):
        if sel.startswith(':root'):
            # the token block: ":root, :root:not([data-theme=light]), :root[data-theme=dark]"
            out.append(f'{pre}{{{body}}}')
            continue
        parts = [p.strip() for p in sel.split(',')]
        out.append(','.join(f'{pre} {p}' for p in parts) + f'{{{body}}}')
    return '\n'.join(out)

def role_table(name):
    j = json.loads((THEMES / f'{name}.json').read_text(encoding='utf8'))
    t2c, lab = j['t2c'], j.get('lab')
    if name == 'skyblue':
        return dict(grid='#D3E3EE', frame='#D3E3EE', grey='#55636F', ink='#14202B', handle='#4230A8',
                    blue=t2c['blue'], orange=t2c['orange'], green=t2c['green'], red=t2c['red'],
                    pink=t2c['pink'], brown=t2c['brown'], indigo=t2c['indigo'], teal=t2c['teal'])
    return dict(grid=lab['grid'], frame='transparent', grey=lab['gr'], ink=lab['ink'], handle=lab['handle'],
                blue=lab['curve'], orange=t2c['orange'], green=t2c['green'], red=t2c['red'],
                pink=t2c['pink'], brown=t2c['brown'], indigo=t2c['indigo'], teal=t2c['teal'])   # v22: fact colours in graphs

# ---------------------------------------------------------------- CSS
DEFAULTS = r'''
/* ===== theme selector (added) ===== */
.sk-gr{color:var(--gr)} .sk-bl{color:var(--bl)}
/* the calculator screen is a physical LCD: keep its highlight box indigo in every theme */
.lcd .shot .hl{border-color:#4230A8}
/* toolbar space is tight: no hint text, the dots take the room */
#hint{display:none}
#dots{flex:1;justify-content:flex-start}
/* theme button: a palette icon, no text; the menu opens above it */
#b-theme{display:inline-flex;align-items:center;justify-content:center}
#b-theme svg{width:1.3em;height:1.3em;margin-block:-.1em;display:block;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#b-theme svg .dot{fill:currentColor;stroke:none}
#theme-menu{position:absolute;z-index:7;min-width:11em;padding:.35em;border-radius:6px;box-sizing:border-box;
  background:var(--ground);border:1px solid var(--navline);box-shadow:0 6px 24px rgba(0,0,0,.28);
  font-size:max(14px,var(--fs-foot));color:var(--title);display:flex;flex-direction:column;gap:2px}
#theme-menu[hidden]{display:none!important}
#theme-menu button{font:inherit;color:inherit;background:transparent;border:0;border-radius:4px;padding:.45em .6em;
  display:flex;align-items:center;gap:.7em;cursor:pointer;text-align:left;font-weight:500}
#theme-menu button:hover,#theme-menu button:focus-visible{background:var(--navbghover);outline:none}
#theme-menu button[aria-checked="true"]{font-weight:700}
#theme-menu button[aria-checked="true"]::after{content:"\2713";margin-left:auto;padding-left:.8em}
#theme-menu .sw{width:1.5em;height:1.5em;border-radius:50%;flex:none;border:1px solid var(--navline);box-sizing:border-box}
'''
SKIN_CSS = DEFAULTS + '\n' + '\n'.join(skin_css(n) for n, _ in SKINS if n != 'skyblue')

# ---------------------------------------------------------------- JS
roles = {n: role_table(n) for n, _ in SKINS}
t2c_by_skin = {n: json.loads((THEMES / f'{n}.json').read_text(encoding='utf8'))['t2c'] for n, _ in SKINS}
labels = {n: l for n, l in SKINS}

def swatch(name):
    """[ground, answer colour] read from the skin's own token block (skyblue: the page's own tokens)"""
    if name == 'skyblue':
        return ['#F4FAFE', '#4230A8']
    css = (THEMES / f'{name}.css').read_text(encoding='utf8')
    return [re.search(r'--ground:(#[0-9A-Fa-f]{6})', css).group(1), re.search(r'--bl:(#[0-9A-Fa-f]{6})', css).group(1)]
swatches = {n: swatch(n) for n, _ in SKINS}

EARLY = r'''(function(){try{
  var S=%s, D=%s, k='deck.skin', v=null;
  try{ v=localStorage.getItem(k); }catch(e){}
  try{ var q=new URLSearchParams(location.search).get('skin'); if(q) v=q; }catch(e){}
  if(S.indexOf(v)<0) v=D;
  if(v && v!=='skyblue') document.documentElement.setAttribute('data-skin',v);
}catch(e){}})();'''

LATE = r'''(function(){
'use strict';
var ORDER=%(order)s, LABEL=%(labels)s, ROLES=%(roles)s, SWATCH=%(swatches)s, T2C=%(t2c)s, KEY='deck.skin';
/* colours the build wrote into the graphs (skyblue values) -> role */
var SRC={'#d3e3ee':'grid','#55636f':'grey','#14202b':'ink','#1c758a':'blue','#ff862f':'orange','#699c52':'green','#cf5044':'red','#4230a8':'handle','#94424f':'pink','#8b5a2b':'brown','#3b5bdb':'indigo','#49a88f':'teal'};
var root=document.documentElement;
function current(){ return root.getAttribute('data-skin')||'skyblue'; }

/* tag every graph colour once, by role; later calls only pick up elements not seen yet */
function scan(){
  document.querySelectorAll('.lab-svg line,.lab-svg polygon,.lab-svg polyline,.lab-svg rect,.lab-svg circle,.lab-svg path,.lab-svg ellipse,.lab-svg text').forEach(function(el){
    if(el.__skSeen) return; el.__skSeen=1;
    ['stroke','fill'].forEach(function(a){
      var v=el.getAttribute(a); if(!v) return;
      var r=SRC[v.toLowerCase()]; if(!r) return;
      if(r==='grid' && el.tagName.toLowerCase()==='rect') r='frame';
      (el.__sk=el.__sk||[]).push([a,r]);
    });
  });
}
/* meta.t2c colours: the build baked the skyblue hex of each role into the maths and prose; swap it for the theme's own */
var SKYROLE={}; Object.keys(T2C.skyblue).forEach(function(r){ SKYROLE[T2C.skyblue[r].toLowerCase()]=r; });
function hexOf(c){   /* el.style.color reads back as rgb(r, g, b) */
  var m=/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(c||''); if(!m) return '';
  return '#'+[1,2,3].map(function(i){ return ('0'+(+m[i]).toString(16)).slice(-2); }).join('');
}
function texScan(){
  document.querySelectorAll('#frame [style*="color"]').forEach(function(el){
    if(el.__skt!==undefined || el.closest('.lcd')) return;
    el.__skt=SKYROLE[hexOf(el.style.color)]||null;
  });
}
function texRecolour(name){
  texScan();
  var t=T2C[name];
  document.querySelectorAll('#frame [style*="color"]').forEach(function(el){
    if(el.__skt && t[el.__skt]) el.style.color=t[el.__skt];
  });
}
var texPending=false;
function texSoon(){ if(texPending) return; texPending=true; requestAnimationFrame(function(){ texPending=false; recolour(current()); }); }   /* new maths or graph parts appear as steps reveal */
if(window.MutationObserver) new MutationObserver(texSoon).observe(document.body,{childList:true,subtree:true});
function recolour(name){
  texRecolour(name);
  scan();
  var t=ROLES[name];
  document.querySelectorAll('.lab-svg *').forEach(function(el){
    if(!el.__sk) return;
    el.__sk.forEach(function(p){ el.style[p[0]]=t[p[1]]; });   /* style, not the attribute: labkit tests the original stroke attribute */
  });
}
function apply(name, persist){
  if(ORDER.indexOf(name)<0) name='skyblue';
  if(name==='skyblue') root.removeAttribute('data-skin'); else root.setAttribute('data-skin',name);
  recolour(name);
  markMenu(name);
  if(persist){ try{ localStorage.setItem(KEY,name); }catch(e){} }
  /* new fonts and sizes: the engine refits on resize */
  requestAnimationFrame(function(){ window.dispatchEvent(new Event('resize')); });
}
function cycle(d){ var i=ORDER.indexOf(current()); apply(ORDER[(i+d+ORDER.length)%%ORDER.length], true); }

/* palette button in the footer (icon only) and a menu that opens above it */
var frame=document.getElementById('frame'), btns=document.getElementById('btns');
var btn=document.createElement('button');
btn.type='button'; btn.id='b-theme'; btn.className='fbtn'; btn.title='Theme (T)';
btn.setAttribute('aria-label','Theme'); btn.setAttribute('aria-haspopup','menu'); btn.setAttribute('aria-expanded','false');
btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.2-1 2.2-2.1 0-.6-.3-1.1-.6-1.5-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle class="dot" cx="7.6" cy="11.4" r="1.2"/><circle class="dot" cx="10.2" cy="7.4" r="1.2"/><circle class="dot" cx="14.6" cy="7.4" r="1.2"/></svg>';
if(btns) btns.insertBefore(btn,btns.firstChild);
var menu=document.createElement('div');
menu.id='theme-menu'; menu.hidden=true; menu.setAttribute('role','menu'); menu.setAttribute('aria-label','Theme');
ORDER.forEach(function(n){
  var b=document.createElement('button'); b.type='button'; b.setAttribute('role','menuitemradio'); b.dataset.skin=n;
  var sw=document.createElement('span'); sw.className='sw';
  sw.style.background='linear-gradient(135deg,'+SWATCH[n][0]+' 50%%,'+SWATCH[n][1]+' 50%%)';
  var tx=document.createElement('span'); tx.textContent=LABEL[n];
  b.appendChild(sw); b.appendChild(tx);
  b.addEventListener('click',function(e){ e.stopPropagation(); apply(n,true); closeMenu(); });
  menu.appendChild(b);
});
frame.appendChild(menu);
function markMenu(name){ menu.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-checked', b.dataset.skin===name?'true':'false'); }); }
function placeMenu(){
  var f=frame.getBoundingClientRect(), r=btn.getBoundingClientRect();
  menu.style.right=Math.max(8, f.right-r.right)+'px';
  menu.style.bottom=(f.bottom-r.top+8)+'px';
}
function openMenu(){ placeMenu(); menu.hidden=false; btn.setAttribute('aria-expanded','true');
  var on=menu.querySelector('[aria-checked="true"]'); if(on) on.focus(); }
function closeMenu(){ menu.hidden=true; btn.setAttribute('aria-expanded','false'); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); }
btn.addEventListener('click',function(e){ e.stopPropagation(); if(menu.hidden) openMenu(); else closeMenu(); });
menu.addEventListener('click',function(e){ e.stopPropagation(); });
document.addEventListener('click',function(){ if(!menu.hidden) closeMenu(); });
window.addEventListener('resize',function(){ if(!menu.hidden) placeMenu(); });
menu.addEventListener('keydown',function(e){
  var items=[].slice.call(menu.querySelectorAll('button')), i=items.indexOf(document.activeElement);
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); closeMenu(); }
  else if(e.key==='ArrowDown'){ e.preventDefault(); e.stopPropagation(); items[(i+1)%%items.length].focus(); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); e.stopPropagation(); items[(i-1+items.length)%%items.length].focus(); }
  else e.stopPropagation();
});

/* help box */
var dl=document.querySelector('#help dl');
if(dl){ var dt=document.createElement('dt'), dd=document.createElement('dd'); dt.textContent='T'; dd.textContent='Change theme (Shift+T goes back)';
  var anchor=null; dl.querySelectorAll('dt').forEach(function(x){ if(x.textContent==='F') anchor=x.nextElementSibling; });
  if(anchor){ anchor.after(dt); dt.after(dd); } else { dl.appendChild(dt); dl.appendChild(dd); } }

document.addEventListener('keydown',function(e){
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  var t=e.target; if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT')) return;
  if(e.key==='t'||e.key==='T'){ e.preventDefault(); cycle(e.shiftKey?-1:1); }
});

window.DeckSkin={apply:function(n){ apply(n,false); }, cycle:cycle, current:current, list:function(){ return ORDER.slice(); }};
apply(current(), false);
})();''' % dict(order=json.dumps([n for n, _ in SKINS]), labels=json.dumps(labels), roles=json.dumps(roles), swatches=json.dumps(swatches), t2c=json.dumps(t2c_by_skin))

# ---------------------------------------------------------------- patch the page
def add_picker(html, initial='skyblue'):
    """html: the rendered skyblue deck (standalone page). Returns it with the picker added."""
    assert initial in labels, f'theme {initial!r} is not in the picker ({list(labels)})'
    marker = '/* ===== Theme: very light sky blue'
    assert html.count(marker) == 1, 'theme block not found'
    end = html.index('</style>', html.index(marker)) + len('</style>')
    early = EARLY % (json.dumps([n for n, _ in SKINS]), json.dumps(initial))
    html = (html[:end] + '\n<style id="skin-css">' + SKIN_CSS + '</style>\n<script id="skin-early">' + early
            + '</script>' + html[end:])

    # KaTeX macros: colour by class instead of a baked hex (engine and labkit)
    a = r'"\\gr":"\\textcolor{##55636F}{#1}","\\bl":"\\textcolor{##4230A8}{#1}"'
    b = r'"\\gr":"\\htmlClass{sk-gr}{#1}","\\bl":"\\htmlClass{sk-bl}{#1}"'
    assert html.count(a) == 1, 'engine macro line not found'
    html = html.replace(a, b)
    c = r"""'\\gr': '\\textcolor{#' + (TH.gr || '#55636F') + '}{#1}', '\\bl': '\\textcolor{#' + (TH.bl || '#4230A8') + '}{#1}'"""
    d = r"""'\\gr': '\\htmlClass{sk-gr}{#1}', '\\bl': '\\htmlClass{sk-bl}{#1}'"""
    assert html.count(c) == 1, 'labkit macro line not found'
    html = html.replace(c, d)
    # \htmlClass needs KaTeX trust; labkit's own options lack it (graph labels use \bl / \gr)
    k = "const KOPTS = { throwOnError: false, strict: false,\n    macros:"
    assert html.count(k) == 1, 'labkit KOPTS not found'
    html = html.replace(k, "const KOPTS = { throwOnError: false, strict: false, trust: true,\n    macros:")

    # late script: end of PART-B, so it is inside the published artifact too
    tag = '<!--/PART-B-->'
    assert html.count(tag) == 1
    return html.replace(tag, '<script id="skin-js">' + LATE + '</script>\n' + tag)
