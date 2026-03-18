const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT:            { background: "#f1f5f9", color: "#475569" },
    SUBMITTED:        { background: "#e0f2fe", color: "#0369a1" },
    MANAGER_APPROVED: { background: "#ede9fe", color: "#5b21b6" },
    FINANCE_APPROVED: { background: "#e6f6f0", color: "#0f7b4f" },
    PAID:             { background: "#dcfce7", color: "#15803d" },
    REJECTED:         { background: "#fdecea", color: "#be1d2c" },
  };

  const labels = {
    DRAFT:            "Draft",
    SUBMITTED:        "Submitted",
    MANAGER_APPROVED: "Manager Approved",
    FINANCE_APPROVED: "Finance Approved",
    PAID:             "Paid",
    REJECTED:         "Rejected",
  };

  const style = styles[status] || styles.DRAFT;

  return (
    <span style={{
      ...style,
      padding:      "3px 10px",
      borderRadius: "5px",
      fontSize:     "0.75rem",
      fontWeight:   600,
      whiteSpace:   "nowrap",
      display:      "inline-block",
    }}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;