import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import { MdRefresh, MdSearch, MdEdit, MdClose, MdTrendingUp, MdPeople, MdVerified, MdPendingActions } from "react-icons/md";
import api from "../../api/axios";

const COLORS = ["#f43f8a", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#3b82f6"];

const GradientCard = ({ label, value, gradient, icon, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ borderRadius: 16, padding: "20px 24px", flex: 1, minWidth: 130, background: gradient, color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
    <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 60, opacity: 0.15 }}>{icon}</div>
    <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
    <svg viewBox="0 0 120 30" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.2 }}>
      <path d="M0 20 Q30 5 60 20 Q90 35 120 20 L120 30 L0 30 Z" fill="#fff" />
    </svg>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f43f8a" }}>{payload[0]?.value} leads</div>
      </div>
    );
  }
  return null;
};

const StatusBadge = ({ status }) => {
  const config = {
    Unverified: { bg: "#fef3c7", color: "#92400e" },
    Verified: { bg: "#d1fae5", color: "#065f46" },
    Processed: { bg: "#e0e7ff", color: "#3730a3" },
    Rejected: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = config[status] || config.Unverified;
  return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentVerified, setRecentVerified] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/leads"),
      ]);
      setStats(statsRes.data);
      const allLeads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
      setRecentLeads(allLeads.slice(0, 5));
      setRecentVerified(allLeads.filter((l) => l.status === "Verified").slice(0, 5));
      setLastUpdated(new Date());
    } catch {
      toast.error("Failed to load data!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const total = stats?.totalLeads || 0;
  const unverified = stats?.unverifiedLeads || 0;
  const verified = stats?.verifiedLeads || 0;
  const processed = stats?.processedLeads || 0;

  const pieData = stats?.byAgentType?.map((item, i) => ({
    name: item._id || "Unknown",
    value: item.count,
    color: COLORS[i % COLORS.length],
  })) || [];

  // Fix: ensure at least 2 points for line chart
  let lineData = stats?.leadsOverTime?.map((item) => ({
    date: item._id?.slice(5),
    leads: item.count,
  })) || [];

  // If only 1 point, add dummy previous point
  if (lineData.length === 1) {
    lineData = [{ date: "prev", leads: 0 }, ...lineData];
  }
  if (lineData.length === 0) {
    lineData = [{ date: "Day 1", leads: 0 }, { date: "Day 2", leads: 0 }];
  }

  const todayLeads = lineData.length > 0 ? lineData[lineData.length - 1]?.leads || 0 : 0;
  const yesterdayLeads = lineData.length > 1 ? lineData[lineData.length - 2]?.leads || 0 : 0;
  const diff = todayLeads - yesterdayLeads;

  const filtered = recentLeads.filter((l) => {
    const s = search.toLowerCase();
    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) ||
      l.mobilePhone?.includes(s) ||
      l.primaryEmail?.toLowerCase().includes(s) ||
      l.agentType?.toLowerCase().includes(s) ||
      l.status?.toLowerCase().includes(s)
    );
  });

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/leads/${editLead._id}`, editForm);
      toast.success("Lead updated successfully!");
      setEditLead(null);
      fetchData();
    } catch {
      toast.error("Update failed!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Admin Dashboard 🏢</h1>
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>Auto refreshes every 30s • Last: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <MdSearch size={15} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
              style={{ padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", width: isMobile ? 140 : 200 }} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} onClick={fetchData}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 }}>
            <MdRefresh size={16} />
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ padding: 80, textAlign: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #f43f8a", borderRadius: "50%", margin: "0 auto 16px" }} />
          <div style={{ color: "#94a3b8" }}>Loading dashboard...</div>
        </div>
      ) : (
        <>
          {/* Gradient Cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <GradientCard label="Total Leads" value={total} gradient="linear-gradient(135deg, #f43f8a, #e11d6b)" icon="📋" delay={0.1} />
            <GradientCard label="Unverified" value={unverified} gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)" icon="⏳" delay={0.2} />
            <GradientCard label="Verified" value={verified} gradient="linear-gradient(135deg, #06b6d4, #0284c7)" icon="✅" delay={0.3} />
            <GradientCard label="Processed" value={processed} gradient="linear-gradient(135deg, #f59e0b, #d97706)" icon="🎯" delay={0.4} />
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr", gap: 16, marginBottom: 20 }}>

            {/* Line Chart — Leads Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Leads Overview</h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Performance analytics for last 7 days</p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#64748b", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 4 }}>
                  📅 Last 7 Days
                </div>
              </div>

              {diff !== 0 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff0f6", borderRadius: 10, padding: "8px 14px", marginBottom: 16, border: "1px solid #fce7f3" }}>
                  <MdTrendingUp size={18} color="#f43f8a" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#f43f8a" }}>{diff > 0 ? "+" : ""}{diff} Today</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>vs yesterday</span>
                </div>
              )}

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 25, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pinkAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f8a" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f43f8a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#f43f8a"
                    strokeWidth={3}
                    dot={{ fill: "#f43f8a", r: 6, strokeWidth: 3, stroke: "#fff" }}
                    activeDot={{ r: 9, fill: "#f43f8a", stroke: "#fff", strokeWidth: 3 }}
                    label={{ position: "top", fill: "#f43f8a", fontSize: 11, fontWeight: 700 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Bottom Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                {[
                  { label: "Total Leads", value: total, color: "#f43f8a", icon: <MdPeople size={18} />, pct: "100%" },
                  { label: "Verified", value: verified, color: "#06b6d4", icon: <MdVerified size={18} />, pct: total > 0 ? `${Math.round((verified / total) * 100)}%` : "0%" },
                  { label: "Pending", value: unverified, color: "#8b5cf6", icon: <MdPendingActions size={18} />, pct: total > 0 ? `${Math.round((unverified / total) * 100)}%` : "0%" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.pct} of total</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Donut Pie Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff0f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🥧</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Leads By Agent Type</h3>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Agent type breakdown</p>
                </div>
              </div>

              {pieData.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>No data yet</div>
              ) : (
                <>
                  <div style={{ position: "relative", height: 180 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%"
                          innerRadius={52} outerRadius={82}
                          paddingAngle={3} dataKey="value"
                          startAngle={90} endAngle={-270} strokeWidth={0}>
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} leads`, n]}
                          contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b" }}>{total}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Total Leads</div>
                    </div>
                  </div>

                  {/* Source Table */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "4px 12px", marginBottom: 6, padding: "0 4px" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Type</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Leads</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>%</div>
                    </div>
                    {pieData.map((entry, i) => {
                      const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                      return (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "4px 12px", alignItems: "center", padding: "8px 4px", borderBottom: i < pieData.length - 1 ? "1px solid #f8fafc" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${entry.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color }} />
                            </div>
                            <span style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{entry.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{entry.value}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: entry.color, background: `${entry.color}15`, padding: "2px 8px", borderRadius: 20 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff0f6", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, border: "1px solid #fce7f3" }}>
                    <MdTrendingUp size={16} color="#f43f8a" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f43f8a" }}>+{total}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>Total leads submitted</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Recent Tables */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>🔥 Recent Leads</h3>
                <span style={{ background: "linear-gradient(135deg, #f43f8a, #e11d6b)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Latest 5</span>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No leads found</div>
              ) : filtered.map((lead, i) => (
                <motion.div key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: "12px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {lead.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>📱 {lead.mobilePhone} • {lead.agentType}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={lead.status} />
                    <motion.button whileHover={{ scale: 1.1 }}
                      onClick={() => { setEditLead(lead); setEditForm({ firstName: lead.firstName, lastName: lead.lastName, mobilePhone: lead.mobilePhone, primaryEmail: lead.primaryEmail, status: lead.status, workflowStatus: lead.workflowStatus }); }}
                      style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: 5, cursor: "pointer", color: "#64748b", display: "flex" }}>
                      <MdEdit size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>✅ Recent Verified</h3>
                <span style={{ background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Latest 5</span>
              </div>
              {recentVerified.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>No verified leads yet</div>
                </div>
              ) : recentVerified.map((lead, i) => (
                <motion.div key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: "12px 20px", borderBottom: i < recentVerified.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, #06b6d4, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {lead.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>🔄 {lead.workflowStatus} • 👤 {lead.verifiedBy?.name || "—"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Verified</span>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{lead.verifiedAt ? new Date(lead.verifiedAt).toLocaleDateString() : "—"}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editLead && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>✏️ Edit Lead</h3>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditLead(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748b", display: "flex" }}>
                <MdClose size={18} />
              </motion.button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" }, { label: "Phone", key: "mobilePhone" }, { label: "Email", key: "primaryEmail" }].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input value={editForm[f.key] || ""} onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Status</label>
                <select value={editForm.status || ""} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}>
                  <option>Unverified</option><option>Verified</option><option>Processed</option><option>Rejected</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Workflow</label>
                <select value={editForm.workflowStatus || ""} onChange={(e) => setEditForm((p) => ({ ...p, workflowStatus: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}>
                  <option>Pending</option><option>Pass</option><option>Cancel</option><option>Fraud</option><option>Duplicate</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setEditLead(null)}
                style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleEditSave} disabled={saving}
                style={{ flex: 2, padding: 11, borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg, #f43f8a, #e11d6b)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "✓ Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}