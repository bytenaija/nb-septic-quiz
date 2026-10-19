"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHAPTER_NAMES: Record<string, string> = {
  "1": "General",
  "2": "Introduction",
  "3": "Site Evaluation",
  "4": "System Design",
  "5": "Licensing",
  "6": "Appendices",
};

const LENGTHS = [20, 50, 100];

export default function StartPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"random" | "sequential">("random");
  const [length, setLength] = useState<number | "all">(50);
  const [style, setStyle] = useState<"practice" | "exam">("practice");
  const [chapter, setChapter] = useState<string>("all");
  const [chapters, setChapters] = useState<{ chapter: string; n: number }[]>([]);

  useEffect(() => {
    fetch("/api/quiz?list=chapters")
      .then((r) => r.json())
      .then((d) => setChapters(d.chapters || []))
      .catch(() => {});
  }, []);

  const start = () => {
    const p = new URLSearchParams({
      mode,
      style,
      n: length === "all" ? "612" : String(length),
    });
    if (mode === "sequential" && chapter !== "all") p.set("chapter", chapter);
    router.push(`/quiz?${p.toString()}`);
  };

  return (
    <>
      <h1>NB Septic Installer Quiz</h1>
      <p className="sub">
        612 questions from the Technical Guidelines. Exam pass mark is 85 percent.
      </p>

      <div className="card">
        <h2>Mode</h2>
        <div className="seg">
          <button className={mode === "random" ? "on" : ""} onClick={() => setMode("random")}>
            Random Mix
          </button>
          <button className={mode === "sequential" ? "on" : ""} onClick={() => setMode("sequential")}>
            Sequential by Section
          </button>
        </div>
      </div>

      {mode === "sequential" && (
        <div className="card">
          <h2>Chapter</h2>
          <div className="chips">
            <button className={chapter === "all" ? "on" : ""} onClick={() => setChapter("all")}>
              All chapters
            </button>
            {chapters.map((c) => (
              <button
                key={c.chapter}
                className={chapter === c.chapter ? "on" : ""}
                onClick={() => setChapter(c.chapter)}
              >
                Ch {c.chapter}: {CHAPTER_NAMES[c.chapter] || ""} ({c.n})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Questions</h2>
        <div className="chips">
          {LENGTHS.map((l) => (
            <button key={l} className={length === l ? "on" : ""} onClick={() => setLength(l)}>
              {l}
            </button>
          ))}
          <button className={length === "all" ? "on" : ""} onClick={() => setLength("all")}>
            All 612
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Style</h2>
        <div className="seg">
          <button className={style === "practice" ? "on" : ""} onClick={() => setStyle("practice")}>
            Practice (instant feedback)
          </button>
          <button className={style === "exam" ? "on" : ""} onClick={() => setStyle("exam")}>
            Exam simulation (3 hour timer)
          </button>
        </div>
      </div>

      <button className="btn" onClick={start}>
        Start quiz
      </button>
    </>
  );
}
