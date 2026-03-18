import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getManagerPending,
  managerApprove,
  managerReject,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import "../../styles/pendingapprovals.css";

const PendingApprovals = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Reject modal state
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const load = () => {
    setLoading(true);
    getManagerPending()
      .then((res) => setExpenses(res.data.expenses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id, employeeId) => {
    // Manager cannot approve their own expense
    if (employeeId === user.id || employeeId?._id === user.id) {
      setMsg({ type: "error", text: "You cannot approve your own expense." });
      return;
    }
    try {
      await managerApprove(id);
      setMsg({ type: "success", text: "Expense approved." });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Approval failed.",
      });
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setRejecting(true);
    try {
      await managerReject(rejectId, reason);
      setRejectId(null);
      setReason("");
      setMsg({ type: "success", text: "Expense rejected." });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Rejection failed.",
      });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Pending Approvals" />
        <div className="page-body">
          <div className="pending-header">
            <div className="pending-title">Pending Approvals</div>
            <div className="pending-subtitle">
              Expenses submitted by your team awaiting your review
            </div>
          </div>

          {msg.text && (
            <div
              style={{
                background: msg.type === "success" ? "#e6f6f0" : "#fdecea",
                color:
                  msg.type === "success" ? "var(--success)" : "var(--danger)",
                border: `1px solid ${msg.type === "success" ? "rgba(15,123,79,0.15)" : "rgba(190,29,44,0.15)"}`,
                borderRadius: 6,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: "0.855rem",
              }}
            >
              {msg.text}
            </div>
          )}

          <div className="table-card">
            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="table-empty">
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
                        <strong>{exp.employeeId?.name || "Employee"}</strong>
                      </td>
                      <td>{exp.category}</td>
                      <td>
                        <strong>{formatCurrency(exp.amount)}</strong>
                      </td>
                      <td
                        style={{
                          color: "var(--gray-500)",
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {exp.notes || "—"}
                      </td>
                      <td>{formatDate(exp.submittedAt)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="table-btn"
                            onClick={() =>
                              navigate(`/manager/pending/${exp._id}`)
                            }
                          >
                            {" "}
                            {/* ← add this */}
                            View
                          </button>
                          <button
                            className="table-btn approve"
                            onClick={() =>
                              handleApprove(exp._id, exp.employeeId)
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="table-btn reject"
                            onClick={() => {
                              setRejectId(exp._id);
                              setReason("");
                            }}
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

          {/* Reject modal */}
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
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setRejectId(null);
                      setReason("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-confirm-reject"
                    onClick={handleReject}
                    disabled={rejecting || !reason.trim()}
                  >
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

export default PendingApprovals;
