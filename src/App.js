import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Layout
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Agent Pages
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import CreateLead from "./pages/agent/CreateLead";
import VerifiedLeadsAgent from "./pages/agent/VerifiedLeadsAgent";

// Verifier Pages
import VerifierDashboard from "./pages/dashboards/VerifierDashboard";
import VerifiedLeadsVerifier from "./pages/verifier/VerifiedLeadsVerifier";

// Admin Pages
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import ProcessedLeads from "./pages/admin/ProcessedLeads";
import CreateAgentProfile from "./pages/admin/CreateAgentProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ===== AGENT ROUTES ===== */}
        <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/agent/create-lead" element={<CreateLead />} />
            <Route path="/agent/verified-leads" element={<VerifiedLeadsAgent />} />
          </Route>
        </Route>

        {/* ===== VERIFIER ROUTES ===== */}
        <Route element={<ProtectedRoute allowedRoles={["verifier"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/verifier" element={<VerifierDashboard />} />
            <Route path="/verifier/verified" element={<VerifiedLeadsVerifier />} />
          </Route>
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />

            {/* All Leads */}
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/leads/processed" element={<ProcessedLeads />} />

            {/* D2D Sales */}
            <Route path="/admin/d2d" element={<AdminLeads agentType="D2D Sales" />} />
            <Route path="/admin/d2d/processed" element={<ProcessedLeads agentType="D2D Sales" />} />

            {/* Inhouse Sales */}
            <Route path="/admin/inhouse" element={<AdminLeads agentType="Inhouse" />} />
            <Route path="/admin/inhouse/processed" element={<ProcessedLeads agentType="Inhouse" />} />

            {/* Agents */}
            <Route path="/admin/agents" element={<AdminLeads agentType="Agent" />} />
            <Route path="/admin/agents/processed" element={<ProcessedLeads agentType="Agent" />} />

            {/* Create Profile */}
            <Route path="/admin/create-profile" element={<CreateAgentProfile />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
