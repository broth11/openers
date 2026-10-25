# Openers

The opening visual for each lesson, live, on one student link. Ben projects it and drives it in the first 5 to 10 minutes of class; students come back to it later from the same link.

- Student site: `openers.bensnotes.app` (deep link per lesson, for example `#mai-hl-u11-l09`)
- Single-file artifact per lesson, for previews and sharing

```bash
npm install
npm run dev                                          # work on it locally
npm run build && npm run serve                       # site build
node qa/check.mjs mai-hl-u11-l09                     # layout check
npm run artifact -- mai-hl-u11-l09 "U11 L9 Opener"   # single-file artifact
```

How to build an opener: `docs/OPENERS.md`. What already exists: `docs/CATALOG.md`. Engines: `docs/ENGINES.md`. Agents start at `AGENTS.md`.
