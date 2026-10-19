"use client";

import { useEffect, useState } from "react";

const CHAPTER_NAMES: Record<string, string> = {
  "1": "General",
  "2": "Introduction",
  "3": "Site Evaluation",
  "4": "System Design",
  "5": "Licensing",
  "6": "Appendices",
};

interface ChapterStat {
  chapter: string;
  answered: number;
  correct: number;
  accuracy: number;
}

interface Attempt {
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
}

function barColor(pct: number) {
  if (pct >= 85) return "#34d399";
  if (pct >= 70) return "#fbbf24";
  return "#f87171";
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ChapterStat[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/progress").then((r) => r.json()), fetch("/api/attempts").then((r) => r.json())])
      .then(([p, a]) => {
        setStats(p.chapters || []);
        setAttempts(a.attempts || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <div className="loading">Loading progress...</div>;

  const sorted = [...stats].sort((a, b) => a.accuracy - b.accuracy);
  const weak = sorted.filter((s) => s.accuracy < 85);
  const baseline = attempts.length ? attempts[attempts.length - 1] : null;
  const latest = attempts.length ? attempts[0] : null;

  return (
    <>
      <h1>Progress</h1>
      <p className="sub">
        {attempts.length === 0
          ? "No quizzes yet. Your baseline will appear after your first take."
          : `${attempts.length} quiz${attempts.length === 1 ? "" : "zes"} recorded.`}
      </p>

      {baseline && latest && attempts.length > 1 && (
        <div className="card">
          <h2>Baseline vs latest</h2>
          <div className="stat-grid">
            <div className="stat">
              <div className="v">{baseline.score_pct}%</div>
              <div className="l">
                Baseline · {new Date(baseline.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="stat">
              <div className="v">{latest.score_pct}%</div>
              <div className="l">
                Latest · {new Date(latest.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: latest.score_pct >= baseline.score_pct ? "#34d399" : "#f87171" }}>
            {latest.score_pct >= baseline.score_pct ? "+" : ""}
            {Math.round((latest.score_pct - baseline.score_pct) * 10) / 10} points since baseline
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <div className="card">
          <h2>Accuracy by chapter</h2>
          {sorted.map((s) => (
            <div className="ch-row" key={s.chapter}>
              <div className="ch-name">
                <div className="t">
                  Ch {s.chapter}: {CHAPTER_NAMES[s.chapter] || ""}
                </div>
                <div className="s">
                  {s.correct}/{s.answered} correct
                  {s.accuracy < 85 && <span className="weak"> · spend more time here</span>}
                </div>
              </div>
              <div className="ch-bar">
                <div style={{ width: `${s.accuracy}%`, background: barColor(s.accuracy) }} />
              </div>
              <div className="ch-pct">{s.accuracy}%</div>
            </div>
          ))}
          {weak.length > 0 && (
            <p className="sub" style={{ marginTop: 12, marginBottom: 0 }}>
              Focus next:{" "}
              {weak
                .slice(0, 3)
                .map((w) => `Ch ${w.chapter} ${CHAPTER_NAMES[w.chapter] || ""}`)
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {attempts.length > 0 && (
        <div className="card">
          <h2>History</h2>
          {attempts.map((a) => (
            <a className="hist-row" key={a.id} href={`/progress/${a.id}`}>
              <div style={{ fontWeight: 600 }}>
                <span style={{ color: a.passed ? "#34d399" : "#f87171" }}>{a.score_pct}%</span>
                {" · "}
                {a.correct}/{a.num_questions}
                {" · "}
                {a.mode === "random" ? "Random mix" : "Sequential"}
                {a.chapter ? ` Ch ${a.chapter}` : ""}
                {" · "}
                {a.style}
              </div>
              <div className="d">
                {new Date(a.created_at).toLocaleString()} · {Math.round(a.duration_s / 60)} min
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
