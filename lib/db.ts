import { AsyncLocalStorage } from "node:async_hooks";

export interface D1Result<T> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...args: unknown[]): D1PreparedStatement;
  all<T>(): Promise<D1Result<T>>;
  first<T>(column?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { changes: number } }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

export interface Question {
  id: string;
  chapter: string;
  section: string;
  page: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface QuestionRow {
  id: string;
  chapter: string;
  section: string;
  page: number;
  question: string;
  options: string;
  answer: number;
  explanation: string;
}

export const CHAPTER_NAMES: Record<string, string> = {
  "1": "General",
  "2": "Introduction",
  "3": "Site Evaluation",
  "4": "System Design",
  "5": "Licensing",
  "6": "Appendices",
};

export function getDb(): D1Database {
  // The worker entry (worker/index.ts) stashes the worker env in an
  // AsyncLocalStorage for the duration of each request.
  const g = globalThis as unknown as Record<
    symbol,
    AsyncLocalStorage<Record<string, unknown>> | undefined
  >;
  const db = g[Symbol.for("nb-septic-quiz.env-als")]?.getStore()?.DB as
    | D1Database
    | undefined;
  if (!db) throw new Error("D1 binding DB is not available");
  return db;
}

export function rowToQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    chapter: r.chapter,
    section: r.section,
    page: r.page,
    question: r.question,
    options: JSON.parse(r.options),
    answer: r.answer,
    explanation: r.explanation,
  };
}
