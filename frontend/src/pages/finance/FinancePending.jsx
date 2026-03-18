import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getFinancePending,
  getFinancePaid,
  financeApprove,
  financeReject,
  markAsPaid
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/financepending.css";

const FinancePending = () => {
  const { user } = useAuth();
  const [managerApproved, setManagerApproved] = useState([]); // needs finance approval
  const [financeApproved, setFinanceApproved] = useState([]); // needs payment
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ type: "", text: "" });
  const [actionId, setActionId] = useState("");

  // Reject modal
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason]     = useState("");
  const [rejecting, setRejecting] = useState(false);

  const load = () => {
    setLoading(true);
    // Load pending (MANAGER_APPROVED) and also get all paid to find FINANCE_APPROVED ones
    Promise.all([getFinancePending(), getFinancePaid()])
      .then(([pendingRes, paidRes]) => {
        // getFinancePending returns MANAGER_APPROVED expenses
        setManagerApproved(pendingRes.data?.expenses || []);

        // We need FINANCE_APPROVED expenses separately
        // They won't be in pending or paid — call a custom approach:
        // Actually re-use pending endpoint and filter by status
        const allPending = pendingRes.data?.expenses || [];
        setManagerApproved(allPending.filter(e => e.status === "MANAGER_APPROVED"));
        setFinanceApproved(allPending.filter(e => e.status === "FINANCE_APPROVED"));
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load expenses." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id + "_approve");
    try {
      await financeApprove(id);
      setMsg({ type: "success", text: "Expense approved by finance." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Approval failed." });
    } finally {
      setActionId("");
    }
  };

  const handlePay = async (id) => {
    setActionId(id + "_pay");
    try {
      await markAsPaid(id);
      setMsg({ type: "success", text: "Expense marked as paid." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed." });
    } finally {
      setActionId("");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setRejecting(true);
    try {
      await financeReject(rejectId, reason);
      setRejectId(null);
      setReason("");
      setMsg({ type: "success", text: "Expense rejected." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Rejection failed." });
    } finally {
      setRejecting(false);
    }
  };

  const allExpenses = [...managerApproved, ...financeApproved];

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Finance Pending" />
        <div className="page-body">

          <div className="finance-header">
            <div className="finance-title">Finance Pending</div>
            <div className="finance-subtitle">
              Approve expenses and mark them as paid
            </div>
          </div>

          {msg.text && (
            <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
              {msg.text}
            </div>
          )}

          {/* Section 1 — Needs Finance Approval */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#334155",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              Awaiting Finance Approval
              <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 5,
                padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                {managerApproved.length}
              </span>
            </div>

            <div className="table-card">
              {loading ? (
                <div className="table-empty">Loading...</div>
              ) : managerApproved.length === 0 ? (
                <div className="table-empty">No expenses waiting for finance approval.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerApproved.map((exp) => (
                      <tr key={exp._id}>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                          {exp._id?.slice(-8).toUpperCase()}
                        </td>
                        <td><strong>{exp.employeeId?.name || "Employee"}</strong></td>
                        <td>{exp.category}</td>
                        <td><strong>{formatCurrency(exp.amount)}</strong></td>
                        <td>{formatDate(exp.submittedAt)}</td>
                        <td>
                          <div className="finance-actions">
                            <button className="btn-approve"
                              disabled={actionId === exp._id + "_approve"}
                              onClick={() => handleApprove(exp._id)}>
                              {actionId === exp._id + "_approve" ? "..." : "Approve"}
                            </button>
                            <button className="btn-reject"
                              onClick={() => { setRejectId(exp._id); setReason(""); }}>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Section 2 — Approved, Ready to Pay */}
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#334155",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              Finance Approved — Ready to Pay
              <span style={{ background: "#e6f6f0", color: "#0f7b4f", borderRadius: 5,
                padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                {financeApproved.length}
              </span>
            </div>

            <div className="table-card">
              {loading ? (
                <div className="table-empty">Loading...</div>
              ) : financeApproved.length === 0 ? (
                <div className="table-empty">No expenses ready for payment.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeApproved.map((exp) => (
                      <tr key={exp._id}>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                          {exp._id?.slice(-8).toUpperCase()}
                        </td>
                        <td><strong>{exp.employeeId?.name || "Employee"}</strong></td>
                        <td>{exp.category}</td>
                        <td><strong>{formatCurrency(exp.amount)}</strong></td>
                        <td><StatusBadge status={exp.status} /></td>
                        <td>
                          <button className="btn-paid"
                            disabled={actionId === exp._id + "_pay"}
                            onClick={() => handlePay(exp._id)}>
                            {actionId === exp._id + "_pay" ? "..." : "Mark as Paid"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reject Modal */}
          {rejectId && (
            <div className="reject-modal-overlay">
              <div className="reject-modal">
                <div className="reject-modal-title">Reject Expense</div>
                <div className="reject-modal-desc">
                  Provide a reason — this will be visible to the employee.
                </div>
                <textarea
                  className="reject-modal-textarea"
                  placeholder="Enter rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="reject-modal-actions">
                  <button className="btn-cancel"
                    onClick={() => { setRejectId(null); setReason(""); }}>
                    Cancel
                  </button>
                  <button className="btn-confirm-reject"
                    onClick={handleReject}
                    disabled={rejecting || !reason.trim()}>
                    {rejecting ? "Rejecting..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FinancePending;