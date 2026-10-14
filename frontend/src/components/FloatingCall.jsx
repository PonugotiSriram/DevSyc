import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from "lucide-react";

const FloatingCall = () => {
  const {
    isInCall,
    localStream,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    leaveCall,
    activeRoom,
  } = useCall();

  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isInCall]);

  // Hide the floating widget if user is currently inside the full /videoCall page
  if (!isInCall || location.pathname === "/videoCall") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-purple-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-3 w-64 transition-all">
      <div className="flex items-center justify-between text-xs text-slate-300 font-mono px-1">
        <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Room: {activeRoom}
        </span>
        <button
          onClick={() => navigate("/videoCall")}
          title="Full View"
          className="text-slate-400 hover:text-white"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isCameraOff ? "hidden" : "block"}`}
        />
        {isCameraOff && (
          <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
            <VideoOff size={24} />
            <span>Camera Off</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg text-white transition-colors ${
            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-2 rounded-lg text-white transition-colors ${
            isCameraOff ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"
          }`}
          title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
        </button>

        <button
          onClick={leaveCall}
          className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Disconnect Call"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
};

export default FloatingCall;
