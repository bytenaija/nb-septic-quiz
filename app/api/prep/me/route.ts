import { NextRequest, NextResponse } from "next/server";
import { isPrepAuthed } from "@/lib/prep-auth";

export async function GET(req: NextRequest) {
  if (!(await isPrepAuthed(req))) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  return NextResponse.json({ authed: true });
}
