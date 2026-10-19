#!/usr/bin/env node
// Generates db/seed.sql from questions.json (612 questions)
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const BASE = dirname(fileURLToPath(import.meta.url));
const questions = JSON.parse(readFileSync(join(BASE, '..', 'questions.json'), 'utf8'));

const esc = (s) => String(s).replace(/'/g, "''");
const lines = ['DELETE FROM questions;'];
for (const q of questions) {
  const chapter = (/^(\d+)/.exec(q.section || '') || [])[1] || '6';
  lines.push(
    `INSERT INTO questions (id, chapter, section, page, question, options, answer, explanation) VALUES (` +
    `'${esc(q.id)}', '${chapter}', '${esc(q.section)}', ${q.page}, '${esc(q.question)}', ` +
    `'${esc(JSON.stringify(q.options))}', ${q.answer}, '${esc(q.explanation)}');`
  );
}
writeFileSync(join(BASE, 'seed.sql'), lines.join('\n'));
console.log(`wrote seed.sql with ${questions.length} inserts`);
