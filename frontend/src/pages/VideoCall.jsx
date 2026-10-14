import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";

const VideoCall = () => {
  const {
    isInCall,
    connected,
    activeRoom,
    localStream,
    remoteStreams,
    remoteUsers,
    isMuted,
    isCameraOff,
    screenSharing,
    startCall,
    leaveCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useCall();

  const localVideoRef = useRef(null);

  useEffect(() => {
    if (!isInCall) {
      startCall();
    }
  }, [isInCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="text-center min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl font-semibold mb-6">Room: {activeRoom}</h2>

      <div className="flex justify-center gap-5 flex-wrap">
        <div>
          <h4 className="text-lg font-medium mb-2">You</h4>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-[300px] h-[225px] object-cover rounded-lg border-4 border-green-500 shadow-lg ${
              isCameraOff ? "opacity-30" : "opacity-100"
            }`}
          />
        </div>

        {Object.entries(remoteStreams).map(([uid, stream]) => (
          <RemoteVideoCard key={uid} userId={uid} stream={stream} />
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 text-white rounded transition-colors ${
            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 text-white rounded transition-colors ${
            isCameraOff ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
        </button>

        <button
          onClick={toggleScreenShare}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {screenSharing ? "Stop Sharing" : "Share Screen"}
        </button>

        <button
          onClick={leaveCall}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Leave Call
        </button>
      </div>

      {!connected && isInCall && (
        <p className="mt-6 text-gray-400">Connecting your media...</p>
      )}
    </div>
  );
};

const RemoteVideoCard = ({ userId, stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div>
      <h4 className="text-lg font-medium mb-2">Peer ({userId.slice(0, 5)})</h4>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-[300px] h-[225px] object-cover rounded-lg border-4 border-purple-500 shadow-lg"
      />
    </div>
  );
};

export default VideoCall;
