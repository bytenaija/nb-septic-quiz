# NB Septic Quiz

Study quiz for the New Brunswick On-site Sewage Disposal Systems Provincial
Installer Course and exam. Built with vinext (Next.js on Vite), deployed to
Cloudflare Workers, questions and progress stored in D1.

## Content

- `questions.json` — the reviewed 612-question bank (source of truth)
- `db/schema.sql` — D1 schema (questions, attempts, attempt_answers)
- `db/seed.mjs` — regenerates `db/seed.sql` from `questions.json`

## Develop

```sh
npm install
npm run dev
```

## Seed the database

```sh
npm run db:seed
wrangler d1 execute nb-septic-quiz-db --remote --file db/seed.sql
```

## Deploy

```sh
npm run deploy
```

## Structure

- `app/page.tsx` — start screen (mode, length, practice/exam)
- `app/quiz/page.tsx` — quiz runner with 3-hour exam timer
- `app/progress/page.tsx` — dashboard: baseline vs latest, per-chapter accuracy, history
- `app/progress/[id]/page.tsx` — per-attempt review (passed / got wrong)
- `app/api/quiz` — serve questions (random sample or sequential by chapter)
- `app/api/attempts` — record and list quiz attempts
- `app/api/progress` — chapter accuracy stats and score trend
