import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const CallContext = createContext(null);
const SERVER_URL = "https://devsync-backend-tbv2.onrender.com/";

const iceConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const [isInCall, setIsInCall] = useState(false);
  const [connected, setConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeRoom, setActiveRoom] = useState(localStorage.getItem("roomCode") || "");

  const startCall = async () => {
    if (isInCall) return;
    const roomCode = localStorage.getItem("roomCode") || "GLOBAL";
    setActiveRoom(roomCode);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setIsInCall(true);

      socketRef.current = io(SERVER_URL, {
        transports: ["websocket"],
        secure: true,
      });

      socketRef.current.on("connect", () => {
        setConnected(true);
        socketRef.current.emit("join-room", {
          roomCode,
          userId: socketRef.current.id,
        });
      });

      socketRef.current.on("user-joined", async (joinedUserId) => {
        if (joinedUserId === socketRef.current.id) return;
        setRemoteUsers((prev) => [...new Set([...prev, joinedUserId])]);

        const pc = createPeerConnection(joinedUserId, roomCode);
        peerConnectionsRef.current[joinedUserId] = pc;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit("signal", {
          roomCode,
          message: offer,
          toId: joinedUserId,
        });
      });

      socketRef.current.on("signal", async (fromId, message) => {
        let pc = peerConnectionsRef.current[fromId];
        if (!pc) {
          pc = createPeerConnection(fromId, roomCode);
          peerConnectionsRef.current[fromId] = pc;
        }

        if (message.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketRef.current.emit("signal", {
            roomCode,
            message: answer,
            toId: fromId,
          });
        } else if (message.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          } catch (err) {
            console.error("ICE error:", err);
          }
        }
      });

      socketRef.current.on("user-left", (id) => {
        if (peerConnectionsRef.current[id]) {
          peerConnectionsRef.current[id].close();
          delete peerConnectionsRef.current[id];
        }
        setRemoteUsers((prev) => prev.filter((u) => u !== id));
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      });
    } catch (err) {
      console.error("Failed to start media call:", err);
    }
  };

  const createPeerConnection = (remoteUserId, roomCode) => {
    const pc = new RTCPeerConnection(iceConfig);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("signal", {
          roomCode,
          message: { candidate: event.candidate },
          toId: remoteUserId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received from:", remoteUserId, event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [remoteUserId]: event.streams[0],
        }));
      }
    };

    return pc;
  };

  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsInCall(false);
    setConnected(false);
    setRemoteUsers([]);
    setRemoteStreams({});
    setScreenSharing(false);
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenTrackRef.current = screenStream.getTracks()[0];

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrackRef.current);
        });

        screenTrackRef.current.onended = () => stopScreenShare();
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });

    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    setScreenSharing(false);
  };

  return (
    <CallContext.Provider
      value={{
        isInCall,
        connected,
        activeRoom,
        localStream: localStreamRef.current,
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
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);


