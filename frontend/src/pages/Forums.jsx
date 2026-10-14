import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  MessageSquare,
  Send,
  LogOut,
  ArrowDown,
  Clock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io.connect("https://devsync-backend-tbv2.onrender.com/");

const Forums = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const nav = useNavigate();
  const code = localStorage.getItem("roomCode");
  const client = localStorage.getItem("userId") || localStorage.getItem("userName") || "User";

  useEffect(() => {
    if (!code) {
      toast.error("Please join a room first");
      nav("/");
      return;
    }

    setRoomCode(code);
    setUser(client);
    socket.emit("join-room", { roomCode: code, userId: client });

    // Clear unread notifications when entering chat
    localStorage.setItem("chat_unread", "0");
    window.dispatchEvent(new Event("chat-read"));

    const savedChat = localStorage.getItem(`chat_${code}`);
    if (savedChat) {
      try {
        setChat(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse saved chat", e);
      }
    }

    const handleReceiveMessage = (payload) => {
      setChat((prev) => {
        const updatedChat = [
          ...prev,
          { ...payload, timestamp: payload.timestamp || new Date().toISOString() },
        ];
        localStorage.setItem(`chat_${code}`, JSON.stringify(updatedChat));
        return updatedChat;
      });
    };

    socket.on("text-message", handleReceiveMessage);

    return () => {
      socket.off("text-message", handleReceiveMessage);
    };
  }, [code, client, nav]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !roomCode) return;

    socket.emit("text-message", {
      message: trimmed,
      client: user,
      code: roomCode,
    });

    setMessage("");
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomCode: code, userId: client });
    localStorage.removeItem("roomCode");
    nav("/");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <ToastContainer position="top-right" theme="dark" />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Room Chat</h1>
            <div className="text-xs text-gray-300">
              <span>Room: {roomCode}</span>
            </div>
          </div>
        </div>
        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md text-sm font-semibold"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Exit Room
        </button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <MessageSquare className="h-12 w-12 text-gray-600" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.map((msg, idx) => {
            const isMe = msg.client === user;
            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {isMe ? "You" : msg.client}
                </span>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-md max-w-[70%] break-words ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none"
                  }`}
                >
                  <p>{msg.message}</p>
                  <div className={`text-[10px] mt-1 flex items-center ${isMe ? "text-blue-200 justify-end" : "text-gray-400 justify-start"}`}>
                    <Clock className="h-3 w-3 mr-1 inline" />
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="bg-gray-800/90 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
          <input
            type="text"
            name="chat"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forums;
