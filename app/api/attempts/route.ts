import { NextRequest, NextResponse } from "next/server";
import { getDb, rowToQuestion, type QuestionRow } from "@/lib/db";

interface AnswerIn {
  question_id: string;
  picked: number;
  correct: boolean;
}

interface AttemptIn {
  mode: string;
  style: string;
  chapter: string | null;
  num_questions: number;
  correct: number;
  score_pct: number;
  passed: boolean;
  duration_s: number;
  answers: AnswerIn[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AttemptIn;
  if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: "no answers" }, { status: 400 });
  }

  const db = getDb();
  const id = crypto.randomUUID();
  const created_at = Date.now();

  const stmts = [
    db
      .prepare(
        "INSERT INTO attempts (id, created_at, mode, style, chapter, num_questions, correct, score_pct, passed, duration_s) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        id,
        created_at,
        body.mode,
        body.style,
        body.chapter,
        body.num_questions,
        body.correct,
        body.score_pct,
        body.passed ? 1 : 0,
        body.duration_s
      ),
    ...body.answers.map((a) =>
      db
        .prepare(
          "INSERT INTO attempt_answers (attempt_id, question_id, picked, correct) VALUES (?, ?, ?, ?)"
        )
        .bind(id, a.question_id, a.picked, a.correct ? 1 : 0)
    ),
  ];

  await db.batch(stmts);
  return NextResponse.json({ id });
}

export async function GET() {
  const db = getDb();
  const res = await db
    .prepare(
      "SELECT id, created_at, mode, style, chapter, num_questions, correct, score_pct, passed, duration_s FROM attempts ORDER BY created_at DESC LIMIT 100"
    )
    .all();
  return NextResponse.json({ attempts: res.results });
}
