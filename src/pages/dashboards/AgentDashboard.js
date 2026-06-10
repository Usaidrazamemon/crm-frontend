import { displayPhone } from '../../utils/phoneFormat';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdPeople, MdVerified, MdPendingActions, MdAddCircle, MdRefresh, MdSearch } from "react-icons/md";
import api from "../../api/axios";
import LeadDetailModal from "../../components/LeadDetailModal";

const COLORS = ["#f43f8a", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

const GradientCard = ({ label, value, gradient, icon, delay, sub }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ borderRadius: 16, padding: "20px 24px", flex: 1, minWidth: 130, background: gradient, color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
    <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 56, opacity: 0.15 }}>{icon}</div>
    <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
    <svg viewBox="0 0 120 30" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.2 }}>
      <path d="M0 20 Q30 5 60 20 Q90 35 120 20 L120 30 L0 30 Z" fill="#fff" />
    </svg>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const config = {
    Unverified: { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#92400e" },
    Verified: { bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#065f46" },
    Rejected: { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#991b1b" },
    Processed: { bg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", color: "#3730a3" },
  };
  const s = config[status] || config.Unverified;
  return <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}>{status}</span>;
};

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load leads!"); setLeads([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter((l) => {
    const matchFilter = filter === "All" || l.status === filter;
    const s = search.toLowerCase();
    const matchSearch =
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) ||
      l.mobilePhone?.includes(s) || l.primaryEmail?.toLowerCase().includes(s) ||
      l.agentType?.toLowerCase().includes(s) || l.status?.toLowerCase().includes(s) ||
      l.workflowStatus?.toLowerCase().includes(s);
    const matchDateFrom = !dateFrom || new Date(l.createdAt) >= new Date(dateFrom);
    const matchDateTo = !dateTo || new Date(l.createdAt) <= new Date(dateTo + "T23:59:59");
    return matchFilter && matchSearch && matchDateFrom && matchDateTo;
  });

  const total = leads.length;
  const unverified = leads.filter((l) => l.status === "Unverified").length;
  const verified = leads.filter((l) => l.status === "Verified").length;

  const clearFilters = () => { setSearch(""); setFilter("All"); setDateFrom(""); setDateTo(""); };

  return (
    <div>
      <Toaster position="top-right" />
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Welcome back, {user?.name || "Agent"} 👋</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Here's your lead summary for today</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchLeads}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
            <MdRefresh size={16} /> {!isMobile && "Refresh"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/agent/create-lead")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
            <MdAddCircle size={16} /> {isMobile ? "New" : "New Lead"}
          </motion.button>
        </div>
      </motion.div>

      {/* Gradient Cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <GradientCard label="Total Leads" value={total} gradient="linear-gradient(135deg, #06b6d4, #0284c7)" icon="📋" delay={0.1} sub="All submitted leads" />
        <GradientCard label="Unverified" value={unverified} gradient="linear-gradient(135deg, #f59e0b, #d97706)" icon="⏳" delay={0.2} sub="Pending review" />
        <GradientCard label="Verified" value={verified} gradient="linear-gradient(135deg, #10b981, #059669)" icon="✅" delay={0.3} sub="Successfully verified" />
      </div>

      {/* Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", overflow: "hidden" }}>

        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              📋 My Leads <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>({filtered.length})</span>
            </h2>
            <div style={{ position: "relative" }}>
              <MdSearch size={15} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all columns..."
                style={{ padding: "8px 12px 8px 30px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 160 : 220, background: "#fff" }} />
            </div>
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {[
              { key: "All", label: "All", grad: "linear-gradient(135deg, #06b6d4, #0284c7)" },
              { key: "Unverified", label: "Unverified", grad: "linear-gradient(135deg, #f59e0b, #d97706)" },
              { key: "Verified", label: "Verified", grad: "linear-gradient(135deg, #10b981, #059669)" },
              { key: "Rejected", label: "Rejected", grad: "linear-gradient(135deg, #ef4444, #dc2626)" },
            ].map((f) => (
              <motion.button key={f.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f.key)}
                style={{ padding: "5px 14px", borderRadius: 20, border: filter === f.key ? "none" : "1px solid #e2e8f0", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filter === f.key ? f.grad : "#fff", color: filter === f.key ? "#fff" : "#64748b", boxShadow: filter === f.key ? "0 4px 12px rgba(0,0,0,0.15)" : "none" }}>
                {f.label}
              </motion.button>
            ))}
            {(dateFrom || dateTo || search || filter !== "All") && (
              <motion.button whileHover={{ scale: 1.05 }} onClick={clearFilters}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #fee2e2", background: "#fff5f5", color: "#ef4444", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                ✕ Clear
              </motion.button>
            )}
          </div>

          {/* Date Range */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>📅 Date Range:</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", color: "#1e293b" }} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", color: "#1e293b" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #06b6d4", borderRadius: "50%", margin: "0 auto 12px" }} />
            <div style={{ color: "#94a3b8" }}>Loading leads...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>No leads found</div>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate("/agent/create-lead")}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Create First Lead
            </motion.button>
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead, i) => (
              <motion.div key={lead._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedLead(lead)}
                style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 14, padding: "14px 16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {lead.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{displayPhone(lead.mobilePhone)}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{lead.primaryEmail || "—"}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>#{lead._id?.slice(-6).toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)" }}>
                  {["Lead ID", "Name", "Phone", "Email", "Agent Type", "Workflow", "Status", "Verified By", "Created", "Last Updated"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr key={lead._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedLead(lead)}
                    style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>#{lead._id?.slice(-6).toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {lead.firstName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{lead.firstName} {lead.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>{displayPhone(lead.mobilePhone)}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.primaryEmail || "—"}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{lead.agentType || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{lead.workflowStatus}</td>
                    <td style={{ padding: "13px 16px" }}><StatusBadge status={lead.status} /></td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{lead.verifiedBy?.name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(lead.updatedAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
              💡 Click on any row to see full lead details
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}