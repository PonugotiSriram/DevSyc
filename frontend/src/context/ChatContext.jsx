import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

const ChatContext = createContext(null);
const SERVER_URL = "https://devsync-backend-tbv2.onrender.com/";

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const location = useLocation();

  const roomCode = localStorage.getItem("roomCode") || "GLOBAL";
  const user = localStorage.getItem("userName") || "User";

  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      transports: ["websocket"],
      secure: true,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-room", {
        roomCode,
        userId: socketRef.current.id,
      });
    });

    socketRef.current.on("text-message", (data) => {
      setMessages((prev) => [...prev, data]);

      // If user is not currently in the /forums room, count as unread
      if (window.location.pathname !== "/forums") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomCode]);

  // Reset unread count whenever user navigates to /forums
  useEffect(() => {
    if (location.pathname === "/forums") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const sendMessage = (text) => {
    if (text.trim() !== "" && socketRef.current) {
      socketRef.current.emit("text-message", {
        message: text,
        client: user,
        code: roomCode,
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        unreadCount,
        sendMessage,
        socket: socketRef.current,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
