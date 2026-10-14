import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import QuizIcon from "@mui/icons-material/Quiz";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

const StatCard = ({ label, value, color = "text-indigo-400" }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
    <p className="text-slate-400 text-sm mt-1">{label}</p>
  </div>
);

export default function TestDashboard() {
  const nav = useNavigate();
  const userId = localStorage.getItem("userId");
  const roomCode = localStorage.getItem("roomCode");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    async function fetchResults() {
      // Only attempt fetch if we have a userId and roomCode
      if (!userId || !roomCode) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/results?userId=${userId}&roomCode=${roomCode}`
        );
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Could not load results. Start a quiz session first.");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [userId, roomCode]);

  const scorePercent =
    results?.totalQuestions > 0
      ? Math.round((results.score / results.totalQuestions) * 100)
      : null;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-3 mb-1">
          <DashboardCustomizeRoundedIcon className="text-indigo-400" fontSize="large" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Test Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-10">
          View your latest quiz performance and session details.
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <p className="text-slate-400 text-lg animate-pulse">Loading results…</p>
          </div>
        )}

        {/* No session active */}
        {!loading && !userId && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center shadow-lg">
            <QuizIcon sx={{ fontSize: 56 }} className="text-slate-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No Active Session</h2>
            <p className="text-slate-400 mb-6">
              You haven't joined a quiz room yet. Head over to the Quiz page to get started.
            </p>
            <button
              onClick={() => nav("/test")}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
            >
              Go to Quiz
            </button>
          </div>
        )}

        {/* Error state */}
        {!loading && userId && error && (
          <div className="bg-slate-800 border border-red-700/40 rounded-xl p-10 text-center shadow-lg">
            <p className="text-red-400 text-lg font-semibold mb-2">No Results Found</p>
            <p className="text-slate-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => nav("/test")}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
              >
                Take a Quiz
              </button>
              <button
                onClick={() => nav("/testSetup")}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all"
              >
                Set Up a Test
              </button>
            </div>
          </div>
        )}

        {/* Results available */}
        {!loading && results && !error && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Score" value={`${results.score} / ${results.totalQuestions}`} color="text-green-400" />
              <StatCard label="Accuracy" value={`${scorePercent}%`} color={scorePercent >= 70 ? "text-green-400" : "text-red-400"} />
              <StatCard label="Room Code" value={results.roomCode || roomCode} color="text-purple-400" />
              <StatCard label="Questions" value={results.totalQuestions} color="text-indigo-400" />
            </div>

            {/* Answer breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <EmojiEventsIcon className="text-yellow-400" />
                <h2 className="text-lg font-semibold text-slate-200">Answer Breakdown</h2>
              </div>
              {results.answers && results.answers.length > 0 ? (
                <ul className="space-y-2">
                  {results.answers.map((answer, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg"
                    >
                      <span
                        className={`h-3 w-3 rounded-full flex-shrink-0 ${
                          answer.isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-slate-300 text-sm">
                        Question {answer.questionIndex + 1}:{" "}
                        <strong className={answer.isCorrect ? "text-green-400" : "text-red-400"}>
                          {answer.isCorrect ? "Correct" : "Incorrect"}
                        </strong>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">No answer data available.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => nav("/test")}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => nav("/testSetup")}
                className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all"
              >
                <BuildRoundedIcon fontSize="small" />
                Set Up New Test
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
