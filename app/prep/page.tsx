"use client";

import { useEffect, useState } from "react";
import { ROUND_NAMES, usePrepAuth, PasswordGate } from "./shared";

interface Count { round: string; n: number; }

export default function PrepHome() {
  const [authed, setAuthed] = usePrepAuth();
  const [counts, setCounts] = useState<Count[]>([]);
  const [progress, setProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authed) return;
    fetch("/api/prep/questions").then((r) => r.json()).then((d) => setCounts(d.counts || []));
    fetch("/api/prep/progress").then((r) => r.json()).then((d) => setProgress(d.progress || {}));
  }, [authed]);

  if (authed === null) return <div className="loading">Loading...</div>;
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />;

  const practiced = Object.values(progress).filter((s) => s === "practiced").length;
  const needsWork = Object.values(progress).filter((s) => s === "needs_work").length;
  const total = counts.reduce((a, c) => a + c.n, 0);

  return (
    <>
      <h1>Interview Prep</h1>
      <p className="sub">120 questions with model answers, written for you. Practice out loud.</p>

      <div className="card">
        <div className="stat-grid">
          <div className="stat"><div className="v">{practiced}</div><div className="l">practiced</div></div>
          <div className="stat"><div className="v">{needsWork}</div><div className="l">need work</div></div>
        </div>
        <div className="bar"><div style={{ width: total ? `${(practiced / total) * 100}%` : "0%" }} /></div>
        <div className="sub" style={{ margin: 0 }}>{practiced} of {total} marked practiced</div>
      </div>

      <div className="card">
        <h2>Rounds</h2>
        {counts.map((c) => (
          <div className="ch-row" key={c.round}>
            <div className="ch-name"><div className="t">{ROUND_NAMES[c.round] || c.round}</div>
            <div className="s">{c.n} questions</div></div>
            <a className="btn ghost" style={{ width: "auto", margin: 0, padding: "8px 16px" }} href={`/prep/drill?round=${c.round}`}>Drill</a>
          </div>
        ))}
      </div>

      <a className="btn" href="/prep/drill" style={{ textAlign: "center", textDecoration: "none" }}>Random drill (all rounds)</a>
      <a className="btn ghost" href="/prep/browse" style={{ textAlign: "center", textDecoration: "none" }}>Browse all questions</a>
    </>
  );
}
