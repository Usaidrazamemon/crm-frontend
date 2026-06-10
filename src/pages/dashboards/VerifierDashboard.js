import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdRefresh, MdSearch, MdClose } from "react-icons/md";
import api from "../../api/axios";

const StatusBadge = ({ status }) => {
  const config = {
    Pass: { bg: "#d1fae5", color: "#065f46" },
    Cancel: { bg: "#fee2e2", color: "#991b1b" },
    Fraud: { bg: "#fef3c7", color: "#92400e" },
    Duplicate: { bg: "#e0e7ff", color: "#3730a3" },
    Pending: { bg: "#f1f5f9", color: "#64748b" },
  };
  const s = config[status] || config.Pending;
  return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>;
};

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 };

export default function VerifierDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ workflowStatus: "Pass", remarks: "", workOrder: "", prepayment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/verifier/pending");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Leads load nahi hue!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // Realtime polling
  useEffect(() => {
    const interval = setInterval(fetchLeads, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (!verifyForm.workflowStatus) { toast.error("Workflow status select karo!"); return; }
    setSubmitting(true);
    try {
      await api.put(`/verifier/verify/${selected._id}`, verifyForm);
      toast.success("Lead verified successfully!");
      setSelected(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error!");
    } finally {
      setSubmitting(false);
    }
  };

  const searchInLead = (lead, term) => {
    if (!term) return true;
    const t = term.toLowerCase();
    const vals = [
      lead.firstName, lead.lastName, lead.primaryEmail, lead.mobilePhone, lead.secondaryPhone,
      lead.accountNumber, lead.ssn, lead.city, lead.usState, lead.zip, lead.county,
      lead.driverNumber, lead.campaign, lead.channel, lead.area, lead.rep,
      lead.assignedTo, lead.agentType, lead.workflowStatus, lead.status,
      lead.agent?.name, lead.agent?.agentId, lead._id,
    ];
    return vals.some((v) => v && v.toString().toLowerCase().includes(t));
  };

  const filtered = leads.filter((l) => searchInLead(l, search));

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Leads to Verify</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>{leads.length} pending leads</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={fetchLeads}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
          <MdRefresh size={16} /> {!isMobile && "Refresh"}
        </motion.button>
      </motion.div>

      {/* Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>

        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>Pending Leads ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <MdSearch size={15} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              style={{ padding: "7px 10px 7px 28px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 140 : 200 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #8b5cf6", borderRadius: "50%", margin: "0 auto 12px" }} />
            <div style={{ color: "#94a3b8" }}>Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ color: "#94a3b8" }}>All leads verified!</div>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead, i) => (
              <motion.div key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>#{lead._id?.slice(-6).toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>📱 {lead.mobilePhone}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>✉️ {lead.primaryEmail || "—"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>👤 {lead.agent?.name} • {lead.agentType}</div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelected(lead); setVerifyForm({ workflowStatus: "Pass", remarks: "", workOrder: "", prepayment: "" }); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Verify Lead
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          // Desktop Table
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Lead ID", "Name", "Phone", "Email", "Agent", "Agent Type", "Created", "Action"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{lead._id?.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.mobilePhone}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.primaryEmail || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.agent?.name || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.agentType}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelected(lead); setVerifyForm({ workflowStatus: "Pass", remarks: "", workOrder: "", prepayment: "" }); }}
                        style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Verify
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Verify Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 20, padding: isMobile ? 20 : 28, width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Verify Lead</h3>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelected(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748b", display: "flex" }}>
                  <MdClose size={18} />
                </motion.button>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{selected.mobilePhone} • {selected.primaryEmail}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Workflow Status *</label>
                <select style={inputStyle} value={verifyForm.workflowStatus} onChange={(e) => setVerifyForm((p) => ({ ...p, workflowStatus: e.target.value }))}>
                  <option value="Pass">Pass</option>
                  <option value="Cancel">Cancel</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Duplicate">Duplicate</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Work Order</label>
                  <input style={inputStyle} value={verifyForm.workOrder} onChange={(e) => setVerifyForm((p) => ({ ...p, workOrder: e.target.value }))} placeholder="WO-12345" />
                </div>
                <div>
                  <label style={labelStyle}>Prepayment ($)</label>
                  <input style={inputStyle} type="number" value={verifyForm.prepayment} onChange={(e) => setVerifyForm((p) => ({ ...p, prepayment: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Remarks / Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={verifyForm.remarks} onChange={(e) => setVerifyForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Add notes here..." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => setSelected(null)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={submitting}
                  style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: submitting ? "#94a3b8" : "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Verifying..." : "✓ Confirm Verification"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}