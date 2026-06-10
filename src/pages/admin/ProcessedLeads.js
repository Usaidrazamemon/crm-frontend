import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdRefresh, MdSearch } from "react-icons/md";
import api from "../../api/axios";

const PaymentBadge = ({ status }) => {
  const config = {
    Clear: { bg: "#d1fae5", color: "#065f46" },
    Canceled: { bg: "#fee2e2", color: "#991b1b" },
    Installed: { bg: "#e0e7ff", color: "#3730a3" },
    Chargedback: { bg: "#fef3c7", color: "#92400e" },
  };
  const s = config[status] || { bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{status}</span>;
};

export default function ProcessedLeads({ agentType }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/leads/processed");
      let data = Array.isArray(res.data) ? res.data : [];
      if (agentType) data = data.filter((l) => l.agentType === agentType);
      setLeads(data);
    } catch {
      toast.error("Failed to load leads!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [agentType]);

  const searchInLead = (lead, term) => {
    if (!term) return true;
    const t = term.toLowerCase();
    const vals = [
      lead.firstName, lead.lastName, lead.primaryEmail, lead.mobilePhone,
      lead.agentType, lead.workflowStatus, lead.paymentStatus,
      lead.agent?.name, lead.agent?.agentId, lead.verifiedBy?.name,
      lead.workOrder, lead._id,
    ];
    return vals.some((v) => v && v.toString().toLowerCase().includes(t));
  };

  const filtered = leads.filter((l) => searchInLead(l, search));

  return (
    <div>
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            {agentType ? `${agentType} Processed Leads` : "All Processed Leads"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Leads with payment status assigned</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={fetchLeads}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
          <MdRefresh size={16} /> {!isMobile && "Refresh"}
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>Processed ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <MdSearch size={15} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              style={{ padding: "7px 10px 7px 28px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 140 : 200 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #10b981", borderRadius: "50%", margin: "0 auto 12px" }} />
            <div style={{ color: "#94a3b8" }}>Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ color: "#94a3b8" }}>{search ? "No matching results" : "No processed leads yet"}</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead, i) => (
              <motion.div key={lead._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                  <PaymentBadge status={lead.paymentStatus} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>👤 {lead.agent?.name} • {lead.agentType}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>🔄 {lead.workflowStatus}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>✅ {lead.verifiedBy?.name || "—"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>📋 {lead.workOrder || "—"}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  {lead.processedAt ? new Date(lead.processedAt).toLocaleDateString() : "—"}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Lead ID", "Name", "Agent", "Agent Type", "Workflow", "Payment Status", "Verified By", "Work Order", "Processed Date"].map((h) => (
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
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.agent?.name || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.agentType}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.workflowStatus}</td>
                    <td style={{ padding: "13px 16px" }}><PaymentBadge status={lead.paymentStatus} /></td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.verifiedBy?.name || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{lead.workOrder || "-"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8" }}>{lead.processedAt ? new Date(lead.processedAt).toLocaleDateString() : "-"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}