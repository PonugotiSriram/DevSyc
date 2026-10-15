import React from "react";
import { User } from "lucide-react";

export default function ActiveMembers({ members = [], currentUser }) {
  const getAvatarColor = (name) => {
    let hash = 0;
    const str = name || "User";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-cyan-600",
      "from-purple-600 to-indigo-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600"
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  const cleanMembers = Array.from(new Set(members.filter(Boolean)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg w-full max-w-sm select-none">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          Active Roommates
        </h3>
        <div className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {cleanMembers.length} Online
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {cleanMembers.map((memberName, index) => {
          const isMe = memberName === currentUser;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarColor(memberName)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                  {getInitials(memberName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate flex items-center gap-1.5">
                    <span className="truncate">{memberName}</span>
                    {isMe && <span className="text-[10px] text-purple-400 font-semibold">(You)</span>}
                  </p>
                  <p className="text-[11px] text-slate-400">Collaborator</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
