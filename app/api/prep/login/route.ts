import { NextRequest, NextResponse } from "next/server";
import { checkPassword, makeAuthCookie } from "@/lib/prep-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", await makeAuthCookie());
  return res;
}
