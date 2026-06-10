import { displayPhone } from '../../utils/phoneFormat';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdRefresh, MdSearch, MdVerified } from "react-icons/md";
import api from "../../api/axios";

const COLORS = ["#f43f8a", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

const StatusBadge = ({ status }) => {
  const config = {
    Pass: {
      bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
      color: "#065f46",
    },
    Cancel: {
      bg: "linear-gradient(135deg, #fee2e2, #fecaca)",
      color: "#991b1b",
    },
    Fraud: {
      bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
      color: "#92400e",
    },
    Duplicate: {
      bg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
      color: "#3730a3",
    },
    Pending: {
      bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
      color: "#64748b",
    },
  };

  const s = config[status] || config.Pending;

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

export default function VerifiedLeadsAgent() {
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
      const res = await api.get("/leads/verified");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load leads!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter((l) => {
    const s = search.toLowerCase();

    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) ||
      l.mobilePhone?.includes(s) ||
      l.primaryEmail?.toLowerCase().includes(s) ||
      l.agentType?.toLowerCase().includes(s) ||
      l.workflowStatus?.toLowerCase().includes(s) ||
      l.workOrder?.toLowerCase().includes(s) ||
      l.verifiedBy?.name?.toLowerCase().includes(s)
    );
  });

  const total = leads.length;
  const passed = leads.filter(
    (l) => l.workflowStatus === "Pass"
  ).length;

  const others = leads.filter(
    (l) =>
      l.workflowStatus !== "Pass" &&
      l.workflowStatus !== "Pending"
  ).length;

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            ✅ Verified Leads
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: 13,
              margin: "4px 0 0",
            }}
          >
            Leads verified by verifier team
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchLeads}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <MdRefresh size={16} />
          {!isMobile && "Refresh"}
        </motion.button>
      </motion.div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Total Verified",
            value: total,
            gradient:
              "linear-gradient(135deg, #06b6d4, #0284c7)",
            icon: "✅",
            sub: "All verified leads",
          },
          {
            label: "Passed",
            value: passed,
            gradient:
              "linear-gradient(135deg, #10b981, #059669)",
            icon: "🎯",
            sub: "Approved leads",
          },
          {
            label: "Other Status",
            value: others,
            gradient:
              "linear-gradient(135deg, #f59e0b, #d97706)",
            icon: "⚠️",
            sub: "Cancel/Fraud/Duplicate",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              borderRadius: 16,
              padding: "20px 24px",
              flex: 1,
              minWidth: 130,
              background: card.gradient,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -10,
                bottom: -10,
                fontSize: 56,
                opacity: 0.15,
              }}
            >
              {card.icon}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: 0.85,
                marginBottom: 6,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {card.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #f1f5f9",
          overflow: "hidden",
        }}
      >
        {/* Top */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            background:
              "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, #06b6d4, #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdVerified size={18} color="#fff" />
            </div>

            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1e293b",
                margin: 0,
              }}
            >
              My Verified Leads
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            <MdSearch
              size={15}
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all columns..."
              style={{
                padding: "8px 12px 8px 30px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                outline: "none",
                width: isMobile ? 160 : 240,
                background: "#fff",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "1450px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                }}
              >
                {[
                  "Lead ID",
                  "Name",
                  "Phone",
                  "Email",
                  "Agent ID",
                  "Agent Type",
                  "Workflow Status",
                  "Work Order",
                  "Prepayment",
                  "Verified By",
                  "Verified Date",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((lead, i) => (
                <motion.tr
                  key={lead._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  {/* ID */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontFamily: "monospace",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      #{lead._id?.slice(-6).toUpperCase()}
                    </span>
                  </td>

                  {/* Name */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${
                            COLORS[i % COLORS.length]
                          }, ${
                            COLORS[(i + 1) % COLORS.length]
                          })`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {lead.firstName?.[0]?.toUpperCase()}
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lead.firstName} {lead.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📱 {displayPhone(lead.mobilePhone)}
                  </td>

                  {/* Email */}
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lead.primaryEmail || "—"}
                  </td>

                  {/* Agent ID */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#f0fdf4",
                        color: "#065f46",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {lead.agent?.agentId || "—"}
                    </span>
                  </td>

                  {/* Agent Type */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {lead.agentType}
                    </span>
                  </td>

                  {/* Workflow */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <StatusBadge
                      status={lead.workflowStatus}
                    />
                  </td>

                  {/* Work Order */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lead.workOrder ? (
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                          color: "#3730a3",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        📋 {lead.workOrder}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Prepayment */}
                  <td
                    style={{
                      padding: "13px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lead.prepayment ? (
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                          color: "#065f46",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        💰 ${lead.prepayment}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Verified By */}
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />

                      {lead.verifiedBy?.name || "—"}
                    </div>
                  </td>

                  {/* Date */}
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 12,
                      color: "#94a3b8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lead.verifiedAt
                      ? new Date(
                          lead.verifiedAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}