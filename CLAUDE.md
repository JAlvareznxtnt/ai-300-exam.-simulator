# CLAUDE.md

Single-page AI-300 practice app. No backend, no accounts, nothing is persisted (only the light/dark choice, in localStorage, wrapped in try/catch). Read README.md for the feature list and data format.

## Commands
- On Windows the Python command is `python`, not `python3`. If `python` opens the Microsoft Store message, put `%LOCALAPPDATA%\Python\bin` ahead of `WindowsApps` on PATH. `npm test` and `npm run build` call `python3`, which that folder also provides.
- `python3 scripts/build.py` builds `dist/index.html` (add `--root` to also write `./index.html`).
- `python3 scripts/validate.py` checks `data/synthetic.json` (keys, duplicates, answer-position balance) and source URLs in both data files. Run it after any data edit. It exits with an error only for a source URL off learn.microsoft.com; a synthetic question without sources is a warning.
- `npm test` builds, then runs the Playwright flow test (`tests/flow.test.js`). The first time: `npm install && npx playwright install chromium`.
- The flow test takes a few minutes. Run it once at the end of a task, not after every edit.

## Where things live
- `src/template.html` is the whole app: CSS, HTML shell and JS in one file. Placeholders `__DATA__` and `__SYN__` are replaced by the build. Never put real data in the template.
- `data/questions.json` is the original question bank. `data/synthetic.json` is `{normal[], series[], cases[]}`.
- `index.html` at the repo root is a build output. Edit the template, then rebuild.

## Do not
- Do not read `data/*.json` in full (about 200 KB together). Search with grep or read small slices when you need a question.
- Do not hand-edit `index.html` or `dist/`.
- Do not add dependencies, frameworks or a bundler. The app stays one self-contained HTML file.
- Do not add fonts or colors outside the tokens at the top of the template's CSS (`:root` and `:root[data-theme="dark"]`). Palette is white, blue, and small touches of orange. Orange also marks "synthetic".
- Do not store answers or progress anywhere. Every session starts fresh by design.

## Keep these stable (the flow test depends on them)
Element ids: `#guide-toggle #guide #start #sim #simsyn #syn #synn #synonly #syndrop #domdrop #domsum #avail #cnt1..#cnt5 #n #m1 #m2 #sh #check #next #back #review #hintBtn #hintBox #quit #clock #resume #finish #counts #left #retry #again #ringn #theme`, plus `#iA..` (options) and, on slot questions, `#dnd #live`, `#p0..` (pool options, alphabetical) and `#s0..` (slot buttons).
Classes and attributes: `.score`, `.meta`, `.syn-badge`, `.serbtn[data-ser]`, `.casebtn[data-case]`, `input[name=ans]`, `.qcount`, `.card`, `.feedback`, `.verdict`, `.opt.right`, `.opt.wrong`, `.stem`, `.hint`, `.pool`, `.targets`, `.piece`, `.slot[data-k]` (with `.filled`, `.held`, `.over`, `.right`, `.wrong`), `.slotbtn`, `.unslot`, `.slotmk`, `.fix`, `.ghost-drag`, `.lifted`, `.slotres`, `.pill-bad`, `.qgrid button[data-i]` (with its `aria-label`; the last child is the state mark), `.legend li`, `.sources`, `.step`, `.res-top`, `.section-title`, `.dom .vl`, `details.rev[data-status]`.
If you must rename one, update `tests/flow.test.js` in the same change.

## Behaviour rules
- Synthetic questions always carry the orange "Synthetic" tag and `syn: true`. Never show them without it.
- The exam simulation always runs in Exam mode: Back allowed, clock on, hints off. With "Use synthetic questions" on it is 50 singles (domain mix 10/14/11/7/8) plus one Yes/No series (3) plus one case study (5). With it off it is 50 original bank questions only.
- Practice mode has Back, Check answer, Next, Review and the hint. Check answer needs a pick (every slot filled on a slot question), locks the question and shows the correct answer with feedback; a revisited checked question stays locked. Next never reveals anything and keeps the pick.
- Slot questions are drag-and-drop, never dropdowns. The pool is every choice of every slot, each usable once, alphabetical; any option can go in any slot. Dragging uses Pointer Events (not HTML5 drag) and must not scroll the page on touch. Click-to-place (option, then slot) is the keyboard and screen-reader path, with `aria-label`s and the `#live` announcements. Dropping on a filled slot swaps, or returns the old option to the pool; the cross or a drag to the pool empties a slot. Check answer marks each slot ✓ or ✕ and shows the correct value for wrong ones. `S.ans[i]` stays an array with one value per slot (`''` when empty).
- Exam mode and the simulation have Back, Next and Review, never Check answer. Exam mode outside the simulation keeps the hint.
- Review (every mode) opens a grid of numbered buttons (answered, not answered, current; in Practice also checked correct or incorrect). Each state has a mark and an `aria-label`, not only a color. Next on the last question opens it. The clock keeps running there. Finishing happens from this screen (`#finish`) or with End session from anywhere.
- All modes score the same way: results split into Answered correctly, Answered incorrectly and Not answered, checked or not; the headline score is correct out of answered, and domain bars count answered questions only. A partly filled slot question counts as answered. Simulation runs also show a "Full-exam estimate" with unanswered questions counted as wrong. Review order is Incorrect (only the first item open), Not answered, Correct. Retry covers the incorrect ones.
- A question with `sources` shows "Read on Microsoft Learn" links (new tab, `rel="noopener"`) after Check answer and in the results review. Never before the answer is revealed, and not on the question grid.
- The setup screen has a "Get started" guide under the hero: a `<button aria-expanded aria-controls>` (not a `<details>`), closed on every load, never stored. Three steps with 2-3 bullets each, icons from one set (`icon()`, 2px current-color strokes). While closed it is `inert` and hidden.
- Respect `prefers-reduced-motion`. Motion answers a user action (question change, answer reveal, results ring and bars); no decorative loops.
- Check the UI at 420 px wide: no horizontal scroll.

## Question data rules
- Types: `mc` (one correct), `multi` (exactly 2 correct), `slots` (one value per slot: `slots[{label, choices[], correct}]`). Within a question no two slots share a correct value, because each option is used once.
- Ordering questions label their slots "Step 1..N" and need more choices than slots.
- A series or case question needs `seriesId` or `caseId` matching an entry in `series[]` or `cases[]`.
- Keep the correct answer's position and length varied. `validate.py` flags imbalance.
- Technical claims must match current Microsoft documentation. If a claim can't be verified, say so in the question's `note` field instead of stating it as fact.
- `sources` (optional) is `[{title, url}]`, learn.microsoft.com only: the pages that support the question. `docs/verification.md` records each check. A bank question's options and key are never changed to match the docs; put the finding in its note.

## Working style
- Small, scoped changes. Show the diff before committing. Never push without being asked.
- After a UI change, check light and dark themes.

## Roadmap
1. **Done.** Results for questions the user interacted with (see Behaviour rules).
2. **Done.** The "Get started" guide on the setup screen (see Behaviour rules). The simulation toggle is explained on the simulation card, and the hero says nothing is saved.