import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import api from "../api/axios";
import logo from "../assets/logo.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      setTimeout(() => navigate(`/${res.data.user.role}`), 800);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      <Toaster position="top-right" />

      {[...Array(3)].map((_, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", width: 300 + i * 200, height: 300 + i * 200,
            borderRadius: "50%", border: "1px solid rgba(6,182,212,0.2)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none",
          }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)",
          padding: 40, boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}>

        {/* Logo + Title */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ textAlign: "center", marginBottom: 32 }}>

          {/* Logo - no white background */}
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <img src={logo} alt="ConnectCare Global"
              style={{
                width: 60, height: 60,
                borderRadius: "50%",
                objectFit: "cover",
                background: "transparent",
              }} />
          </div>

          {/* Company Name */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "0.01em" }}>ConnectCare </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#06b6d4" }}>Global</span>
          </div>

          {/* Tagline */}
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Brings Innovation With Ease
          </p>

          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, #06b6d4, #0284c7)", borderRadius: 2, margin: "14px auto 0" }} />
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.border = "1px solid rgba(6,182,212,0.6)"}
              onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"} />
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.border = "1px solid rgba(6,182,212,0.6)"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(6,182,212,0.4)" }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading ? "rgba(6,182,212,0.5)" : "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                Signing in...
              </>
            ) : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
