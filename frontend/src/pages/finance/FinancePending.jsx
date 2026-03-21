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
  markAsPaid,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/financepending.css";

const FinancePending = () => {
  const { user } = useAuth();
  const [managerApproved, setManagerApproved] = useState([]);
  const [financeApproved, setFinanceApproved] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ type: "", text: "" });
  const [actionId, setActionId] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason]     = useState("");
  const [rejecting, setRejecting] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const load = () => {
    setLoading(true);
    Promise.all([getFinancePending(), getFinancePaid()])
      .then(([pendingRes]) => {
        const all = pendingRes.data?.expenses || [];
        setManagerApproved(all.filter((e) => e.status === "MANAGER_APPROVED"));
        setFinanceApproved(all.filter((e) => e.status === "FINANCE_APPROVED"));
      })
      .catch(() => showMsg("error", "Failed to load expenses."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id + "_approve");
    try {
      await financeApprove(id);
      showMsg("success", "Expense approved by finance.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Approval failed.");
    } finally {
      setActionId("");
    }
  };

  const handlePay = async (id) => {
    setActionId(id + "_pay");
    try {
      await markAsPaid(id);
      showMsg("success", "Expense marked as paid.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Payment failed.");
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
      showMsg("success", "Expense rejected.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Rejection failed.");
    } finally {
      setRejecting(false);
    }
  };

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const renderTable = (expenses, type) => (
    <div className="table-scroll-wrap">
      {loading ? (
        <div className="table-empty"><span className="table-empty-icon">⏳</span>Loading…</div>
      ) : expenses.length === 0 ? (
        <div className="table-empty">
          <span className="table-empty-icon">{type === "approve" ? "✅" : "💳"}</span>
          {type === "approve"
            ? "No expenses awaiting finance approval."
            : "No expenses ready for payment."}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Amount</th>
              {type === "pay" && <th>Status</th>}
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>
                  <span className="mono-id">{exp._id?.slice(-8).toUpperCase()}</span>
                </td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-sm">{getInitials(exp.employeeId?.name)}</div>
                    <div>
                      <div className="user-name">{exp.employeeId?.name || "Employee"}</div>
                      {exp.employeeId?.email && (
                        <div className="user-email">{exp.employeeId.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{exp.category}</td>
                <td style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", letterSpacing: "-0.2px", fontWeight: 400, color: "var(--text-1)" }}>
                  {formatCurrency(exp.amount)}
                </td>
                {type === "pay" && <td><StatusBadge status={exp.status} /></td>}
                <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                  {formatDate(exp.submittedAt)}
                </td>
                <td>
                  <div className="finance-actions">
                    {type === "approve" ? (
                      <>
                        <button
                          className="btn-approve"
                          disabled={actionId === exp._id + "_approve"}
                          onClick={() => handleApprove(exp._id)}
                        >
                          {actionId === exp._id + "_approve" ? "…" : "Approve"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => { setRejectId(exp._id); setReason(""); }}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-paid"
                        disabled={actionId === exp._id + "_pay"}
                        onClick={() => handlePay(exp._id)}
                      >
                        {actionId === exp._id + "_pay" ? "…" : "Mark as Paid"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Finance Pending" />
        <div className="page-body">

          <div className="finance-header">
            <div className="finance-title">Finance Pending</div>
            <div className="finance-subtitle">Approve expenses and mark them as paid</div>
          </div>

          {msg.text && (
            <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
              {msg.text}
            </div>
          )}

          {/* Section 1 Needs Finance Approval */}
          <div style={{ marginBottom: 28 }}>
            <div className="finance-section-label">
              <span className="finance-section-title">Awaiting Finance Approval</span>
              <span className="count-badge blue">{managerApproved.length}</span>
            </div>
            <div className="table-card">
              {renderTable(managerApproved, "approve")}
            </div>
          </div>

          {/* Section 2 Ready to Pay */}
          <div>
            <div className="finance-section-label">
              <span className="finance-section-title">Finance Approved — Ready to Pay</span>
              <span className="count-badge green">{financeApproved.length}</span>
            </div>
            <div className="table-card">
              {renderTable(financeApproved, "pay")}
            </div>
          </div>

          {/* Reject Modal */}
          {rejectId && (
            <div
              className="reject-modal-overlay"
              onClick={(e) => e.target === e.currentTarget && (setRejectId(null), setReason(""))}
            >
              <div className="reject-modal">
                <div className="reject-modal-icon">✕</div>
                <div className="reject-modal-title">Reject Expense</div>
                <div className="reject-modal-desc">
                  Provide a reason — this will be visible to the employee.
                </div>
                <textarea
                  className="reject-modal-textarea"
                  placeholder="Enter rejection reason…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="reject-modal-actions">
                  <button className="btn-cancel" onClick={() => { setRejectId(null); setReason(""); }}>
                    Cancel
                  </button>
                  <button
                    className="btn-confirm-reject"
                    onClick={handleReject}
                    disabled={rejecting || !reason.trim()}
                  >
                    {rejecting ? "Rejecting…" : "Confirm Reject"}
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