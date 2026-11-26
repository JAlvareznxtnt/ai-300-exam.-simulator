# CLAUDE.md

Single-page AI-300 practice app. No backend, no accounts, nothing is persisted (only the light/dark choice, in localStorage, wrapped in try/catch). Read README.md for the feature list and data format.

## Commands
Paths and commands in this file are relative to `ai-300-exam-simulator/`.

- On Windows the Python command is `python`, not `python3`. If `python` opens the Microsoft Store message, put `%LOCALAPPDATA%\Python\bin` ahead of `WindowsApps` on PATH. `npm test` and `npm run build` call `python3`, which that folder also provides.
- `python3 scripts/build.py` builds `dist/index.html` (add `--root` to also write `./index.html`).
- `python3 scripts/validate.py` checks `data/synthetic.json` (keys, duplicates, answer-position balance). Run it after any synthetic edit.
- `npm test` builds, then runs the Playwright flow test (`tests/flow.test.js`). The first time: `npm install && npx playwright install chromium`.
- The flow test takes a few minutes. Run it once at the end of a task, not after every edit.

## Where things live
- `src/template.html` is the whole app: CSS, HTML shell and JS in one file. Placeholders `__DATA__` and `__SYN__` are replaced by the build. Never put real data in the template.
- `data/questions.json` is the original question bank. `data/synthetic.json` is `{normal[], series[], cases[]}`.
- `index.html` in the project folder is a build output. Edit the template, then rebuild.

## Do not
- Do not read `data/*.json` in full (about 200 KB together). Search with grep or read small slices when you need a question.
- Do not hand-edit `index.html` or `dist/`.
- Do not add dependencies, frameworks or a bundler. The app stays one self-contained HTML file.
- Do not add fonts or colors outside the tokens at the top of the template's CSS (`:root` and `:root[data-theme="dark"]`). Palette is white, blue, and small touches of orange. Orange also marks "synthetic".
- Do not store answers or progress anywhere. Every session starts fresh by design.

## Keep these stable (the flow test depends on them)
Element ids: `#start #sim #simsyn #syn #synn #synonly #syndrop #domdrop #domsum #avail #cnt1..#cnt5 #n #m1 #m2 #sh #sub #next #back #hintBtn #quit #clock #retry #again #theme`.
Classes and attributes: `.score`, `.meta`, `.syn-badge`, `.serbtn[data-ser]`, `.casebtn[data-case]`, `input[name=ans]`.
If you must rename one, update `tests/flow.test.js` in the same change.

## Behaviour rules
- Synthetic questions always carry the orange "Synthetic" tag and `syn: true`. Never show them without it.
- The exam simulation always runs in Exam mode: Back allowed, clock on, hints off. With "Use synthetic questions" on it is 50 singles (domain mix 10/14/11/7/8) plus one Yes/No series (3) plus one case study (5). With it off it is 50 original bank questions only.
- Practice mode scores only answered questions. Exam mode and the simulation split results into Answered correctly, Answered incorrectly and Not answered; the headline score is correct out of answered, and domain bars count answered questions only. Simulation runs also show a "Full-exam estimate" with unanswered questions counted as wrong. Review order is Incorrect (only the first item open), Not answered, Correct. Retry covers the incorrect ones.
- Respect `prefers-reduced-motion`. Motion answers a user action (question change, answer reveal, results ring and bars); no decorative loops.
- Check the UI at 420 px wide: no horizontal scroll.

## Question data rules
- Types: `mc` (one correct), `multi` (exactly 2 correct), `slots` (a dropdown per blank).
- A series or case question needs `seriesId` or `caseId` matching an entry in `series[]` or `cases[]`.
- Keep the correct answer's position and length varied. `validate.py` flags imbalance.
- Technical claims must match current Microsoft documentation. If a claim can't be verified, say so in the question's `note` field instead of stating it as fact.

## Working style
- Small, scoped changes. Show the diff before committing. Never push without being asked.
- After a UI change, check light and dark themes.

## Roadmap
1. **Done.** Results for questions the user interacted with (see Behaviour rules).
2. A "How to use" panel at the top of the setup screen, short, covering Practice vs Exam, the Synthetic tag, the simulation and its toggle, Yes/No series, case studies, and that nothing is saved.