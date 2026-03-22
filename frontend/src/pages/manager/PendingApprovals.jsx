import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getManagerPending,
  managerApprove,
  managerReject,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import "../../styles/pendingapprovals.css";

const PendingApprovals = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState({ type: "", text: "" });
  const [rejectId, setRejectId]   = useState(null);
  const [reason, setReason]       = useState("");
  const [rejecting, setRejecting] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const load = () => {
    setLoading(true);
    getManagerPending()
      .then((res) => setExpenses(res.data.expenses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id, employeeId) => {
    const empId = employeeId?._id || employeeId;
    if (empId === user.id) {
      showMsg("error", "You cannot approve your own expense.");
      return;
    }
    try {
      await managerApprove(id);
      showMsg("success", "Expense approved successfully.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Approval failed.");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setRejecting(true);
    try {
      await managerReject(rejectId, reason);
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
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Pending Approvals" />
        <div className="page-body">

          {/* Header */}
          <div className="pending-header">
            <div className="pending-title">Pending Approvals</div>
            <div className="pending-subtitle">
              Expenses submitted by your team awaiting your review
            </div>
          </div>

          {/* Alert */}
          {msg.text && (
            <div className={`pending-alert ${msg.type}`}>{msg.text}</div>
          )}

          {/* Table */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">Team Submissions</h2>
              {!loading && (
                <span className="count-badge amber">{expenses.length}</span>
              )}
            </div>

            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>
                  Loading…
                </div>
              ) : expenses.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">✅</span>
                  No pending approvals. Your team is all caught up!
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Notes</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">
                              {getInitials(exp.employeeId?.name)}
                            </div>
                            <div>
                              <div className="user-name">{exp.employeeId?.name || "Employee"}</div>
                              {exp.employeeId?.email && (
                                <div className="user-email">{exp.employeeId.email}</div>
              )}
                            </div>
                          </div>
                        </td>
                        <td>{exp.category}</td>
                        <td>
                          <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", letterSpacing: "-0.2px" }}>
                            {formatCurrency(exp.amount)}
                          </strong>
                        </td>
                        <td className="cell-wrap" style={{ maxWidth: 160 }}>
                          {exp.notes || <span style={{ color: "var(--text-4)" }}>—</span>}
                        </td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {formatDate(exp.submittedAt)}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="table-btn"
                              onClick={() => navigate(`/manager/pending/${exp._id}`)}
                            >
                              View
                            </button>
                            <button
                              className="table-btn approve"
                              onClick={() => handleApprove(exp._id, exp.employeeId)}
                            >
                              Approve
                            </button>
                            <button
                              className="table-btn reject"
                              onClick={() => { setRejectId(exp._id); setReason(""); }}
                            >
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

          {/* Reject modal */}
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
                  <button
                    className="btn-cancel"
                    onClick={() => { setRejectId(null); setReason(""); }}
                  >
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

export default PendingApprovals;