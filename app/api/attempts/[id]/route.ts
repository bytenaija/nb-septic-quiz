import { NextRequest, NextResponse } from "next/server";
import { getDb, rowToQuestion, type QuestionRow } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const attempt = await db
    .prepare(
      "SELECT id, created_at, mode, style, chapter, num_questions, correct, score_pct, passed, duration_s FROM attempts WHERE id = ?"
    )
    .bind(id)
    .first();

  if (!attempt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const answers = await db
    .prepare(
      `SELECT a.question_id, a.picked, a.correct,
              q.chapter, q.section, q.page, q.question, q.options, q.answer, q.explanation
       FROM attempt_answers a
       JOIN questions q ON q.id = a.question_id
       WHERE a.attempt_id = ?
       ORDER BY q.chapter, q.page, q.id`
    )
    .bind(id)
    .all<
      QuestionRow & { picked: number; correct: number }
    >();

  return NextResponse.json({
    attempt,
    answers: answers.results.map((r) => ({
      question: rowToQuestion(r),
      picked: r.picked,
      correct: r.correct === 1,
    })),
  });
}
