import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from "lucide-react";

const FloatingCall = () => {
  const {
    isInCall,
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    leaveCall,
    activeRoom,
  } = useCall();

  const location = useLocation();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);

  // Attach local video stream when floating widget mounts or stream updates
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.warn("Local play warning:", err));
    }
  }, [localStream, isInCall, location.pathname]);

  // Keep remote audio active across all routes
  const remoteEntries = Object.entries(remoteStreams || {});

  // When on the dedicated /videoCall page, hide the floating overlay
  if (!isInCall || location.pathname === "/videoCall") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-purple-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-3 w-72 transition-all">
      {/* Background Audio Players for All Remote Roommates */}
      {remoteEntries.map(([uid, stream]) => (
        <RemoteAudioPlayer key={uid} stream={stream} />
      ))}

      {/* Header Bar */}
      <div className="flex items-center justify-between text-xs text-slate-300 font-mono px-1">
        <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Room: {activeRoom}
        </span>
        <button
          onClick={() => navigate("/videoCall")}
          title="Open Full View"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Video Viewport: Shows Local Feed or Remote Peer Feed */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isCameraOff ? "hidden" : "block"}`}
        />
        {isCameraOff && (
          <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
            <VideoOff size={22} className="text-slate-500" />
            <span>Camera Off</span>
          </div>
        )}

        {/* Small thumbnail for remote peer if connected */}
        {remoteEntries.length > 0 && (
          <div className="absolute top-2 right-2 w-20 aspect-video rounded-lg overflow-hidden border border-purple-500 shadow-md bg-black">
            <MiniRemoteVideo stream={remoteEntries[0][1]} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={toggleMute}
          className={`p-2.5 rounded-xl text-white transition-all ${
            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-2.5 rounded-xl text-white transition-all ${
            isCameraOff ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
          }`}
          title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
        </button>

        <button
          onClick={leaveCall}
          className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
          title="Disconnect Call"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
};

// Component dedicated to playing remote audio in the background across routes
const RemoteAudioPlayer = ({ stream }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch((err) => console.warn("Remote audio play warning:", err));
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
};

// Mini video thumbnail for remote participant
const MiniRemoteVideo = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.warn("Mini remote play warning:", err));
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
};

export default FloatingCall;
