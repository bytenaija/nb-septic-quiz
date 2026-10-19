"use client";

import { useEffect, useState } from "react";
import { ROUND_NAMES, TYPE_NAMES, usePrepAuth, PasswordGate } from "../shared";

interface Q { id: string; round: string; type: string; question: string; answer: string; }

export default function BrowsePage() {
  const [authed, setAuthed] = usePrepAuth();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [round, setRound] = useState("all");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authed) return;
    fetch("/api/prep/questions").then((r) => r.json()).then((d) => setQuestions(d.questions || []));
    fetch("/api/prep/progress").then((r) => r.json()).then((d) => setProgress(d.progress || {}));
  }, [authed]);

  const mark = async (id: string, status: string | null) => {
    await fetch("/api/prep/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: id, status }),
    });
    setProgress((p) => {
      const n = { ...p };
      if (status) n[id] = status; else delete n[id];
      return n;
    });
  };

  if (authed === null) return <div className="loading">Loading...</div>;
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />;

  const rounds = ["all", ...Object.keys(ROUND_NAMES)];
  const types = ["all", ...Object.keys(TYPE_NAMES)];
  const list = questions.filter(
    (q) => (round === "all" || q.round === round) && (type === "all" || q.type === type)
  );

  return (
    <>
      <h1>Browse</h1>
      <p className="sub"><a href="/prep">Back to prep home</a> · {list.length} questions</p>
      <div className="chips" style={{ marginBottom: 8 }}>
        {rounds.map((r) => (
          <button key={r} className={round === r ? "on" : ""} onClick={() => setRound(r)}>
            {r === "all" ? "All rounds" : ROUND_NAMES[r]}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 16 }}>
        {types.map((t) => (
          <button key={t} className={type === t ? "on" : ""} onClick={() => setType(t)}>
            {t === "all" ? "All types" : TYPE_NAMES[t]}
          </button>
        ))}
      </div>
      {list.map((q) => (
        <div className="card" key={q.id}>
          <div className="qhead">
            <span><span className="tag">{ROUND_NAMES[q.round]}</span> <span className="tag">{TYPE_NAMES[q.type] || q.type}</span></span>
            {progress[q.id] === "practiced" && <span style={{ color: "#34d399" }}>practiced</span>}
            {progress[q.id] === "needs_work" && <span style={{ color: "#fbbf24" }}>needs work</span>}
          </div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
          {open === q.id ? (
            <>
              <div className="explain" style={{ marginBottom: 12 }}>{q.answer}</div>
              <div className="chips">
                <button className={progress[q.id] === "practiced" ? "on" : ""} onClick={() => mark(q.id, progress[q.id] === "practiced" ? null : "practiced")}>Practiced</button>
                <button className={progress[q.id] === "needs_work" ? "on" : ""} onClick={() => mark(q.id, progress[q.id] === "needs_work" ? null : "needs_work")}>Needs work</button>
                <button onClick={() => setOpen(null)}>Hide</button>
              </div>
            </>
          ) : (
            <button className="btn ghost" style={{ margin: 0 }} onClick={() => setOpen(q.id)}>Show model answer</button>
          )}
        </div>
      ))}
    </>
  );
}
