"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ROUND_NAMES, TYPE_NAMES, usePrepAuth, PasswordGate } from "../shared";

interface Q { id: string; round: string; type: string; question: string; answer: string; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Drill() {
  const sp = useSearchParams();
  const round = sp.get("round") || "all";
  const [type, setType] = useState("all");
  const [authed, setAuthed] = usePrepAuth();
  const [deck, setDeck] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const loadDeck = (t: string) => {
    const p = new URLSearchParams();
    if (round !== "all") p.set("round", round);
    if (t !== "all") p.set("type", t);
    fetch(`/api/prep/questions?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => { setDeck(shuffle(d.questions || [])); setIdx(0); setRevealed(false); });
  };

  useEffect(() => {
    if (!authed) return;
    loadDeck(type);
  }, [authed]);

  const mark = async (status: string) => {
    const q = deck[idx];
    await fetch("/api/prep/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: q.id, status }),
    });
    setDone(done + 1);
    next();
  };

  const next = () => {
    setIdx((idx + 1) % deck.length);
    setRevealed(false);
  };

  const prev = () => {
    setIdx((idx - 1 + deck.length) % deck.length);
    setRevealed(false);
  };

  if (authed === null) return <div className="loading">Loading...</div>;
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />;
  if (!deck.length) return <div className="loading">Shuffling questions...</div>;

  const q = deck[idx];
  return (
    <>
      <h1>Drill{round !== "all" ? `: ${ROUND_NAMES[round]}` : ""}</h1>
      <p className="sub"><a href="/prep">Back to prep home</a> · card {idx + 1} of {deck.length} · {done} marked this session</p>
      <div className="chips" style={{ marginBottom: 16 }}>
        {["all", ...Object.keys(TYPE_NAMES)].map((t) => (
          <button key={t} className={type === t ? "on" : ""} onClick={() => { setType(t); loadDeck(t); }}>
            {t === "all" ? "All types" : TYPE_NAMES[t]}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="qhead"><span className="tag">{ROUND_NAMES[q.round]}</span></div>
        <div style={{ fontSize: "1.2rem", fontWeight: 600, lineHeight: 1.4, marginBottom: 16 }}>{q.question}</div>
        {revealed ? (
          <>
            <div className="explain" style={{ marginBottom: 16 }}>{q.answer}</div>
            <div className="seg">
              <button onClick={() => mark("practiced")}>Got it</button>
              <button onClick={() => mark("needs_work")}>Needs work</button>
              <button onClick={next}>Skip</button>
            </div>
          </>
        ) : (
          <button className="btn" onClick={() => setRevealed(true)}>Reveal model answer</button>
        )}
      </div>
      <div className="seg" style={{ marginTop: 12 }}>
        <button onClick={prev}>← Back</button>
        <button onClick={next}>Forward →</button>
      </div>
      <p className="sub">Say your answer out loud before revealing. That is the whole point.</p>
    </>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Drill />
    </Suspense>
  );
}
