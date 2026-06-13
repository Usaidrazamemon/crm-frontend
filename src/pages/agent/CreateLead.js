
import { formatPhone } from '../../utils/phoneFormat';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

const sections = [
  "Basic Info", "Identification", "Address", "Identity Docs",
  "Preferences", "Business Info", "Additional", "Attachments",
];

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);

const Row = ({ children, isMobile }) => (
  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
    {children}
  </div>
);

export default function CreateLead() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [createdLeadId, setCreatedLeadId] = useState(null);
  const [docs, setDocs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [callLogNote, setCallLogNote] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", primaryEmail: "", mobilePhone: "", secondaryPhone: "",
    accountNumber: "", dsiId: "", activityId: "", ssn: "", dob: "", pin: "", securityAnswer: "",
    address: "", address2: "", city: "", usState: "", zip: "", zipcode4: "", county: "", previousAddressSame: true,
    driverNumber: "", driverState: "", driverExp: "",
    receiveText: false, receiveEmail: false, language: "English", customerConsents: false,
    spCustomerId: "", campaign: "", channel: "", processorChannel: "", area: "", rep: "",
    creditRisk: "", followUp: "None", assignedTo: "", link: "",
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b",
    outline: "none", boxSizing: "border-box", background: "#fff",
  };

  // File upload function
  const uploadFiles = async (leadId) => {
    if (docs.length === 0 && photos.length === 0 && !callLogNote) return;
    setUploadingFiles(true);
    try {
      // Upload docs separately
      if (docs.length > 0) {
        const docsForm = new FormData();
        docs.forEach(f => docsForm.append("docs", f));
        await api.post(`/upload/${leadId}/docs`, docsForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // Upload photos separately
      if (photos.length > 0) {
        const photosForm = new FormData();
        photos.forEach(f => photosForm.append("photos", f));
        await api.post(`/upload/${leadId}/photos`, photosForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // Upload call log
      if (callLogNote) {
        await api.post(`/upload/${leadId}/calllog`, { note: callLogNote });
      }
      toast.success("Files uploaded successfully!");
    } catch (err) {
      toast.error("File upload failed. Please try again!");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!form.firstName || !form.lastName || !form.mobilePhone) {
      toast.error("First name, last name and phone are required!");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isDraft ? "/leads/draft" : "/leads";
      const res = await api.post(endpoint, form);
      const leadId = res.data.lead._id;
      setCreatedLeadId(leadId);

      // Files upload karo agar hain
      await uploadFiles(leadId);

      toast.success(isDraft ? "Draft saved successfully!" : "Lead submitted successfully!");
      setTimeout(() => navigate("/agent"), 1200);
    } catch (err) {
      if (err.response?.status === 409) {
        const duplicates = err.response.data.duplicates || [];
        toast.error("⚠️ Duplicate Lead Detected!", { duration: 4000 });
        duplicates.forEach((msg) => toast.error(msg, { duration: 6000 }));
      } else {
        toast.error(err.response?.data?.msg || "Error occurred!");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (step) {
      case 0: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="First Name *"><input style={inputStyle} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="John" /></Field>
            <Field label="Last Name *"><input style={inputStyle} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Doe" /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Primary Email"><input style={inputStyle} type="email" value={form.primaryEmail} onChange={(e) => set("primaryEmail", e.target.value)} placeholder="john@example.com" /></Field>
            <Field label="Mobile Phone *"><input style={inputStyle} value={form.mobilePhone} onChange={(e) => set("mobilePhone", formatPhone(e.target.value))} placeholder="(XXX) XXX-XXXX" /></Field>
          </Row>
          <Field label="Secondary Phone"><input style={inputStyle} value={form.secondaryPhone} onChange={(e) => set("secondaryPhone", formatPhone(e.target.value))} placeholder="(XXX) XXX-XXXX" /></Field>
        </div>
      );
      case 1: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="Account Number"><input style={inputStyle} value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} /></Field>
            <Field label="DSI ID"><input style={inputStyle} value={form.dsiId} onChange={(e) => set("dsiId", e.target.value)} /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Activity ID"><input style={inputStyle} value={form.activityId} onChange={(e) => set("activityId", e.target.value)} /></Field>
            <Field label="SSN"><input style={inputStyle} value={form.ssn} onChange={(e) => set("ssn", e.target.value)} placeholder="XXX-XX-XXXX" /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Date of Birth"><input style={inputStyle} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
            <Field label="PIN"><input style={inputStyle} value={form.pin} onChange={(e) => set("pin", e.target.value)} /></Field>
          </Row>
          <Field label="Security Answer"><input style={inputStyle} value={form.securityAnswer} onChange={(e) => set("securityAnswer", e.target.value)} /></Field>
        </div>
      );
      case 2: return (
        <div>
          <Field label="Address"><input style={inputStyle} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" /></Field>
          <Field label="Address 2"><input style={inputStyle} value={form.address2} onChange={(e) => set("address2", e.target.value)} placeholder="Apt, Suite, etc." /></Field>
          <Row isMobile={isMobile}>
            <Field label="City"><input style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="State"><input style={inputStyle} value={form.usState} onChange={(e) => set("usState", e.target.value)} /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="ZIP"><input style={inputStyle} value={form.zip} onChange={(e) => set("zip", e.target.value)} /></Field>
            <Field label="ZIP+4"><input style={inputStyle} value={form.zipcode4} onChange={(e) => set("zipcode4", e.target.value)} /></Field>
            <Field label="County"><input style={inputStyle} value={form.county} onChange={(e) => set("county", e.target.value)} /></Field>
          </Row>
          <Field label="Previous Address Same?">
            <select style={inputStyle} value={form.previousAddressSame} onChange={(e) => set("previousAddressSame", e.target.value === "true")}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
        </div>
      );
      case 3: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="Driver License #"><input style={inputStyle} value={form.driverNumber} onChange={(e) => set("driverNumber", e.target.value)} /></Field>
            <Field label="Driver State"><input style={inputStyle} value={form.driverState} onChange={(e) => set("driverState", e.target.value)} /></Field>
          </Row>
          <Field label="Driver Expiry"><input style={inputStyle} type="date" value={form.driverExp} onChange={(e) => set("driverExp", e.target.value)} /></Field>
        </div>
      );
      case 4: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="Receive Text?">
              <select style={inputStyle} value={form.receiveText} onChange={(e) => set("receiveText", e.target.value === "true")}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
            <Field label="Receive Email?">
              <select style={inputStyle} value={form.receiveEmail} onChange={(e) => set("receiveEmail", e.target.value === "true")}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Language">
              <select style={inputStyle} value={form.language} onChange={(e) => set("language", e.target.value)}>
                <option>English</option><option>Spanish</option><option>Urdu</option><option>Other</option>
              </select>
            </Field>
            <Field label="Customer Consents?">
              <select style={inputStyle} value={form.customerConsents} onChange={(e) => set("customerConsents", e.target.value === "true")}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </Row>
        </div>
      );
      case 5: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="SP Customer ID"><input style={inputStyle} value={form.spCustomerId} onChange={(e) => set("spCustomerId", e.target.value)} /></Field>
            <Field label="Campaign"><input style={inputStyle} value={form.campaign} onChange={(e) => set("campaign", e.target.value)} /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Channel"><input style={inputStyle} value={form.channel} onChange={(e) => set("channel", e.target.value)} /></Field>
            <Field label="Processor Channel"><input style={inputStyle} value={form.processorChannel} onChange={(e) => set("processorChannel", e.target.value)} /></Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Area"><input style={inputStyle} value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
            <Field label="Rep"><input style={inputStyle} value={form.rep} onChange={(e) => set("rep", e.target.value)} /></Field>
          </Row>
        </div>
      );
      case 6: return (
        <div>
          <Row isMobile={isMobile}>
            <Field label="Credit Risk">
              <select style={inputStyle} value={form.creditRisk} onChange={(e) => set("creditRisk", e.target.value)}>
                <option value="">Select</option><option>Low</option><option>Medium</option><option>High</option>
              </select>
            </Field>
            <Field label="Follow Up">
              <select style={inputStyle} value={form.followUp} onChange={(e) => set("followUp", e.target.value)}>
                <option>None</option><option>Today</option><option>Tomorrow</option><option>This Week</option><option>Next Week</option>
              </select>
            </Field>
          </Row>
          <Row isMobile={isMobile}>
            <Field label="Assigned To"><input style={inputStyle} value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} /></Field>
            <Field label="Link"><input style={inputStyle} value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" /></Field>
          </Row>
        </div>
      );
      case 7: return (
        <div>
          {/* Docs Upload */}
          <Field label="Upload Documents (PDF, Word, TXT)">
            <div style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: 16, textAlign: "center", background: "#f8fafc" }}>
              <input type="file" multiple accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setDocs(Array.from(e.target.files))}
                style={{ display: "none" }} id="docs-input" />
              <label htmlFor="docs-input" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Click to select documents</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>PDF, Word, TXT — max 10MB each</div>
              </label>
              {docs.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {docs.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#10b981", padding: "3px 0" }}>✅ {f.name}</div>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Photos Upload */}
          <Field label="Upload Photos (JPG, PNG, GIF)">
            <div style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: 16, textAlign: "center", background: "#f8fafc" }}>
              <input type="file" multiple accept="image/*"
                onChange={(e) => setPhotos(Array.from(e.target.files))}
                style={{ display: "none" }} id="photos-input" />
              <label htmlFor="photos-input" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Click to select photos</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>JPG, PNG, GIF, WebP — max 10MB each</div>
              </label>
              {photos.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {photos.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#10b981" }}>✅ {f.name}</div>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Call Log */}
          <Field label="Call Log / Notes">
            <textarea
              value={callLogNote}
              onChange={(e) => setCallLogNote(e.target.value)}
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              placeholder="Add call notes here..."
            />
          </Field>

          {/* Upload summary */}
          {(docs.length > 0 || photos.length > 0 || callLogNote) && (
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "1px solid #bbf7d0", fontSize: 12, color: "#065f46" }}>
              ✅ Ready to upload: {docs.length} document(s), {photos.length} photo(s){callLogNote ? ", 1 call note" : ""}
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Create New Lead</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Step {step + 1} of {sections.length}</p>
      </motion.div>

      {/* Step Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sections.map((s, i) => (
            <motion.div key={s} onClick={() => setStep(i)} whileHover={{ scale: 1.03 }}
              style={{
                padding: isMobile ? "5px 10px" : "6px 14px", borderRadius: 20,
                fontSize: isMobile ? 11 : 12, fontWeight: 500, cursor: "pointer",
                background: i === step ? "#06b6d4" : i < step ? "#d1fae5" : "#f1f5f9",
                color: i === step ? "#fff" : i < step ? "#065f46" : "#94a3b8",
                transition: "all 0.2s",
              }}>
              {i < step ? "✓ " : ""}{isMobile ? (i + 1) : s}
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 12, height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <motion.div animate={{ width: `${((step + 1) / sections.length) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #06b6d4, #0284c7)", borderRadius: 4 }} />
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 16, padding: isMobile ? 16 : 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 18, marginTop: 0 }}>
          Section {step + 1}: {sections[step]}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setStep((p) => Math.max(0, p - 1))} disabled={step === 0}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: step === 0 ? "#cbd5e1" : "#64748b", fontSize: 13, fontWeight: 500, cursor: step === 0 ? "not-allowed" : "pointer" }}>
          ← {!isMobile && "Previous"}
        </motion.button>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handleSubmit(true)}
            style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            💾 {!isMobile && "Save Draft"}
          </motion.button>

          {step < sections.length - 1 ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep((p) => p + 1)}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {!isMobile && "Next"} →
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit(false)}
              disabled={loading || uploadingFiles}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: loading || uploadingFiles ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading || uploadingFiles ? "not-allowed" : "pointer" }}>
              {loading ? "Submitting..." : uploadingFiles ? "Uploading files..." : "✓ Submit Lead"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
