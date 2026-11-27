# AI-300 exam simulator

A private, single-page practice app for the Microsoft AI-300 exam. No accounts, no backend, nothing is saved: every session starts fresh.

## What is in it
- **Get started**: a short three-step guide on the setup screen, closed until you open it.
- **Question bank**: 80 questions across the five exam domains (single choice, choose 2, and drag-and-drop questions for ordering, matching and code blanks). Practice mode (check answers when you want) or Exam mode (results at the end, you can go back).
- **Exam simulation**: 50 questions in the exam's domain mix, plus a Yes/No series and a case study when synthetic questions are on. Clock, no hints, results at the end. A toggle switches to original bank questions only (50, no series or case study).
- **Synthetic practice**: 3 case studies (5 questions each), 2 Yes/No series (3 each) and 50 single questions. Written by Claude from the official skills outline and checked against Microsoft docs where they cover the topic. Always tagged orange "Synthetic".
- **Read on Microsoft Learn**: questions that have been checked list their source pages after Check answer and in the results review. The record is in [docs/verification.md](docs/verification.md).
- Light and dark theme, chosen with the toggle in the header (default light).

## Layout
```
src/template.html     the whole app (HTML, CSS, JS). Placeholders __DATA__ and __SYN__ are filled at build time
data/questions.json   question bank
data/synthetic.json   synthetic questions: { normal[], series[], cases[] }
scripts/build.py      template + data -> dist/index.html
scripts/validate.py   checks on the synthetic set (keys, duplicates, answer-position balance) and on source URLs
docs/verification.md  which questions were checked against Microsoft Learn, with the result
tests/flow.test.js    Playwright flow test (setup, exam mode with Back, simulation, series, cases, toggles)
.github/workflows/    GitHub Pages deploy
```

## Work on it
```bash
python3 scripts/build.py          # writes dist/index.html
python3 scripts/build.py --root   # also writes ./index.html (handy for opening locally)
python3 scripts/validate.py       # after editing the question data
npm install && npx playwright install chromium && npm test
```
Open `dist/index.html` in a browser; there is no server to run.

## Data format
Each question: `n` (id), `dom` (1-5), `type` (`mc` | `multi` | `slots`), `stem` (small markdown: paragraphs, bullets, fenced code), `opts` as `[["A","text"],...]`, `correct` (e.g. `["B"]`), `rationale`, `hint`, optional `note` and `sources`.
`sources` is `[{"title": ..., "url": ...}]`, with `https://learn.microsoft.com/` URLs only. `validate.py` fails on any other URL, and warns (without failing) about a synthetic question that has no sources.
`slots` questions use `slots: [{label, choices[], correct}]` instead of `opts`.
Synthetic questions also carry `syn: true`; series and case questions carry `seriesId` / `caseId` matching the `id` in `series[]` / `cases[]` (which hold `title`, `text` and `qs`).

## Deploy (GitHub Pages)
Settings > Pages > Source: **GitHub Actions**. Every push to `main` validates, builds and deploys. The site URL is `https://<user>.github.io/<repo>/`.

Note: a public repo or a public Pages site exposes `data/` to anyone, including the question bank. Keep the repo private (Pages from private repos needs a paid plan) or review the bank content first.
