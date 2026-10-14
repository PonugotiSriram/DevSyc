import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useCall } from "../context/CallContext";
import { useChat } from "../context/ChatContext";

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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic context states for notifications
  const { isInCall } = useCall() || {};
  const { unreadCount } = useChat() || {};

  const toggleSidebar = () => setIsOpen(!isOpen);

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
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null,
      badgeColor: "bg-red-500"
    },
    { 
      name: "Video Call", 
      link: "/videoCall", 
      icon: <VideoChatRoundedIcon />,
      indicator: isInCall ? "bg-emerald-500 animate-pulse" : null
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
        {/* Sidebar Toggle */}
        <div className="flex justify-center items-center p-2 border-b border-gray-800">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            {isOpen ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
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
                      isActive
                        ? "text-purple-400 font-semibold"
                        : "text-gray-400 hover:text-white"
                    )}
                    title={!isOpen ? item.name : ""}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-xl">{item.icon}</span>

                      {/* Notification Badge on Collapsed Icon */}
                      {!isOpen && item.badge && (
                        <span className="absolute -top-1.5 -right-2 px-1 min-w-[16px] h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center shadow">
                          {item.badge}
                        </span>
                      )}

                      {/* Active Call Dot on Collapsed Icon */}
                      {!isOpen && item.indicator && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${item.indicator} ring-2 ring-[#1e1e1e]`} />
                      )}
                    </div>

                    {isOpen && (
                      <div className="flex items-center justify-between w-full ml-3">
                        <span className="text-sm truncate">{item.name}</span>

                        {/* Unread Badge on Expanded Sidebar */}
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shadow">
                            {item.badge}
                          </span>
                        )}

                        {/* Active Call Dot on Expanded Sidebar */}
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

        {/* Profile and Logout */}
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

      {/* Main Content Padding */}
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
