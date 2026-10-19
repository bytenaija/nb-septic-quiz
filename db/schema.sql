CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  chapter TEXT NOT NULL,
  section TEXT NOT NULL,
  page INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  explanation TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  mode TEXT NOT NULL,
  style TEXT NOT NULL,
  chapter TEXT,
  num_questions INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  score_pct REAL NOT NULL,
  passed INTEGER NOT NULL,
  duration_s INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at);

CREATE TABLE IF NOT EXISTS attempt_answers (
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  picked INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  PRIMARY KEY (attempt_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON attempt_answers(question_id);
