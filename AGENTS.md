# Openers: instructions for coding agents

This repo builds Ben's lesson openers: live classroom visuals, one per lesson, on one student site (`openers.bensnotes.app`) and as single-file artifacts.

Before changing anything, read:

1. `docs/OPENERS.md`: the method, the lesson module contract, the house style, the rules learned so far, and how to build and check.
2. `docs/CATALOG.md`: what already exists. Reuse it before writing anything new.
3. `docs/ENGINES.md`: the engine interface, and how to add JSXGraph or three.js.

Working rules:

- Work on a branch, never on `main`. Ben approves every merge; merging puts an opener live.
- Build reusable drawing code as a component in `src/components/<name>/` with a `README.md`, and add it to `docs/CATALOG.md` in the same commit.
- Run `npm run lint`, `npm run build`, and `node qa/check.mjs <lesson-key>` (with `npm run serve` running) before every commit. Fix failures; do not loosen the check.
- Check every exact value with sympy before committing.
- Student-facing text: no em dashes, Oxford commas, plain direct voice.
- Do not add Desmos or any library loaded from a CDN at run time; everything must work offline and in a single-file artifact.
