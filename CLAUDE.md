# Openers

Follow `AGENTS.md`: it is the shared instruction file for every coding agent on this repo (Claude and Codex), and it points to `docs/OPENERS.md`, `docs/CATALOG.md`, and `docs/ENGINES.md`.

For Claude only:

- After building or changing an opener, publish its artifact build (`npm run artifact -- <key> "<Title>"`, file in `dist-artifact/`) as a private artifact so Ben can preview it at once, then push the branch for the Cloudflare preview.
- Lesson planning (whether a lesson gets an opener, the outline gate, how the opener shapes the notes) is in Ben's `mai-lesson-design` and `mai-lesson-package` skills.
