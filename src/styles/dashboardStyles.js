export const pageStyles = {
  wrapper: { padding: "20px", minHeight: "100vh", background: "#f4f6f8" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 20 },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeading: { fontSize: 20, fontWeight: 500 },
  badge: {
    background: "#009879",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
  },
  emptyText: { fontStyle: "italic", color: "#555" },
};

export const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse" },
  headerCell: {
    textAlign: "left",
    padding: "8px",
    background: "#009879",
    color: "#fff",
    fontWeight: 500,
  },
  cell: { padding: "8px", borderBottom: "1px solid #ddd" },
};

export const pillStyles = {
  base: {
    padding: "4px 8px",
    borderRadius: 6,
    color: "#fff",
    fontWeight: 500,
    fontSize: 12,
  },
  verified: { background: "#28a745" },
  pending: { background: "#ffc107" },
  rejected: { background: "#dc3545" },
};

export const btnStyles = {
  base: {
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 6,
    fontSize: 13,
  },
  primary: { background: "#009879", color: "#fff" },
  reject: { background: "#dc3545", color: "#fff" },
  verify: { background: "#28a745", color: "#fff" },
};
