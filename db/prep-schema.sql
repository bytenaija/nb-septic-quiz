CREATE TABLE IF NOT EXISTS prep_questions (
  id TEXT PRIMARY KEY,
  round TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prep_round ON prep_questions(round);

CREATE TABLE IF NOT EXISTS prep_progress (
  question_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
