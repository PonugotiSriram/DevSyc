import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import io from "socket.io-client";
import { useCall } from "../context/CallContext";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CodeIcon from "@mui/icons-material/Code";
import QuizIcon from "@mui/icons-material/Quiz";
import ForumIcon from "@mui/icons-material/Forum";
import VideoChatRoundedIcon from "@mui/icons-material/VideoChatRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonIcon from "@mui/icons-material/Person";

const socket = io.connect("https://devsync-backend-tbv2.onrender.com/");

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(
    parseInt(localStorage.getItem("chat_unread") || "0", 10)
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { isInCall } = useCall() || {};

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Keep socket in the active room whenever navigating
  useEffect(() => {
    const syncRoom = () => {
      const roomCode = localStorage.getItem("roomCode");
      const currentUser = localStorage.getItem("userId") || localStorage.getItem("userName") || "User";
      if (roomCode) {
        socket.emit("join-room", { roomCode, userId: currentUser });
      }
    };

    syncRoom();
    socket.on("connect", syncRoom);

    const handleIncoming = (data) => {
      const currentRoom = localStorage.getItem("roomCode");
      const currentUser = localStorage.getItem("userId") || localStorage.getItem("userName");

      // Save to background storage so Forums has it when opened
      if (currentRoom && data) {
        try {
          const current = JSON.parse(localStorage.getItem(`chat_${currentRoom}`) || "[]");
          current.push({ ...data, timestamp: data.timestamp || new Date().toISOString() });
          localStorage.setItem(`chat_${currentRoom}`, JSON.stringify(current));
        } catch (e) {
          console.error("Storage error:", e);
        }
      }

      // If user is NOT on the chat page and message is from someone else -> show badge
      if (window.location.pathname !== "/forums" && data?.client !== currentUser) {
        setUnreadChat((prev) => {
          const next = prev + 1;
          localStorage.setItem("chat_unread", next.toString());
          return next;
        });
      }
    };

    socket.on("text-message", handleIncoming);

    const handleReadEvent = () => {
      setUnreadChat(0);
      localStorage.setItem("chat_unread", "0");
    };
    window.addEventListener("chat-read", handleReadEvent);

    return () => {
      socket.off("text-message", handleIncoming);
      socket.off("connect", syncRoom);
      window.removeEventListener("chat-read", handleReadEvent);
    };
  }, [location.pathname]);

  // Clear unread count when viewing /forums
  useEffect(() => {
    if (location.pathname === "/forums") {
      setUnreadChat(0);
      localStorage.setItem("chat_unread", "0");
    }
  }, [location.pathname]);

  const handleLogOut = () => {
    localStorage.removeItem("isLogin");
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const navItems = [
    { name: "Home", link: "/dashboard", icon: <HomeIcon /> },
    { name: "Board", link: "/editor", icon: <EditRoundedIcon /> },
    { name: "Collab", link: "/collab", icon: <CodeIcon /> },
    { name: "Quiz", link: "/test", icon: <QuizIcon /> },
    {
      name: "Chat Room",
      link: "/forums",
      icon: <ForumIcon />,
      badge: unreadChat > 0 ? (unreadChat > 9 ? "9+" : unreadChat) : null,
    },
    {
      name: "Video Call",
      link: "/videoCall",
      icon: <VideoChatRoundedIcon />,
      indicator: isInCall ? "bg-emerald-500 animate-pulse" : null,
    },
    { name: "Test Dashboard", link: "/testDashboard", icon: <DashboardCustomizeRoundedIcon /> },
    { name: "Test Setup", link: "/testSetup", icon: <BuildRoundedIcon /> },
  ];

  const hideNavbarPaths = ["/", "/signup", "/login"];
  if (hideNavbarPaths.includes(location.pathname)) return null;

  return (
    <>
      <motion.div
        initial={{ width: "60px" }}
        animate={{
          width: isOpen ? "200px" : "60px",
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className="fixed top-0 left-0 h-screen bg-[#1e1e1e] text-white z-40 flex flex-col shadow-lg select-none"
      >
        {/* Toggle */}
        <div className="flex justify-center items-center p-2 border-b border-gray-800">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            {isOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-6">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.link;
              return (
                <li key={index} className="relative">
                  <a
                    href={item.link}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.link);
                    }}
                    className={cn(
                      "flex items-center transition-colors relative",
                      isOpen ? "px-4" : "justify-center",
                      isActive ? "text-purple-400 font-semibold" : "text-gray-400 hover:text-white"
                    )}
                    title={!isOpen ? item.name : ""}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-xl">{item.icon}</span>

                      {/* Visible Red Badge on Collapsed Sidebar */}
                      {!isOpen && item.badge && (
                        <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ring-[#1e1e1e] shadow-md z-10">
                          {item.badge}
                        </span>
                      )}

                      {/* Video Call Indicator */}
                      {!isOpen && item.indicator && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${item.indicator} ring-2 ring-[#1e1e1e]`} />
                      )}
                    </div>

                    {isOpen && (
                      <div className="flex items-center justify-between w-full ml-3">
                        <span className="text-sm truncate">{item.name}</span>

                        {/* Red Badge with Count on Expanded Sidebar */}
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                            {item.badge}
                          </span>
                        )}

                        {item.indicator && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                            <span className={`w-2 h-2 rounded-full ${item.indicator}`} />
                            Live
                          </span>
                        )}
                      </div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile")}
            className={cn(
              "flex items-center transition-colors w-full",
              isOpen ? "px-4 py-2" : "justify-center py-2",
              "text-green-400 hover:text-green-300"
            )}
          >
            <span className="text-xl">
              <PersonIcon />
            </span>
            {isOpen && <span className="ml-3 text-sm">Profile</span>}
          </button>

          <button
            onClick={handleLogOut}
            className={cn(
              "flex items-center transition-colors w-full",
              isOpen ? "px-4 py-2" : "justify-center py-2",
              "text-red-400 hover:text-red-300"
            )}
          >
            <span className="text-xl">
              <LogoutRoundedIcon />
            </span>
            {isOpen && <span className="ml-3 text-sm">Log Out</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div
        className="min-h-screen transition-all duration-300"
        style={{ paddingLeft: isOpen ? "200px" : "60px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          />
        </AnimatePresence>
      </div>
    </>
  );
};

export default Sidebar;
