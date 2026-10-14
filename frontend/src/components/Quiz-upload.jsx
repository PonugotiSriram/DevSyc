import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

// ── Validate manually-entered quiz JSON ────────────────────────────────────────
function validateQuizData(data) {
  if (!Array.isArray(data)) throw new Error("Quiz data must be an array.");
  data.forEach((q) => {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      typeof q.correctAnswer !== "number" ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) throw new Error("Invalid question format.");
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
export function QuizUpload({ onQuizUpload, roomCode }) {
  const nav = useNavigate();

  // tabs: "upload" | "ai"
  const [tab, setTab] = useState("ai");

  // Manual upload state
  const [jsonData, setJsonData] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // AI generation state
  const [subjects, setSubjects] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genStatus, setGenStatus] = useState("");

  // ── Manual upload handlers ──────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        validateQuizData(data);
        setJsonData(JSON.stringify(data, null, 2));
        setUploadError("");
      } catch {
        setUploadError("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = async () => {
    try {
      setIsUploading(true);
      setUploadError("");
      const data = JSON.parse(jsonData);
      validateQuizData(data);
      const res = await fetch("http://localhost:5000/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, quizData: data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error saving quiz");
      onQuizUpload(data);
    } catch (err) {
      setUploadError("Failed: " + (err.message || "Invalid JSON data."));
    } finally {
      setIsUploading(false);
    }
  };

  // ── AI generation handler ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!subjects.trim()) { setGenError("Please enter at least one subject."); return; }
    if (!roomCode) { setGenError("No room code found. Please go back and join a room first."); return; }

    try {
      setIsGenerating(true);
      setGenError("");
      setGenStatus("Generating quiz with AI… this may take a few seconds.");

      const res = await axios.post("http://localhost:5000/api/init-quiz", {
        subjects: subjects.trim(),
        difficulty,
        roomCode,
      });

      if (res.data?.success) {
        setGenStatus("Quiz generated successfully! Redirecting…");
        localStorage.setItem("roomCode", roomCode); // persist for refresh safety
        onQuizUpload();
        setTimeout(() => nav("/test", { state: { roomCode } }), 800);
      } else {
        setGenError(res.data?.message || "Generation failed. Please try again.");
      }
    } catch (err) {
      setGenError(
        "Error: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Unknown error")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white text-center mb-2">Configure Quiz</h2>
      <p className="text-center text-slate-400 mb-5 text-sm">
        Generate with AI or upload a JSON file manually.
      </p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "ai", label: "AI Generate", Icon: AiIcon },
          { key: "upload", label: "Manual Upload", Icon: UploadIcon },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {/* ── AI Generate Tab ── */}
      {tab === "ai" && (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Subjects / Topics</label>
            <input
              type="text"
              placeholder="e.g. JavaScript, React, Data Structures"
              value={subjects}
              onChange={(e) => { setSubjects(e.target.value); setGenError(""); }}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {genError && <p className="text-red-400 text-sm">{genError}</p>}
          {genStatus && !genError && <p className="text-indigo-300 text-sm">{genStatus}</p>}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-wait text-white font-bold rounded-lg transition-all"
          >
            {isGenerating ? "Generating…" : "Generate Quiz with AI"}
          </button>
        </div>
      )}

      {/* ── Manual Upload Tab ── */}
      {tab === "upload" && (
        <div className="space-y-4">
          <label
            htmlFor="quiz-file-upload"
            className="w-full flex items-center justify-center p-4 bg-slate-700 text-white rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
          >
            <UploadIcon />
            <span className="font-semibold">Upload from File (.json)</span>
          </label>
          <input
            id="quiz-file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <textarea
            placeholder="Or paste your quiz JSON here…"
            rows={10}
            value={jsonData}
            onChange={(e) => { setJsonData(e.target.value); setUploadError(""); }}
            className="w-full p-3 font-mono text-sm bg-slate-900 text-slate-200 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}

          <div>
            <p className="text-slate-300 mb-2 text-sm">Expected JSON format:</p>
            <pre className="bg-slate-900/70 p-4 rounded-lg text-xs text-slate-400 overflow-x-auto">{`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  }
]`}</pre>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={!jsonData.trim() || isUploading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
          >
            {isUploading ? "Uploading…" : "Start Quiz with this Data"}
          </button>
        </div>
      )}
    </div>
  );
}
