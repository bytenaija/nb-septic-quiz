"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

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

const EXAM_SECONDS = 3 * 60 * 60;
const PASS_PCT = 85;

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function QuizRunner() {
  const sp = useSearchParams();
  const mode = sp.get("mode") === "sequential" ? "sequential" : "random";
  const style = sp.get("style") === "exam" ? "exam" : "practice";
  const n = sp.get("n") || "50";
  const chapter = sp.get("chapter");

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState("");
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [finished, setFinished] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const p = new URLSearchParams({ mode, n });
    if (chapter) p.set("chapter", chapter);
    fetch(`/api/quiz?${p.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("load failed");
        return r.json();
      })
      .then((d) => {
        setQuestions(d.questions);
        setPicks(new Array(d.questions.length).fill(-1));
        startRef.current = Date.now();
      })
      .catch(() => setError("Could not load questions. Check your connection and retry."));
  }, []);

  useEffect(() => {
    if (style !== "exam" || finished || !questions) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [style, finished, questions]);

  const pick = (i: number) => {
    if (finished) return;
    const q = questions![idx];
    const next = [...picks];
    if (style === "practice") {
      if (revealed) return;
      next[idx] = i;
      setPicks(next);
      setRevealed(true);
    } else {
      next[idx] = i;
      setPicks(next);
      if (idx < questions!.length - 1) setIdx(idx + 1);
      else finish(next);
    }
  };

  const next = () => {
    if (idx < questions!.length - 1) {
      setIdx(idx + 1);
      setRevealed(false);
    } else {
      finish();
    }
  };

  const finish = (finalPicks?: number[]) => {
    const p = finalPicks || picks;
    const qs = questions!;
    let correct = 0;
    const answers = qs.map((q, i) => {
      const ok = p[i] === q.answer;
      if (ok) correct++;
      return { question_id: q.id, picked: p[i], correct: ok };
    });
    const score_pct = Math.round((correct / qs.length) * 1000) / 10;
    const passed = score_pct >= PASS_PCT;
    const duration_s = Math.round((Date.now() - startRef.current) / 1000);
    setFinished(true);
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        style,
        chapter: chapter || null,
        num_questions: qs.length,
        correct,
        score_pct,
        passed,
        duration_s,
        answers,
      }),
    })
      .then((r) => r.json())
      .then((d) => setAttemptId(d.id || null))
      .catch(() => {});
  };

  if (error) return <div className="error">{error}</div>;
  if (!questions) return <div className="loading">Loading questions...</div>;

  if (finished) {
    const correct = picks.filter((p, i) => p === questions[i].answer).length;
    const pct = Math.round((correct / questions.length) * 1000) / 10;
    const passed = pct >= PASS_PCT;
    const missed = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => picks[i] !== q.answer);
    return (
      <>
        <h1>Results</h1>
        <p className="sub">
          {mode === "random" ? "Random mix" : "Sequential"}
          {" · "}
          {style === "exam" ? "Exam simulation" : "Practice"}
        </p>
        <div className="card" style={{ textAlign: "center" }}>
          <div className={`score-big ${passed ? "pass" : "fail"}`}>{pct}%</div>
          <div>
            {correct} of {questions.length} correct · pass mark {PASS_PCT}%
          </div>
          <div style={{ marginTop: 8, fontWeight: 700 }} className={passed ? "pass" : "fail"}>
            {passed ? "PASS" : "NOT YET - keep going"}
          </div>
        </div>
        <div className="card">
          <h2>Review ({missed.length} missed)</h2>
          {missed.length === 0 && <p>Clean sweep. Nothing to review.</p>}
          {missed.map(({ q, i }) => (
            <div key={q.id} style={{ marginBottom: 20 }}>
              <div className="qhead">
                <span className="tag">{q.section}</span>
                <span>p. {q.page}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
              {q.options.map((o, oi) => (
                <div
                  key={oi}
                  className={`opt ${oi === q.answer ? "right" : ""} ${oi === picks[i] ? "wrong" : ""}`}
                >
                  {o}
                </div>
              ))}
              <div className="explain">{q.explanation}</div>
            </div>
          ))}
        </div>
        <a className="btn ghost" href="/" style={{ textAlign: "center", textDecoration: "none" }}>
          New quiz
        </a>
        <a
          className="btn ghost"
          href="/progress"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          View progress
        </a>
      </>
    );
  }

  const q = questions[idx];
  const done = idx + 1;
  return (
    <>
      <div className="qhead">
        <span>
          Question {done} of {questions.length}
        </span>
        {style === "exam" ? (
          <span className={`timer ${secondsLeft < 600 ? "low" : ""}`}>{fmt(secondsLeft)}</span>
        ) : (
          <span className="tag">{q.section}</span>
        )}
      </div>
      <div className="bar">
        <div style={{ width: `${(done / questions.length) * 100}%` }} />
      </div>
      {style === "exam" && (
        <div className="qhead">
          <span className="tag">{q.section}</span>
          <span>p. {q.page}</span>
        </div>
      )}
      {style === "practice" && (
        <div className="qhead">
          <span>p. {q.page} of the guidelines</span>
        </div>
      )}
      <h1 style={{ fontSize: "1.25rem", lineHeight: 1.4 }}>{q.question}</h1>
      <div>
        {q.options.map((o, i) => {
          let cls = "opt";
          if (style === "practice" && revealed) {
            if (i === q.answer) cls += " right";
            else if (i === picks[idx]) cls += " wrong";
          } else if (style === "exam" && picks[idx] === i) {
            cls += " right";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
              {o}
            </button>
          );
        })}
      </div>
      {style === "practice" && revealed && (
        <>
          <div className="explain">
            {picks[idx] === q.answer ? "Correct. " : "Not quite. "}
            {q.explanation}
            <div className="ref">
              {q.section} · guidelines p. {q.page}
            </div>
          </div>
          <button className="btn" onClick={next}>
            {idx < questions.length - 1 ? "Next question" : "Finish"}
          </button>
        </>
      )}
      {style === "exam" && (
        <p className="sub" style={{ marginTop: 16 }}>
          Exam mode: no feedback until the end. Last question submits automatically.
        </p>
      )}
    </>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <QuizRunner />
    </Suspense>
  );
}
