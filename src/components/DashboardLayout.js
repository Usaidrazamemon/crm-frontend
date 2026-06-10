import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const roleColors = {
    admin: "#f59e0b",
    agent: "#06b6d4",
    verifier: "#8b5cf6",
  };
  const accentColor = roleColors[user?.role] || "#06b6d4";

  // Desktop: 240 expanded, 72 collapsed. Mobile: 0 (drawer overlay)
  const marginLeft = isMobile ? 0 : sidebarCollapsed ? 72 : 240;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>
      <Navbar
        onCollapseChange={setSidebarCollapsed}
      />

      <motion.div
        animate={{ marginLeft }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          flex: 1,
          minHeight: "100vh",
          background: "#f1f5f9",
          minWidth: 0,
        }}
      >
        {/* ===== TOP BAR ===== */}
        <div style={{
          height: 56, background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center",
          padding: isMobile ? "0 16px 0 56px" : "0 24px",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          justifyContent: "space-between",
        }}>
          {/* Left — Date */}
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </div>

          {/* Right — Bell + User info only */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* User info */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              {!isMobile && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}>{user?.name || "User"}</div>
                  <div style={{ fontSize: 10, color: accentColor, textTransform: "capitalize" }}>{user?.role}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: isMobile ? "16px" : "24px" }}
        >
          <Outlet />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;