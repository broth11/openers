# Openers: instructions for coding agents

This repo builds Ben's lesson openers: live classroom visuals, one per lesson, on one student site (`openers.bensnotes.app`) and as single-file artifacts.

Before changing anything, read:

1. `docs/OPENERS-WALK.md`: **the model for every new opener** (decided 28 October 2026). One timeline of beats, question and working in a left pane, the animation on the right, pause and rewind. Set `walk: true` and follow its recipe.
2. `docs/OPENERS.md`: the method, what a scene contains, the house style, and the rules learned so far. These still apply inside a walk lesson.
3. `docs/CATALOG.md`: what already exists. Reuse it before writing anything new.
4. `docs/ENGINES.md`: the engine interface, and how to add JSXGraph or three.js.
5. `docs/OPENERS-STEPPED.md`: legacy. Read it only to understand a lesson that still has a `beats` array (U5 L2).

Working rules:

- **New openers are walk lessons** (`walk: true`). Do not author new lessons in the old three-pane or `beats` style. Lessons built before the walk model (U5 L1, U5 L2, U11 L9, L10, L11) keep their original shell until Ben asks for them to be remade; remaking one means replacing it in place and moving the old file to `src/lessons/<course>/_archive/`.
- A walk lesson is not finished until every Solution step restates its answer in the coloured box, the bar letters read Q1, W, S, A, and `node qa/check.mjs <key>` passes at all four sizes.
- Work on a branch, never on `main`. Ben approves every merge; merging puts an opener live.
- Build reusable drawing code as a component in `src/components/<name>/` with a `README.md`, and add it to `docs/CATALOG.md` in the same commit.
- Run `npm run lint`, `npm run build`, and `node qa/check.mjs <lesson-key>` (with `npm run serve` running) before every commit. Fix failures; do not loosen the check.
- Check every exact value with sympy before committing.
- Student-facing text: no em dashes, Oxford commas, plain direct voice.
- Do not add Desmos or any library loaded from a CDN at run time; everything must work offline and in a single-file artifact.
