import { NextRequest, NextResponse } from "next/server";
import { isPrepAuthed } from "@/lib/prep-auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!(await isPrepAuthed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const res = await db.prepare("SELECT question_id, status FROM prep_progress").all<{
    question_id: string;
    status: string;
  }>();
  const progress: Record<string, string> = {};
  for (const r of res.results) progress[r.question_id] = r.status;
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  if (!(await isPrepAuthed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { question_id, status } = await req.json();
  if (!question_id) return NextResponse.json({ error: "missing question_id" }, { status: 400 });
  const db = getDb();
  if (status === "practiced" || status === "needs_work") {
    await db
      .prepare(
        "INSERT INTO prep_progress (question_id, status, updated_at) VALUES (?, ?, ?) ON CONFLICT(question_id) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at"
      )
      .bind(question_id, status, Date.now())
      .run();
  } else {
    await db.prepare("DELETE FROM prep_progress WHERE question_id = ?").bind(question_id).run();
  }
  return NextResponse.json({ ok: true });
}
