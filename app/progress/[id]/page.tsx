"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  chapter: string;
  section: string;
  page: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Detail {
  attempt: {
    id: string;
    created_at: number;
    mode: string;
    style: string;
    chapter: string | null;
    num_questions: number;
    correct: number;
    score_pct: number;
    passed: number;
    duration_s: number;
  };
  answers: { question: Question; picked: number; correct: boolean }[];
}

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/attempts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setDetail)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <div className="error">Attempt not found.</div>;
  if (!detail) return <div className="loading">Loading...</div>;

  const { attempt, answers } = detail;
  const missed = answers.filter((a) => !a.correct);

  return (
    <>
      <h1>
        {attempt.score_pct}%{" "}
        <span style={{ color: attempt.passed ? "#34d399" : "#f87171", fontSize: "1.1rem" }}>
          {attempt.passed ? "PASS" : "NOT YET"}
        </span>
      </h1>
      <p className="sub">
        {new Date(attempt.created_at).toLocaleString()} · {attempt.correct}/{attempt.num_questions}{" "}
        correct · {attempt.mode === "random" ? "Random mix" : "Sequential"}
        {attempt.chapter ? ` Ch ${attempt.chapter}` : ""} · {attempt.style} ·{" "}
        {Math.round(attempt.duration_s / 60)} min
      </p>

      <div className="card">
        <h2>
          What you got wrong ({missed.length})
        </h2>
        {missed.length === 0 && <p>Nothing. Perfect take.</p>}
        {missed.map(({ question: q, picked }) => (
          <div key={q.id} style={{ marginBottom: 20 }}>
            <div className="qhead">
              <span className="tag">{q.section}</span>
              <span>p. {q.page}</span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
            {q.options.map((o, i) => (
              <div
                key={i}
                className={`opt ${i === q.answer ? "right" : ""} ${i === picked ? "wrong" : ""}`}
              >
                {o}
              </div>
            ))}
            <div className="explain">{q.explanation}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>What you passed ({answers.length - missed.length})</h2>
        {answers
          .filter((a) => a.correct)
          .map(({ question: q }) => (
            <div key={q.id} style={{ padding: "8px 0", borderBottom: "1px solid #2a3a5f" }}>
              <span className="tag">{q.section}</span>
              <div style={{ marginTop: 6 }}>{q.question}</div>
            </div>
          ))}
      </div>

      <a className="btn ghost" href="/progress" style={{ textAlign: "center", textDecoration: "none" }}>
        Back to progress
      </a>
    </>
  );
}
