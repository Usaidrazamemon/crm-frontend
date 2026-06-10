import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard, MdAddCircle, MdVerified, MdPeople,
  MdMenu, MdClose, MdAssignment, MdCheckCircle, MdBarChart,
  MdPersonAdd, MdKeyboardArrowRight, MdDoneAll, MdLogout,
} from "react-icons/md";

const navConfig = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: <MdDashboard size={20} /> },
    { label: "D2D Sales", path: "/admin/d2d", icon: <MdPeople size={20} />, subPath: "/admin/d2d/processed" },
    { label: "Inhouse Sales", path: "/admin/inhouse", icon: <MdBarChart size={20} />, subPath: "/admin/inhouse/processed" },
    { label: "Agents", path: "/admin/agents", icon: <MdPersonAdd size={20} />, subPath: "/admin/agents/processed" },
    { label: "Create Profile", path: "/admin/create-profile", icon: <MdPersonAdd size={20} /> },
  ],
  agent: [
    { label: "Home", path: "/agent", icon: <MdDashboard size={20} /> },
    { label: "Create Lead", path: "/agent/create-lead", icon: <MdAddCircle size={20} /> },
    { label: "Verified Leads", path: "/agent/verified-leads", icon: <MdVerified size={20} /> },
  ],
  verifier: [
    { label: "Leads", path: "/verifier", icon: <MdAssignment size={20} /> },
    { label: "Verified Leads", path: "/verifier/verified", icon: <MdCheckCircle size={20} /> },
  ],
};

const roleConfig = {
  admin: {
    gradient: "linear-gradient(180deg, #1a1206 0%, #2d1f08 50%, #1a1206 100%)",
    accent: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.3)",
    badge: "linear-gradient(135deg, #f59e0b, #d97706)",
    label: "Admin Panel",
  },
  agent: {
    gradient: "linear-gradient(180deg, #061220 0%, #0c2240 50%, #061220 100%)",
    accent: "#06b6d4",
    accentGlow: "rgba(6,182,212,0.3)",
    badge: "linear-gradient(135deg, #06b6d4, #0284c7)",
    label: "Agent Portal",
  },
  verifier: {
    gradient: "linear-gradient(180deg, #120820 0%, #1e0f3a 50%, #120820 100%)",
    accent: "#8b5cf6",
    accentGlow: "rgba(139,92,246,0.3)",
    badge: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    label: "Verifier Panel",
  },
};

export default function Navbar({ onCollapseChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "agent";
  const links = navConfig[role] || navConfig.agent;
  const config = roleConfig[role] || roleConfig.agent;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Collapse change hone par parent ko notify karo
  const handleCollapse = (val) => {
    setCollapsed(val);
    if (onCollapseChange) onCollapseChange(val);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: config.gradient, position: "relative", overflow: "hidden" }}>
      {/* Glow effects */}
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: config.accentGlow, top: -80, right: -80, pointerEvents: "none", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: config.accentGlow, bottom: 60, left: -60, pointerEvents: "none", filter: "blur(40px)" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed && !isMobile ? "center" : "space-between", padding: collapsed && !isMobile ? "20px 0" : "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 70, position: "relative", zIndex: 1 }}>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={require("../assets/logo.jpeg")} alt="logo"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", background: "#fff", padding: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.2 }}>ConnectCare</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: config.accent, lineHeight: 1.2 }}>Global.</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{config.label}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleCollapse(!collapsed)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {collapsed ? <MdMenu size={18} /> : <MdClose size={18} />}
          </motion.button>
        )}
        {isMobile && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMobileOpen(false)}
            style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}>
            <MdClose size={20} />
          </motion.button>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 3, position: "relative", zIndex: 1, overflowY: "auto" }}>
        {links.map((item, i) => {
          const isActive = location.pathname === item.path;
          const isSubActive = item.subPath && location.pathname === item.subPath;
          return (
            <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={item.path} style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ x: 3 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed && !isMobile ? "13px 0" : "11px 14px", justifyContent: collapsed && !isMobile ? "center" : "flex-start", borderRadius: 10, position: "relative", background: isActive ? `${config.accent}20` : "transparent", color: isActive ? config.accent : "rgba(255,255,255,0.55)", transition: "all 0.2s ease", overflow: "hidden" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  {isActive && (
                    <>
                      <motion.div layoutId="activeGlow" style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${config.accent}15, transparent)`, borderRadius: 10 }} />
                      <motion.div layoutId="activeBar" style={{ position: "absolute", left: 0, top: "15%", height: "70%", width: 3, borderRadius: 4, background: config.badge, boxShadow: `0 0 8px ${config.accentGlow}` }} />
                    </>
                  )}
                  <span style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>{item.icon}</span>
                  <AnimatePresence>
                    {(!collapsed || isMobile) && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                        style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", position: "relative", zIndex: 1 }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {(!collapsed || isMobile) && isActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginLeft: "auto", position: "relative", zIndex: 1 }}>
                      <MdKeyboardArrowRight size={16} style={{ color: config.accent }} />
                    </motion.div>
                  )}
                </motion.div>
              </Link>

              {/* Processed sub-link */}
              {item.subPath && isActive && (!collapsed || isMobile) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}>
                  <Link to={item.subPath} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 46px", borderRadius: 10, margin: "2px 0", background: isSubActive ? `${config.accent}15` : "transparent", color: isSubActive ? config.accent : "rgba(255,255,255,0.4)", fontSize: 12, transition: "all 0.2s", cursor: "pointer" }}
                      onMouseEnter={(e) => { if (!isSubActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { if (!isSubActive) e.currentTarget.style.background = "transparent"; }}>
                      <MdDoneAll size={14} />
                      Processed Leads
                    </div>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        <motion.button
          whileHover={{ scale: 1.02, background: "rgba(239,68,68,0.15)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: collapsed && !isMobile ? "12px 0" : "11px 14px",
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)",
            background: "rgba(239,68,68,0.08)", color: "#ef4444",
            cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
          }}>
          <MdLogout size={20} />
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      {isMobile && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMobileOpen(true)}
          style={{ position: "fixed", top: 12, left: 12, zIndex: 200, background: config.badge, border: "none", borderRadius: 10, padding: "8px 10px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${config.accentGlow}` }}>
          <MdMenu size={22} />
        </motion.button>
      )}

      {/* Mobile Overlay — click se drawer band */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150, backdropFilter: "blur(4px)" }} />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ position: "fixed", top: 0, left: 0, width: 260, height: "100vh", zIndex: 200, boxShadow: "4px 0 32px rgba(0,0,0,0.4)" }}>
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,0.3)", overflow: "hidden" }}>
          <SidebarContent />
        </motion.div>
      )}
    </>
  );
}