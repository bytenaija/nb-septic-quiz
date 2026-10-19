import { NextRequest } from "next/server";

function getEnv(): Record<string, unknown> {
  const g = globalThis as unknown as Record<symbol, { getStore(): Record<string, unknown> | undefined } | undefined>;
  return g[Symbol.for("nb-septic-quiz.env-als")]?.getStore() ?? {};
}

async function hash(pw: string): Promise<string> {
  const data = new TextEncoder().encode("interview-prep:" + pw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function checkPassword(pw: unknown): boolean {
  const real = getEnv().PREP_PASSWORD;
  return typeof pw === "string" && typeof real === "string" && pw.length > 0 && pw === real;
}

export async function makeAuthCookie(): Promise<string> {
  const real = getEnv().PREP_PASSWORD as string;
  const value = await hash(real);
  return `prep_auth=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}

function getCookie(req: NextRequest, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return undefined;
}

export async function isPrepAuthed(req: NextRequest): Promise<boolean> {
  const real = getEnv().PREP_PASSWORD;
  if (typeof real !== "string") return false;
  const expected = await hash(real);
  return getCookie(req, "prep_auth") === expected;
}
