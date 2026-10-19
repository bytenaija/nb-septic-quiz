"use client";

import { useEffect, useState } from "react";

export const ROUND_NAMES: Record<string, string> = {
  recruiter: "Recruiter Screen",
  hiring_manager: "Hiring Manager",
  technical: "Technical",
  culture: "Culture",
  closing: "Your Questions",
};

export const TYPE_NAMES: Record<string, string> = {
  pitch: "Pitch",
  behavioral: "Behavioral",
  situational: "Situational",
  technical: "Technical",
  "system-design": "System Design",
  logistics: "Logistics",
  "ask-them": "Ask Them",
};

export function usePrepAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/prep/me").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
  }, []);
  return [authed, setAuthed] as const;
}

export function PasswordGate({ onAuthed }: { onAuthed: () => void }) {
  const [pw, setPw] = useState("");
  const [bad, setBad] = useState(false);
  const submit = async () => {
    const r = await fetch("/api/prep/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (r.ok) onAuthed();
    else setBad(true);
  };
  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Interview prep</h2>
      <p className="sub">This section is private. Enter the password.</p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "#0f1830",
          color: "var(--text)",
          fontSize: "1rem",
          marginBottom: 12,
        }}
      />
      {bad && <p className="error" style={{ padding: 0, textAlign: "left" }}>Wrong password.</p>}
      <button className="btn" onClick={submit}>Unlock</button>
    </div>
  );
}
