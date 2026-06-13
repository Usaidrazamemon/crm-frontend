
import { formatPhone, displayPhone } from '../utils/phoneFormat';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPhone, MdEmail, MdPerson, MdEdit, MdSave } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../api/axios";

const tabs = [
  "Basic Info", "Address", "Documents", "Verification",
  "Action Logs", "Notes", "Work Orders", "Payroll",
  "Contract Forms", "Customer Verification", "Docs/Photos", "Call Logs"
];

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>{title}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, color: value ? "#1e293b" : "#cbd5e1", fontWeight: value ? 500 : 400 }}>{value || "—"}</div>
  </div>
);

const EditField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>{label}</label>
    {type === "textarea" ? (
      <textarea value={value} onChange={onChange} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", outline: "none", background: "#fff", resize: "vertical", minHeight: 60, boxSizing: "border-box" }} />
    ) : (
      <input type={type} value={value} onChange={onChange} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" }} />
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    Unverified: { bg: "#fef3c7", color: "#92400e" },
    Verified: { bg: "#d1fae5", color: "#065f46" },
    Rejected: { bg: "#fee2e2", color: "#991b1b" },
    Processed: { bg: "#e0e7ff", color: "#3730a3" },
    Pass: { bg: "#d1fae5", color: "#065f46" },
    Cancel: { bg: "#fee2e2", color: "#991b1b" },
    Fraud: { bg: "#fef3c7", color: "#92400e" },
    Duplicate: { bg: "#e0e7ff", color: "#3730a3" },
    Pending: { bg: "#f1f5f9", color: "#64748b" },
  };
  const s = config[status] || config.Pending;
  return <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
};

const inputStyle = { width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 };

export default function LeadDetailModal({ lead, onClose, onLeadUpdated }) {
  const [activeTab, setActiveTab] = useState("Basic Info");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (!lead) return null;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const initEditForm = () => {
    setEditForm({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      primaryEmail: lead.primaryEmail || "",
      mobilePhone: lead.mobilePhone || "",
      secondaryPhone: lead.secondaryPhone || "",
      accountNumber: lead.accountNumber || "",
      ssn: lead.ssn || "",
      address: lead.address || "",
      city: lead.city || "",
      usState: lead.usState || "",
      zip: lead.zip || "",
      county: lead.county || "",
      campaign: lead.campaign || "",
      channel: lead.channel || "",
      area: lead.area || "",
      rep: lead.rep || "",
      assignedTo: lead.assignedTo || "",
      link: lead.link || "",
      creditRisk: lead.creditRisk || "",
      followUp: lead.followUp || "None",
      verifierRemarks: lead.verifierRemarks || "",
      workOrder: lead.workOrder || "",
      prepayment: lead.prepayment || 0,
      workflowStatus: lead.workflowStatus || "Pending",
      status: lead.status || "Unverified",
      paymentStatus: lead.paymentStatus || "",
    });
  };

  const handleStartEdit = () => { initEditForm(); setEditing(true); };
  const handleCancelEdit = () => { setEditing(false); setEditForm({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/leads/${lead._id}`, editForm);
      toast.success("Lead updated successfully!");
      setEditing(false);
      if (onLeadUpdated) onLeadUpdated();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error updating lead!");
    } finally { setSaving(false); }
  };

  const handleFileUpload = async (e, type) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append(type, f));
      await api.post(`/upload/${lead._id}/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${type === "photos" ? "Photos" : "Documents"} uploaded successfully!`);
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Upload failed!");
    } finally { setUploading(false); }
  };

  const setEdit = (field, value) => setEditForm((p) => ({ ...p, [field]: value }));

  const renderTabContent = () => {
    switch (activeTab) {
      case "Basic Info":
        return (
          <>
            <Section title="Basic Information">
              {editing ? (
                <>
                  <EditField label="First Name" value={editForm.firstName} onChange={(e) => setEdit("firstName", e.target.value)} />
                  <EditField label="Last Name" value={editForm.lastName} onChange={(e) => setEdit("lastName", e.target.value)} />
                  <EditField label="Primary Email" value={editForm.primaryEmail} onChange={(e) => setEdit("primaryEmail", e.target.value)} />
                  <EditField label="Mobile Phone" value={editForm.mobilePhone} onChange={(e) => setEdit("mobilePhone", formatPhone(e.target.value))} />
                  <EditField label="Secondary Phone" value={editForm.secondaryPhone} onChange={(e) => setEdit("secondaryPhone", formatPhone(e.target.value))} />
                  <Field label="Language" value={lead.language} />
                  <Field label="Agent Type" value={lead.agentType} />
                  <EditField label="Assigned To" value={editForm.assignedTo} onChange={(e) => setEdit("assignedTo", e.target.value)} />
                </>
              ) : (
                <>
                  <Field label="First Name" value={lead.firstName} />
                  <Field label="Last Name" value={lead.lastName} />
                  <Field label="Primary Email" value={lead.primaryEmail} />
                  <Field label="Mobile Phone" value={displayPhone(lead.mobilePhone)} />
                  <Field label="Secondary Phone" value={displayPhone(lead.secondaryPhone)} />
                  <Field label="Language" value={lead.language} />
                  <Field label="Agent Type" value={lead.agentType} />
                  <Field label="Assigned To" value={lead.assignedTo} />
                </>
              )}
            </Section>
            <Section title="Identification">
              {editing ? (
                <>
                  <EditField label="Account Number" value={editForm.accountNumber} onChange={(e) => setEdit("accountNumber", e.target.value)} />
                  <Field label="DSI ID" value={lead.dsiId} />
                  <Field label="Activity ID" value={lead.activityId} />
                  <EditField label="SSN" value={editForm.ssn} onChange={(e) => setEdit("ssn", e.target.value)} />
                  <Field label="Date of Birth" value={lead.dob ? new Date(lead.dob).toLocaleDateString() : null} />
                  <Field label="PIN" value={lead.pin ? "****" : null} />
                </>
              ) : (
                <>
                  <Field label="Account Number" value={lead.accountNumber} />
                  <Field label="DSI ID" value={lead.dsiId} />
                  <Field label="Activity ID" value={lead.activityId} />
                  <Field label="SSN" value={lead.ssn ? "***-**-" + lead.ssn.slice(-4) : null} />
                  <Field label="Date of Birth" value={lead.dob ? new Date(lead.dob).toLocaleDateString() : null} />
                  <Field label="PIN" value={lead.pin ? "****" : null} />
                </>
              )}
            </Section>
            <Section title="Preferences">
              <Field label="Receive Text" value={lead.receiveText ? "Yes" : "No"} />
              <Field label="Receive Email" value={lead.receiveEmail ? "Yes" : "No"} />
              <Field label="Customer Consents" value={lead.customerConsents ? "Yes" : "No"} />
              {editing ? <EditField label="Follow Up" value={editForm.followUp} onChange={(e) => setEdit("followUp", e.target.value)} /> : <Field label="Follow Up" value={lead.followUp} />}
            </Section>
            <Section title="Business Info">
              {editing ? (
                <>
                  <Field label="SP Customer ID" value={lead.spCustomerId} />
                  <EditField label="Campaign" value={editForm.campaign} onChange={(e) => setEdit("campaign", e.target.value)} />
                  <EditField label="Channel" value={editForm.channel} onChange={(e) => setEdit("channel", e.target.value)} />
                  <EditField label="Area" value={editForm.area} onChange={(e) => setEdit("area", e.target.value)} />
                  <EditField label="Rep" value={editForm.rep} onChange={(e) => setEdit("rep", e.target.value)} />
                  <EditField label="Credit Risk" value={editForm.creditRisk} onChange={(e) => setEdit("creditRisk", e.target.value)} />
                </>
              ) : (
                <>
                  <Field label="SP Customer ID" value={lead.spCustomerId} />
                  <Field label="Campaign" value={lead.campaign} />
                  <Field label="Channel" value={lead.channel} />
                  <Field label="Area" value={lead.area} />
                  <Field label="Rep" value={lead.rep} />
                  <Field label="Credit Risk" value={lead.creditRisk} />
                </>
              )}
            </Section>
            <Section title="System Information">
              <Field label="Created At" value={new Date(lead.createdAt).toLocaleString()} />
              <Field label="Updated At" value={new Date(lead.updatedAt).toLocaleString()} />
              <Field label="First Touch" value={lead.firstTouch ? new Date(lead.firstTouch).toLocaleString() : null} />
              <Field label="Payment Status" value={lead.paymentStatus || "—"} />
              <Field label="Is Customer" value={lead.isCustomer ? "Yes" : "No"} />
              <Field label="Converted" value={lead.converted ? "Yes" : "No"} />
            </Section>
          </>
        );

      case "Address":
        return (
          <Section title="Address Details">
            {editing ? (
              <>
                <EditField label="Address" value={editForm.address} onChange={(e) => setEdit("address", e.target.value)} />
                <Field label="Address 2" value={lead.address2} />
                <EditField label="City" value={editForm.city} onChange={(e) => setEdit("city", e.target.value)} />
                <EditField label="State" value={editForm.usState} onChange={(e) => setEdit("usState", e.target.value)} />
                <EditField label="ZIP" value={editForm.zip} onChange={(e) => setEdit("zip", e.target.value)} />
                <Field label="ZIP+4" value={lead.zipcode4} />
                <EditField label="County" value={editForm.county} onChange={(e) => setEdit("county", e.target.value)} />
                <Field label="Previous Address Same" value={lead.previousAddressSame ? "Yes" : "No"} />
              </>
            ) : (
              <>
                <Field label="Address" value={lead.address} />
                <Field label="Address 2" value={lead.address2} />
                <Field label="City" value={lead.city} />
                <Field label="State" value={lead.usState} />
                <Field label="ZIP" value={lead.zip} />
                <Field label="ZIP+4" value={lead.zipcode4} />
                <Field label="County" value={lead.county} />
                <Field label="Previous Address Same" value={lead.previousAddressSame ? "Yes" : "No"} />
              </>
            )}
          </Section>
        );

      case "Documents":
        return (
          <Section title="Identity Documents">
            <Field label="Driver License #" value={lead.driverNumber} />
            <Field label="Driver State" value={lead.driverState} />
            <Field label="Driver Expiry" value={lead.driverExp ? new Date(lead.driverExp).toLocaleDateString() : null} />
            <Field label="Security Answer" value={lead.securityAnswer ? "••••••" : null} />
          </Section>
        );

      case "Verification":
        return (
          <div style={{ background: lead.status === "Verified" ? "#f0fdf4" : "#f8fafc", borderRadius: 10, padding: 16, border: lead.status === "Verified" ? "1px solid #bbf7d0" : "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Verification Info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {editing ? (
                <>
                  <div>
                    <label style={labelStyle}>Workflow Status</label>
                    <select style={inputStyle} value={editForm.workflowStatus} onChange={(e) => setEdit("workflowStatus", e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Pass">Pass</option>
                      <option value="Cancel">Cancel</option>
                      <option value="Fraud">Fraud</option>
                      <option value="Duplicate">Duplicate</option>
                    </select>
                  </div>
                  <EditField label="Work Order" value={editForm.workOrder} onChange={(e) => setEdit("workOrder", e.target.value)} />
                  <EditField label="Prepayment" type="number" value={editForm.prepayment} onChange={(e) => setEdit("prepayment", e.target.value)} />
                  <EditField label="Verifier Remarks" value={editForm.verifierRemarks} onChange={(e) => setEdit("verifierRemarks", e.target.value)} />
                  <Field label="Verified By" value={lead.verifiedBy?.name} />
                  <Field label="Verified Date" value={lead.verifiedAt ? new Date(lead.verifiedAt).toLocaleDateString() : null} />
                </>
              ) : (
                <>
                  <Field label="Workflow Status" value={lead.workflowStatus} />
                  <Field label="Work Order" value={lead.workOrder} />
                  <Field label="Prepayment" value={lead.prepayment ? `$${lead.prepayment}` : null} />
                  <Field label="Verified By" value={lead.verifiedBy?.name} />
                  <Field label="Verified Date" value={lead.verifiedAt ? new Date(lead.verifiedAt).toLocaleDateString() : null} />
                  <Field label="Verifier Remarks" value={lead.verifierRemarks} />
                </>
              )}
            </div>
          </div>
        );

      case "Action Logs":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Action Logs</div>
            {[
              { action: "Lead Created", by: lead.agent?.name || "Agent", date: lead.createdAt, color: "#06b6d4" },
              lead.verifiedAt && { action: `Lead ${lead.workflowStatus}`, by: lead.verifiedBy?.name || "Verifier", date: lead.verifiedAt, color: "#10b981" },
              lead.processedAt && { action: "Payment Status Updated", by: "Admin", date: lead.processedAt, color: "#f59e0b" },
            ].filter(Boolean).map((log, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${log.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: log.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{log.action}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>By {log.by} • {new Date(log.date).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case "Notes":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Notes</div>
            {editing ? (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Verifier Remarks</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={editForm.verifierRemarks} onChange={(e) => setEdit("verifierRemarks", e.target.value)} />
              </div>
            ) : lead.verifierRemarks ? (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Verifier Remarks</div>
                <div style={{ fontSize: 13, color: "#1e293b" }}>{lead.verifierRemarks}</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                <div>No notes yet</div>
              </div>
            )}
            {lead.link && (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9", marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Link</div>
                <a href={lead.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#06b6d4" }}>{lead.link}</a>
              </div>
            )}
          </div>
        );

      case "Work Orders":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Work Orders</div>
            {lead.workOrder ? (
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 16, border: "1px solid #bbf7d0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Work Order #" value={lead.workOrder} />
                  <Field label="Prepayment" value={lead.prepayment ? `$${lead.prepayment}` : null} />
                  <Field label="Verified By" value={lead.verifiedBy?.name} />
                  <Field label="Verified Date" value={lead.verifiedAt ? new Date(lead.verifiedAt).toLocaleDateString() : null} />
                  <Field label="Workflow Status" value={lead.workflowStatus} />
                  <Field label="Payment Status" value={lead.paymentStatus || "Pending"} />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div>No work orders yet</div>
              </div>
            )}
          </div>
        );

      case "Payroll":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Payroll / Recon</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Agent Name" value={lead.agent?.name} />
              <Field label="Agent Type" value={lead.agentType} />
              <Field label="Campaign" value={lead.campaign} />
              <Field label="Prepayment" value={lead.prepayment ? `$${lead.prepayment}` : "—"} />
              <Field label="Payment Status" value={lead.paymentStatus || "Pending"} />
              <Field label="Processed Date" value={lead.processedAt ? new Date(lead.processedAt).toLocaleDateString() : "—"} />
            </div>
          </div>
        );

      case "Contract Forms":
        return (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>Customer Contract Forms</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{lead.customerConsents ? "Customer has given consent ✅" : "No consent recorded yet"}</div>
          </div>
        );

      case "Customer Verification":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Customer Verification</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Is Customer" value={lead.isCustomer ? "Yes ✅" : "No"} />
              <Field label="Converted" value={lead.converted ? "Yes ✅" : "No"} />
              <Field label="Customer Consents" value={lead.customerConsents ? "Yes ✅" : "No"} />
              <Field label="Receive Text" value={lead.receiveText ? "Yes" : "No"} />
              <Field label="Receive Email" value={lead.receiveEmail ? "Yes" : "No"} />
              <Field label="SP Customer ID" value={lead.spCustomerId} />
            </div>
          </div>
        );

      case "Docs/Photos":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Documents & Photos</div>

            {/* Upload Buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", cursor: uploading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, opacity: uploading ? 0.7 : 1 }}>
                📷 Upload Photo
                <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => handleFileUpload(e, "photos")} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", cursor: uploading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, opacity: uploading ? 0.7 : 1 }}>
                📄 Upload Document
                <input type="file" accept=".pdf,.doc,.docx,.txt" multiple hidden disabled={uploading} onChange={(e) => handleFileUpload(e, "docs")} />
              </label>
              {uploading && <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center" }}>⏳ Uploading...</div>}
            </div>

            {lead.docs?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Documents ({lead.docs.length})</div>
                {lead.docs.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 16 }}>📄</span>
                    <a 
                      href={doc.startsWith("http") ? doc : `https://crm-backend-vercel.vercel.app${doc}`} 
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: 12, color: "#06b6d4", textDecoration: "none" }}>
                      📄 {decodeURIComponent(doc.split("/").pop())}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {lead.photos?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Photos ({lead.photos.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lead.photos.map((photo, i) => (
                    <a key={i} href={photo.startsWith("http") ? photo : `https://crm-backend-vercel.vercel.app${photo}`} target="_blank" rel="noreferrer">
                      <img src={photo.startsWith("http") ? photo : `https://crm-backend-vercel.vercel.app${photo}`} alt={`photo-${i}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #f1f5f9" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(!lead.docs?.length && !lead.photos?.length) && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <div>No files uploaded yet</div>
              </div>
            )}
          </div>
        );

      case "Call Logs":
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Call Logs</div>
            {lead.callLogs?.length > 0 ? (
              lead.callLogs.map((log, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", marginBottom: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{new Date(log.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: "#1e293b" }}>{log.note}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📞</div>
                <div>No call logs yet</div>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 560, height: "100vh", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.15)" }}>

          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{lead.firstName} {lead.lastName}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>#{lead._id?.slice(-8).toUpperCase()}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {editing ? (
                <>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={handleCancelEdit}
                    style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <MdSave size={14} /> {saving ? "Saving..." : "Save"}
                  </motion.button>
                </>
              ) : (
                <>
                  {isAdmin && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartEdit}
                    style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <MdEdit size={14} /> Edit
                  </motion.button>}
                  <StatusBadge status={lead.status} />
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                    style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#64748b", display: "flex" }}>
                    <MdClose size={18} />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 16, flexWrap: "wrap", flexShrink: 0, background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><MdPhone size={14} color="#06b6d4" />{displayPhone(lead.mobilePhone)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><MdEmail size={14} color="#8b5cf6" />{lead.primaryEmail || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><MdPerson size={14} color="#f59e0b" />{lead.agentType || "—"}</div>
          </div>

          <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #f1f5f9", flexShrink: 0, background: "#fff" }}>
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 14px", border: "none", background: "transparent", fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "#06b6d4" : "#94a3b8", borderBottom: activeTab === tab ? "2px solid #06b6d4" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab + (editing ? "-edit" : "")} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
