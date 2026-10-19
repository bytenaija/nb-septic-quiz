import { NextRequest, NextResponse } from "next/server";
import { isPrepAuthed } from "@/lib/prep-auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!(await isPrepAuthed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const round = sp.get("round");
  const type = sp.get("type");
  const db = getDb();

  const where: string[] = [];
  const args: unknown[] = [];
  if (round) { where.push("round = ?"); args.push(round); }
  if (type) { where.push("type = ?"); args.push(type); }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const res = await db
    .prepare(`SELECT id, round, type, question, answer FROM prep_questions ${clause} ORDER BY sort_order`)
    .bind(...args)
    .all();

  const counts = await db
    .prepare("SELECT round, type, COUNT(*) AS n FROM prep_questions GROUP BY round, type")
    .all<{ round: string; type: string; n: number }>();

  return NextResponse.json({ questions: res.results, counts: counts.results });
}
