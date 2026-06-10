import React from "react";
import { pageStyles, tableStyles, pillStyles } from "../../styles/dashboardStyles";

const CommissionDashboard = ({ commissions }) => {
  const safeCommissions = Array.isArray(commissions) ? commissions : [];
  const totalCommission = safeCommissions.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div style={pageStyles.wrapper}>
      <h1 style={pageStyles.title}>Commission Dashboard</h1>
      <div style={pageStyles.card}>
        <div style={pageStyles.cardHeader}>
          <h2 style={pageStyles.cardHeading}>Commission Summary</h2>
          <span style={pageStyles.badge}>Total: {totalCommission}</span>
        </div>
        {safeCommissions.length === 0 ? (
          <p style={pageStyles.emptyText}>No commission records yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  <th style={tableStyles.headerCell}>Lead</th>
                  <th style={tableStyles.headerCell}>Agent</th>
                  <th style={tableStyles.headerCell}>Plan</th>
                  <th style={tableStyles.headerCell}>Status</th>
                  <th style={tableStyles.headerCell}>Commission</th>
                </tr>
              </thead>
              <tbody>
                {safeCommissions.map((row) => (
                  <tr key={row._id}>
                    <td style={tableStyles.cell}>{row.leadName}</td>
                    <td style={tableStyles.cell}>{row.agentName}</td>
                    <td style={tableStyles.cell}>{row.plan}</td>
                    <td style={tableStyles.cell}>
                      <span
                        style={{
                          ...pillStyles.base,
                          ...(row.status === "Verified"
                            ? pillStyles.verified
                            : row.status === "Pending"
                            ? pillStyles.pending
                            : pillStyles.rejected),
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={tableStyles.cell}>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionDashboard;
