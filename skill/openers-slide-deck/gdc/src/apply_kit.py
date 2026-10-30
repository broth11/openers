"""Add the gdc (Casio fx-CG50) slide type to the openers-slide-deck template.

build_deck.py calls patch() automatically when content.json has a slide of type "gdc"; nothing to run by hand.
CLI (to inspect the patched template): python3 apply_kit.py <deck_template.html> <out.html>
Inputs next to this script: gdc_slide.css, gdc_slide.js, calc_body.webp.
Adapted 29/10/2026 from gdc-online-deck v3 (kit/src/apply_kit.py): the paintSteps anchor follows the scene template
(picks + timeline), and the gdc branch records s.d so the timeline can letter its beats (G<skill>, then W per step)."""
import base64
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

BRANCH = r"""  } else if (d.type==='gdc'){
    const s = addSlide('s-gdc', `<div class="eyebrow">GDC Skill ${d.skill} · ${tagHTML(d.tag||'C')}</div><h2>${esc(d.title)}</h2>
      ${d.stem?`<p class="stem">${nb(d.stem)}</p>`:''}
      <ol class="gsteps">${d.steps.map((st,i)=>`<li data-step="${i+1}"><span class="n">${i+1}</span><span>${GDC.step(st.t)}</span></li>`).join('')}</ol>
      <div class="calc"><img class="body" src="${GDC.BODY}" alt=""><div class="bezel"><div class="lcd" role="img" aria-label="Calculator screen"></div></div><div class="keys" aria-hidden="true">${GDC.keypad()}</div></div>`);
    { const gl = document.createElement('div'); gl.className = 'gl'; [...s.el.children].filter(c => !c.classList.contains('calc')).forEach(c => gl.appendChild(c)); s.el.prepend(gl); }
    for (let i=1;i<=d.steps.length;i++) s.steps.push([...s.el.querySelectorAll('[data-step="'+i+'"]')]);
    const lcdEl = s.el.querySelector('.lcd'), keysEl = s.el.querySelector('.keys'), items = [...s.el.querySelectorAll('.gsteps li')];
    const keys = d.steps.map(st => GDC.keysOf(st.t));
    s.gdc = n => { lcdEl.innerHTML = GDC.lcd(n ? d.steps[n-1].s : d.start); items.forEach((li,i)=>li.classList.toggle('now', i===n-1)); GDC.light(keysEl, n ? keys[n-1] : []); };
    s.gdc(0); s.d = d;
"""

PAINT = ("function paintSteps(s){ s.steps.forEach((els,i)=>els.forEach(e=>e.classList.toggle('hid', i>=s.shown))); if (s.fig) s.fig.redraw();")


def patch(h):
    css = open(os.path.join(HERE, "gdc_slide.css")).read()
    js = open(os.path.join(HERE, "gdc_slide.js")).read()
    with open(os.path.join(HERE, "calc_body.webp"), "rb") as f:  # fx-CG Manager PLUS body capture, corners transparent, 23/10/2026
        js = js.replace("__CALCBODY__", "data:image/webp;base64," + base64.b64encode(f.read()).decode())

    def sub(old, new):
        nonlocal h
        assert h.count(old) == 1, f"anchor not found once: {old[:60]!r}"
        h = h.replace(old, new)

    # 1 styles, 2 renderer, 3 slide type, 4 repaint hook, 5 maths in Your turn labels, 6 K toggles the keypad
    sub("</style>\n<!--/PART-A-->", css + "</style>\n<!--/PART-A-->")
    sub("C.slides.forEach(d => {\n  if (d.type==='title'){", js + "\nC.slides.forEach(d => {\n  if (d.type==='title'){")
    sub("  } else if (d.type==='yourturn'){", BRANCH + "  } else if (d.type==='yourturn'){")
    sub(PAINT, PAINT + " if (s.gdc) s.gdc(s.shown);")
    sub('<span class="q">${r.q}</span><span>${esc(r.label)}</span>', '<span class="q">${r.q}</span><span>${nb(r.label)}</span>')
    sub("  else if (k==='?' ){ toggleHelp(); }",
        "  else if (k==='?' ){ toggleHelp(); }\n"
        "  else if ((k==='k' || k==='K') && C.slides.some(d=>d.type==='gdc')){ const fr=document.getElementById('frame'); fr.classList.toggle('nokeys');\n"
        "    try{ localStorage.setItem('gdc.nokeys', fr.classList.contains('nokeys')?'1':''); }catch(e){} refit(); }")
    sub("<dt>F</dt><dd>Fullscreen</dd>", "<dt>F</dt><dd>Fullscreen</dd>\n        <dt>K</dt><dd>Calculator slides: show or hide the keypad</dd>")
    sub("window.Deck = {", "try{ if (localStorage.getItem('gdc.nokeys')) document.getElementById('frame').classList.add('nokeys'); }catch(e){}\nwindow.Deck = {")
    # 7 phone safety net: also shrink the text of a gdc slide when the deck-wide size does not fit
    sub("  const ex = s.el.querySelector('.ex');\n  /* safety net", "  const ex = s.el.querySelector('.ex, .s-gdc .gl');\n  /* safety net")
    return h


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    open(out, "w").write(patch(open(src).read()))
    print("kit template written:", out)
