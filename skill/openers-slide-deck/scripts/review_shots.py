#!/usr/bin/env python3
"""Screenshots of every slide at every reveal step, for the review stage (v13).

    python3 review_shots.py DECK.html --out DIR [--size 1470x830] [--size 1280x800 ...]

Writes DIR/<W>x<H>_s<slide>_<step>.png (step 0 = nothing revealed) and, for each lab slide, one shot after every
slider has been moved to its minimum and one at its maximum (DIR/<W>x<H>_s<slide>_min.png / _max.png), plus
DIR/index.txt listing each shot with the slide title and the lab console errors. Waits 450 ms per shot (fades).
"""

import argparse
import os

from playwright.sync_api import sync_playwright


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("deck")
    ap.add_argument("--out", default="review")
    ap.add_argument("--size", action="append")
    a = ap.parse_args()
    sizes = [tuple(int(v) for v in s.split("x")) for s in (a.size or ["1470x830"])]
    os.makedirs(a.out, exist_ok=True)
    lines, errs = [], []
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w, h in sizes:
            pg = br.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
            pg.on(
                "console",
                lambda m, tag=f"{w}x{h}": (
                    errs.append(f"{tag}: {m.text}") if m.type == "error" else None
                ),
            )
            pg.goto("file://" + os.path.abspath(a.deck))
            pg.wait_for_timeout(500)
            n = pg.evaluate("Deck.count()")
            for i in range(n):
                pg.evaluate(f'Deck.go({i}, "all")')
                steps = pg.evaluate("Deck.state().steps")
                title = pg.evaluate(
                    "(document.querySelector('.slide.active h1, .slide.active h2') || {}).textContent || ''"
                )
                for k in range(steps + 1):
                    pg.evaluate(f"Deck.go({i}, {k})")
                    pg.wait_for_timeout(450)
                    f = f"{w}x{h}_s{i + 1:02d}_{k}.png"
                    pg.screenshot(path=os.path.join(a.out, f))
                    lines.append(
                        f"{f}\tslide {i + 1} step {k}/{steps}\t{title.strip()}"
                    )
                if pg.evaluate(f"!!Deck.slides[{i}].lab"):
                    for end in ("min", "max"):
                        pg.evaluate(
                            "e => document.querySelectorAll('.slide.active .lab-slider input').forEach(i => "
                            "{ i.value = i[e]; i.dispatchEvent(new Event('input', {bubbles: true})); })",
                            end,
                        )
                        pg.wait_for_timeout(450)
                        f = f"{w}x{h}_s{i + 1:02d}_{end}.png"
                        pg.screenshot(path=os.path.join(a.out, f))
                        lines.append(
                            f"{f}\tslide {i + 1} lab, every slider at its {end}\t{title.strip()}"
                        )
            pg.close()
        br.close()
    lines += [f"CONSOLE ERROR {e}" for e in errs]
    with open(os.path.join(a.out, "index.txt"), "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"{len(lines) - len(errs)} shots in {a.out}; {len(errs)} console error(s)")


if __name__ == "__main__":
    main()
