import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
    agentType: "Inhouse",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Saare fields fill karo!");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created! Ab login karo.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      <Toaster position="top-right" />

      {/* Background circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: 300 + i * 200, height: 300 + i * 200,
            borderRadius: "50%",
            border: "1px solid rgba(99,102,241,0.2)",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 40,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 24,
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}>🏢</div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Create Account</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 6 }}>Fill in details to register</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>FULL NAME</label>
            <input
              value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name" required
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.border = "1px solid rgba(99,102,241,0.6)"}
              onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
            />
          </motion.div>

          {/* Email */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>EMAIL ADDRESS</label>
            <input
              type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com" required
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.border = "1px solid rgba(99,102,241,0.6)"}
              onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
            />
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>PASSWORD</label>
            <input
              type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••" required
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.border = "1px solid rgba(99,102,241,0.6)"}
              onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
            />
          </motion.div>

          {/* Role */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>ROLE</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
              <option value="agent">Agent</option>
              <option value="verifier">Verifier</option>
              <option value="admin">Admin</option>
            </select>
          </motion.div>

          {/* Agent Type — sirf agent ke liye */}
          {form.role === "agent" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>AGENT TYPE</label>
              <select value={form.agentType} onChange={(e) => set("agentType", e.target.value)}
                style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                <option value="Inhouse">Inhouse</option>
                <option value="Agent">Agent</option>
                <option value="D2D Sales">D2D Sales</option>
              </select>
            </motion.div>
          )}

          {/* Submit */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} style={{ marginTop: 20 }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                  Creating account...
                </>
              ) : "Create Account"}
            </motion.button>
          </motion.div>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}