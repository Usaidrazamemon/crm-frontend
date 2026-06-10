import { displayPhone } from '../../utils/phoneFormat';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdRefresh, MdSearch, MdMoreVert, MdEdit, MdClose, MdSave } from "react-icons/md";
import api from "../../api/axios";

const COLORS = ["#f43f8a", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

const StatusBadge = ({ status }) => {
  const config = {
    Unverified: { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#92400e" },
    Verified: { bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#065f46" },
    Processed: { bg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", color: "#3730a3" },
    Rejected: { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#991b1b" },
  };
  const s = config[status] || config.Unverified;
  return <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{status}</span>;
};

const tdStyle = { padding: "13px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" };

// ── 3-dot dropdown ───────────────────────────────────────────────
function LeadActionsMenu({ lead, onEdit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((p) => !p)}
        style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
        <MdMoreVert size={18} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", right: 0, top: "110%", background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #e2e8f0", zIndex: 999, minWidth: 140, overflow: "hidden" }}>
            <button
              onClick={() => { setOpen(false); onEdit(lead); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#1e293b", fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
              <MdEdit size={16} color="#f59e0b" /> Edit Lead
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────────
function EditLeadModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    primaryEmail: lead.primaryEmail || "",
    mobilePhone: lead.mobilePhone || "",
    secondaryPhone: lead.secondaryPhone || "",
    workflowStatus: lead.workflowStatus || "",
    status: lead.status || "",
    paymentStatus: lead.paymentStatus || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/leads/${lead._id}`, form);
      toast.success("Lead updated successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update lead!");
    } finally { setSaving(false); }
  };

  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8fafc" };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Edit Lead</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>#{lead._id?.slice(-6).toUpperCase()} — {lead.firstName} {lead.lastName}</div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
            <MdClose size={18} color="#64748b" />
          </motion.button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="First Name"><input style={inputStyle} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
            <Field label="Last Name"><input style={inputStyle} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
            <Field label="Primary Email"><input style={inputStyle} value={form.primaryEmail} onChange={(e) => set("primaryEmail", e.target.value)} /></Field>
            <Field label="Mobile Phone"><input style={inputStyle} value={form.mobilePhone} onChange={(e) => set("mobilePhone", e.target.value)} placeholder="(XXX) XXX-XXXX" /></Field>
            <Field label="Secondary Phone"><input style={inputStyle} value={form.secondaryPhone} onChange={(e) => set("secondaryPhone", e.target.value)} placeholder="(XXX) XXX-XXXX" /></Field>
            <Field label="Status">
              <select style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="Unverified">Unverified</option>
                <option value="Verified">Verified</option>
                <option value="Processed">Processed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>
            <Field label="Workflow Status">
              <select style={inputStyle} value={form.workflowStatus} onChange={(e) => set("workflowStatus", e.target.value)}>
                <option value="">-- Select --</option>
                <option value="Pass">Pass</option>
                <option value="Cancel">Cancel</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Fraud">Fraud</option>
                <option value="Pending">Pending</option>
              </select>
            </Field>
            <Field label="Payment Status">
              <select style={inputStyle} value={form.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}>
                <option value="">-- Select --</option>
                <option value="Clear">Clear</option>
                <option value="Canceled">Canceled</option>
                <option value="Installed">Installed</option>
                <option value="Chargedback">Chargedback</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={saving}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <MdSave size={15} /> {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function AdminLeads({ agentType }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [editLead, setEditLead] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/leads");
      let data = Array.isArray(res.data) ? res.data : [];
      if (agentType) data = data.filter((l) => l.agentType === agentType);
      setLeads(data);
    } catch { toast.error("Failed to load leads!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [agentType]);

  const updatePayment = async (leadId, paymentStatus) => {
    setUpdatingId(leadId);
    try {
      await api.put(`/admin/leads/${leadId}/payment`, { paymentStatus });
      toast.success("Payment status updated!");
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error updating payment!");
    } finally { setUpdatingId(null); }
  };

  const filtered = leads.filter((l) => {
    const s = search.toLowerCase();
    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) ||
      l.mobilePhone?.includes(s) ||
      l.primaryEmail?.toLowerCase().includes(s) ||
      l.agentType?.toLowerCase().includes(s) ||
      l.status?.toLowerCase().includes(s) ||
      l.workflowStatus?.toLowerCase().includes(s) ||
      l.agent?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Edit Modal */}
      <AnimatePresence>
        {editLead && (
          <EditLeadModal
            lead={editLead}
            onClose={() => setEditLead(null)}
            onSaved={fetchLeads}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            {agentType ? `${agentType} Leads` : "All Leads"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>{filtered.length} leads found</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={fetchLeads}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
          <MdRefresh size={16} /> {!isMobile && "Refresh"}
        </motion.button>
      </motion.div>

      {/* Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", overflow: "hidden" }}>

        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Leads <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>({filtered.length})</span>
          </h2>
          <div style={{ position: "relative" }}>
            <MdSearch size={15} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all columns..."
              style={{ padding: "8px 12px 8px 30px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 160 : 240, background: "#fff" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #f59e0b", borderRadius: "50%", margin: "0 auto 12px" }} />
            <div style={{ color: "#94a3b8" }}>Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ color: "#94a3b8" }}>No leads found</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead, i) => (
              <motion.div key={lead._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 14, padding: "14px 16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={lead.status} />
                    <LeadActionsMenu lead={lead} onEdit={setEditLead} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>📱 {displayPhone(lead.mobilePhone)}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>👤 {lead.agent?.name} • {lead.agentType}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>🔄 {lead.workflowStatus}</div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>Payment Status</label>
                  <select value={lead.paymentStatus || ""} disabled={updatingId === lead._id}
                    onChange={(e) => updatePayment(lead._id, e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer", outline: "none" }}>
                    <option value="">-- Select --</option>
                    <option value="Clear">Clear</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Installed">Installed</option>
                    <option value="Chargedback">Chargedback</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)" }}>
                  {["Lead ID", "Name", "Phone", "Agent", "Agent Type", "Status", "Workflow", "Verified By", "Payment Status", "Created", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fffbeb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                    <td style={tdStyle}>
                      <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontFamily: "monospace", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                        #{lead._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+1) % COLORS.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {lead.firstName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</span>
                      </div>
                    </td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{displayPhone(lead.mobilePhone)}</span>
                    </td>

                    <td style={tdStyle}>{lead.agent?.name || "-"}</td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {lead.agentType}
                      </span>
                    </td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <StatusBadge status={lead.status} />
                    </td>

                    <td style={tdStyle}>{lead.workflowStatus}</td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {lead.verifiedBy?.name ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                          <span style={{ fontSize: 13, color: "#64748b" }}>{lead.verifiedBy.name}</span>
                        </div>
                      ) : <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>

                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <select value={lead.paymentStatus || ""} disabled={updatingId === lead._id}
                        onChange={(e) => updatePayment(lead._id, e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b", cursor: "pointer", outline: "none", background: "#fff" }}>
                        <option value="">-- Select --</option>
                        <option value="Clear">✅ Clear</option>
                        <option value="Canceled">❌ Canceled</option>
                        <option value="Installed">🔧 Installed</option>
                        <option value="Chargedback">↩️ Chargedback</option>
                      </select>
                    </td>

                    <td style={tdStyle}>{new Date(lead.createdAt).toLocaleDateString()}</td>

                    {/* 3-dot actions */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <LeadActionsMenu lead={lead} onEdit={setEditLead} />
                    </td>
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