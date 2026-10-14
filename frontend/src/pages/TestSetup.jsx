import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import { QuizUpload } from "../components/Quiz-upload";
import { RoomEntry } from "../components/Room-entry";

export default function TestSetup() {
  const nav = useNavigate();

  const [roomCode, setRoomCode] = useState(localStorage.getItem("roomCode") || "");
  // Treat any user who has a roomCode on this page as host; fall back to role check.
  const [isHost, setIsHost] = useState(
    !!(localStorage.getItem("roomCode")) || localStorage.getItem("role") === "admin"
  );

  // If already in a room as host, skip straight to setup
  const [step, setStep] = useState(
    localStorage.getItem("roomCode") && localStorage.getItem("role") === "admin"
      ? "setup"
      : "room"
  ); // "room" | "setup" | "done"

  const handleRoomJoin = (code, id) => {
    localStorage.setItem("roomCode", code);
    localStorage.setItem("userId", id);
    setRoomCode(code);
    setIsHost(true); // creator is always host
    setStep("setup");
  };

  const handleQuizUpload = () => {
    setStep("done");
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BuildRoundedIcon className="text-indigo-400" fontSize="large" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Test Setup
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-10">
          Create or join a room, then upload or generate a quiz for your participants.
        </p>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center gap-2 text-sm">
          {["Room", "Upload Quiz", "Ready"].map((label, idx) => {
            const stepIndex = ["room", "setup", "done"].indexOf(
              step === "room" && roomCode && isHost ? "setup" : step
            );
            const active = idx === stepIndex;
            const done = idx < stepIndex;
            return (
              <React.Fragment key={label}>
                <span
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    active
                      ? "bg-indigo-600 text-white"
                      : done
                      ? "bg-green-700/40 text-green-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {idx < 2 && (
                  <span className="text-slate-600 select-none">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-3xl">
        {/* Step 1: Room entry */}
        {(step === "room" && !(roomCode && isHost)) && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">
              Join or create a room as the host to continue.
            </p>
            <RoomEntry onRoomJoin={handleRoomJoin} />
          </div>
        )}

        {/* Step 2: Quiz upload/setup */}
        {(step === "setup" || (step === "room" && roomCode && isHost)) && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">ROOM CODE</p>
                <p className="text-xl font-mono tracking-widest text-green-400">{roomCode}</p>
              </div>
              <span className="text-xs bg-indigo-700/40 text-indigo-300 px-3 py-1 rounded-full font-semibold">
                Host
              </span>
            </div>

            {roomCode && (
              <QuizUpload onQuizUpload={handleQuizUpload} roomCode={roomCode} />
            )}
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="bg-slate-800 border border-green-700/40 rounded-xl p-10 text-center shadow-lg">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Quiz Ready!</h2>
            <p className="text-slate-300 mb-2">
              Your quiz has been uploaded and saved for room{" "}
              <span className="font-mono text-green-400">{roomCode}</span>.
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Participants can now join the room and take the quiz.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => nav("/test")}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
              >
                Go to Quiz Lobby
              </button>
              <button
                onClick={() => nav("/testDashboard")}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
