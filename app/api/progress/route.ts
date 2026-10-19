import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const chapters = await db
    .prepare(
      `SELECT q.chapter AS chapter, COUNT(*) AS answered, SUM(a.correct) AS correct
       FROM attempt_answers a
       JOIN questions q ON q.id = a.question_id
       GROUP BY q.chapter
       ORDER BY q.chapter`
    )
    .all<{ chapter: string; answered: number; correct: number }>();

  const trend = await db
    .prepare(
      "SELECT created_at, score_pct, passed FROM attempts ORDER BY created_at ASC LIMIT 200"
    )
    .all<{ created_at: number; score_pct: number; passed: number }>();

  const totals = await db
    .prepare(
      "SELECT COUNT(*) AS attempts, SUM(correct) AS correct, SUM(num_questions) AS questions FROM attempts"
    )
    .first<{ attempts: number; correct: number; questions: number }>();

  return NextResponse.json({
    chapters: chapters.results.map((c) => ({
      chapter: c.chapter,
      answered: c.answered,
      correct: c.correct,
      accuracy: c.answered ? Math.round((c.correct / c.answered) * 1000) / 10 : 0,
    })),
    trend: trend.results,
    totals: totals ?? { attempts: 0, correct: 0, questions: 0 },
  });
}
