import React, { useState } from "react";

export function RoomEntry({ onRoomJoin }) {
  const existingCode = localStorage.getItem("roomCode") || "";
  const [tab, setTab] = useState(existingCode ? "join" : "create"); // "join" | "create"
  const [roomCode, setRoomCode] = useState(existingCode);
  const [userName, setUserName] = useState(localStorage.getItem("userId") || "");
  const [error, setError] = useState("");

  const mkId = () => Math.random().toString(36).substring(2, 10);

  const handleCreate = () => {
    if (!userName.trim()) { setError("Please enter your name."); return; }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = mkId();
    localStorage.setItem("role", "admin");
    onRoomJoin(code, userId);
  };

  const handleJoin = () => {
    if (!roomCode.trim()) { setError("Please enter a room code."); return; }
    if (!userName.trim()) { setError("Please enter your name."); return; }
    const userId = mkId();
    onRoomJoin(roomCode.trim().toUpperCase(), userId);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white text-center mb-2">Quiz Room</h2>
      <p className="text-center text-slate-400 mb-5 text-sm">Create or join a quiz room to continue.</p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        {["join", "create"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            {t === "join" ? "Join Room" : "Create Room"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === "join" && (
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(""); }}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => { setUserName(e.target.value); setError(""); }}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={tab === "join" ? handleJoin : handleCreate}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
        >
          {tab === "join" ? "Join Room" : "Create Room"}
        </button>
      </div>
    </div>
  );
}
