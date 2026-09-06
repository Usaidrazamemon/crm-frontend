import { formatPhone, displayPhone } from '../../utils/phoneFormat';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdPersonAdd, MdRefresh, MdVisibility, MdVisibilityOff, MdLock, MdBlock, MdCheckCircle, MdClose } from "react-icons/md";
import api from "../../api/axios";

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 };

export default function CreateAgentProfile() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("agent"); // "agent" | "verifier" | "admin" | "all"
  const [form, setForm] = useState({ name: "", email: "", password: "", agentType: "Inhouse", phone: "" });
  const [togglingId, setTogglingId] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null); // user object currently changing password for
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const endpoint = roleFilter === "all" ? "/admin/users" : `/admin/users/role/${roleFilter}`;
      const res = await api.get(endpoint);
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, [roleFilter]);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.agentType) {
      toast.error("Please fill all required fields!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/admin/users/create-agent", form);
      toast.success(`Agent created! ID: ${res.data.agentId}`);
      setForm({ name: "", email: "", password: "", agentType: "Inhouse", phone: "" });
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error!");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    setTogglingId(user._id);
    try {
      await api.put(`/admin/users/${user._id}`, { status: newStatus });
      toast.success(newStatus === "Inactive" ? `${user.name} disabled` : `${user.name} enabled`);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update status!");
    } finally {
      setTogglingId(null);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword("");
    setShowNewPassword(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put(`/admin/users/${passwordUser._id}/password`, { newPassword });
      toast.success(`Password changed for ${passwordUser.name}`);
      setPasswordUser(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to change password!");
    } finally {
      setSavingPassword(false);
    }
  };

  const filtered = agents.filter((a) => {
    const s = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(s) ||
      a.email?.toLowerCase().includes(s) ||
      a.agentType?.toLowerCase().includes(s) ||
      a.agentId?.toLowerCase().includes(s) ||
      a.phone?.includes(s)
    );
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>User Management</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Manage agents, verifiers &amp; admins</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#1e293b", fontSize: 13, cursor: "pointer" }}>
            <option value="agent">Agents</option>
            <option value="verifier">Verifiers</option>
            <option value="admin">Admins</option>
            <option value="all">All Users</option>
          </select>
          <motion.button whileHover={{ scale: 1.03 }} onClick={fetchAgents}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
            <MdRefresh size={16} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <MdPersonAdd size={16} /> {isMobile ? "New" : "New Agent"}
          </motion.button>
        </div>
      </motion.div>

      {/* Create Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 16, padding: isMobile ? 16 : 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, marginTop: 0 }}>Create Agent Profile</h3>
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #bbf7d0", fontSize: 12, color: "#065f46" }}>
            ✅ Agent ID will be auto-generated (e.g. AGT-0001)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Agent name" /></div>
            <div><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="agent@email.com" /></div>
            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 40 }} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
                <button onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Agent Type *</label>
              <select style={inputStyle} value={form.agentType} onChange={(e) => set("agentType", e.target.value)}>
                <option value="Inhouse">Inhouse</option>
                <option value="Agent">Agent</option>
                <option value="D2D Sales">D2D Sales</option>
              </select>
            </div>
            <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} placeholder="(XXX) XXX-XXXX" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowForm(false)}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: submitting ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Creating..." : "✓ Create Agent"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Search + Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>Users ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 140 : 200 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #f59e0b", borderRadius: "50%", margin: "0 auto 12px" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <div style={{ color: "#94a3b8" }}>No users found</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((agent, i) => (
              <div key={agent._id} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{agent.name}</div>
                  <span style={{ background: agent.status === "Active" ? "#d1fae5" : "#fee2e2", color: agent.status === "Active" ? "#065f46" : "#991b1b", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{agent.status || "Active"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>✉️ {agent.email}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>🏷️ {agent.role} {agent.agentType ? `• ${agent.agentType}` : ""} {agent.agentId ? `• ID: ${agent.agentId}` : ""}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>📱 {displayPhone(agent.phone)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toggleStatus(agent)} disabled={togglingId === agent._id}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: agent.status === "Active" ? "#991b1b" : "#065f46" }}>
                    {agent.status === "Active" ? <><MdBlock size={14} /> Disable</> : <><MdCheckCircle size={14} /> Enable</>}
                  </button>
                  <button onClick={() => openPasswordModal(agent)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#64748b" }}>
                    <MdLock size={14} /> Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Email", "Role", "Agent Type", "Agent ID", "Phone", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((agent, i) => (
                  <motion.tr key={agent._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{agent.name}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{agent.email}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", textTransform: "capitalize" }}>{agent.role}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{agent.agentType || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 600 }}>{agent.agentId || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{displayPhone(agent.phone)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: agent.status === "Active" ? "#d1fae5" : "#fee2e2", color: agent.status === "Active" ? "#065f46" : "#991b1b", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{agent.status || "Active"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStatus(agent)} disabled={togglingId === agent._id}
                          title={agent.status === "Active" ? "Disable this account" : "Enable this account"}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: togglingId === agent._id ? "not-allowed" : "pointer", color: agent.status === "Active" ? "#991b1b" : "#065f46" }}>
                          {agent.status === "Active" ? <MdBlock size={14} /> : <MdCheckCircle size={14} />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => openPasswordModal(agent)}
                          title="Change password"
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#64748b" }}>
                          <MdLock size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {passwordUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
            onClick={() => setPasswordUser(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>🔒 Change Password</h3>
                <button onClick={() => setPasswordUser(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748b", display: "flex" }}>
                  <MdClose size={18} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 0, marginBottom: 14 }}>
                Setting a new password for <strong>{passwordUser.name}</strong> ({passwordUser.email})
              </p>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <input style={{ ...inputStyle, paddingRight: 40 }} type={showNewPassword ? "text" : "password"}
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
                <button onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                  {showNewPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => setPasswordUser(null)}
                  style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleChangePassword} disabled={savingPassword}
                  style={{ flex: 2, padding: 11, borderRadius: 10, border: "none", background: savingPassword ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: savingPassword ? "not-allowed" : "pointer" }}>
                  {savingPassword ? "Saving..." : "✓ Update Password"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
