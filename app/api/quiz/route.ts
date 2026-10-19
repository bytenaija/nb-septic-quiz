import { NextRequest, NextResponse } from "next/server";
import { getDb, rowToQuestion, type QuestionRow } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const list = searchParams.get("list");

  if (list === "chapters") {
    const db = getDb();
    const res = await db
      .prepare("SELECT chapter, COUNT(*) AS n FROM questions GROUP BY chapter ORDER BY chapter")
      .all<{ chapter: string; n: number }>();
    return NextResponse.json({ chapters: res.results });
  }

  const mode = searchParams.get("mode") === "sequential" ? "sequential" : "random";
  const n = Math.max(1, Math.min(612, parseInt(searchParams.get("n") || "50", 10) || 50));
  const chapter = searchParams.get("chapter");

  const db = getDb();
  let rows: QuestionRow[];
  if (mode === "sequential") {
    if (chapter) {
      const res = await db
        .prepare("SELECT * FROM questions WHERE chapter = ? ORDER BY page, id LIMIT ?")
        .bind(chapter, n)
        .all<QuestionRow>();
      rows = res.results;
    } else {
      const res = await db
        .prepare("SELECT * FROM questions ORDER BY chapter, page, id LIMIT ?")
        .bind(n)
        .all<QuestionRow>();
      rows = res.results;
    }
  } else {
    const res = await db
      .prepare("SELECT * FROM questions ORDER BY RANDOM() LIMIT ?")
      .bind(n)
      .all<QuestionRow>();
    rows = res.results;
  }

  return NextResponse.json({ questions: rows.map(rowToQuestion), count: rows.length });
}
