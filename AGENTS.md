# Openers: instructions for coding agents

This repo builds Ben's lesson openers: live classroom visuals, one per lesson, on one student site (`openers.bensnotes.app`) and as single-file artifacts.

Before changing anything, read:

1. `docs/OPENERS.md`: the method, the lesson module contract, the house style, the rules learned so far, and how to build and check.
2. `docs/CATALOG.md`: what already exists. Reuse it before writing anything new.
3. `docs/ENGINES.md`: the engine interface, and how to add JSXGraph or three.js.

Planning an opener (whether a lesson gets one, the outline Ben approves, which engine, how it shapes the printed notes) is not in this repo. It is in Ben's lesson skills `mai-lesson-package` (section "Lesson opener") and `mai-lesson-design` (the outline gate and "Choosing the opener's engine"). In Codex they are at `~/.codex/skills/<name>/SKILL.md`; their masters are in `/Users/benjaminroth/Documents/Courses/MAI HL/_tools/skills_sync/masters/`. Read both before proposing a new opener, and stop at the outline gate for Ben's approval.

Setup (once per environment):

```bash
npm install
npx playwright install --with-deps chromium   # browser for the layout check
pip install sympy                             # exact-value checks
```

Previews: push the branch; Cloudflare builds it at `https://<branch-name>.openers.pages.dev/`. Give Ben that link with the lesson's deep link (for example `#mai-hl-u11-l09`). Merging to `main` puts it live at `openers.pages.dev` and `openers.bensnotes.app`.

Working rules:

- Work on a branch, never on `main`. Ben approves every merge; merging puts an opener live.
- Build reusable drawing code as a component in `src/components/<name>/` with a `README.md`, and add it to `docs/CATALOG.md` in the same commit.
- Run `npm run lint`, `npm run build`, and `node qa/check.mjs <lesson-key>` (with `npm run serve` running) before every commit. Fix failures; do not loosen the check.
- Check every exact value with sympy before committing.
- Student-facing text: no em dashes, Oxford commas, plain direct voice.
- Do not add Desmos or any library loaded from a CDN at run time; everything must work offline and in a single-file artifact.
