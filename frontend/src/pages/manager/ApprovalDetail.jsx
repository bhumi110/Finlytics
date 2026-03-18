import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getManagerPending,
  managerApprove,
  managerReject,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/approvaldetails.css";

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    getManagerPending()
      .then((res) => {
        const found = (res.data.expenses || []).find((e) => e._id === id);
        if (!found) setError("Expense not found or already reviewed.");
        else setExpense(found);
      })
      .catch(() => setError("Failed to load expense."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    // Cannot approve own expense
    const empId = expense.employeeId?._id || expense.employeeId;
    if (empId === user.id) {
      setMsg({ type: "error", text: "You cannot approve your own expense." });
      return;
    }
    setApproving(true);
    try {
      await managerApprove(id);
      setMsg({ type: "success", text: "Expense approved successfully." });
      setTimeout(() => navigate("/manager/pending"), 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Approval failed.",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setRejecting(true);
    try {
      await managerReject(id, reason);
      setRejectOpen(false);
      setMsg({ type: "success", text: "Expense rejected." });
      setTimeout(() => navigate("/manager/pending"), 1500);
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
        <Topbar title="Review Expense" />
        <div className="page-body">
          {/* Back button */}
          <div className="approval-header">
            <button
              className="approval-back"
              onClick={() => navigate("/manager/pending")}
            >
              ← Back to Pending
            </button>
          </div>

          {loading && <div style={{ color: "#64748b" }}>Loading...</div>}
          {error && <div className="approval-msg error">{error}</div>}
          {msg.text && (
            <div className={`approval-msg ${msg.type}`}>{msg.text}</div>
          )}

          {expense && (
            <div className="approval-grid">
              {/* Left — Expense Info */}
              <div className="approval-card">
                <div className="approval-card-title">
                  Expense Details
                  <StatusBadge status={expense.status} />
                </div>

                {/* Info rows */}
                <div className="approval-info-grid">
                  <div className="approval-info-item">
                    <div className="approval-info-label">Employee</div>
                    <div className="approval-info-value">
                      {expense.employeeId?.name || "—"}
                    </div>
                    {expense.employeeId?.email && (
                      <div className="approval-info-sub">
                        {expense.employeeId.email}
                      </div>
                    )}
                  </div>

                  <div className="approval-info-item">
                    <div className="approval-info-label">Amount</div>
                    <div className="approval-info-value approval-amount">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>

                  <div className="approval-info-item">
                    <div className="approval-info-label">Category</div>
                    <div className="approval-info-value">
                      {expense.category}
                    </div>
                  </div>

                  <div className="approval-info-item">
                    <div className="approval-info-label">Submitted</div>
                    <div className="approval-info-value">
                      {formatDate(expense.submittedAt)}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {expense.notes && (
                  <div className="approval-notes">
                    <div className="approval-notes-label">Notes</div>
                    <div className="approval-notes-text">{expense.notes}</div>
                  </div>
                )}

                {/* Receipt */}
                <div className="approval-receipt">
                  <div className="approval-notes-label">Receipt</div>
                  {expense.receiptUrl ? (
                    <a
                      href={`http://localhost:8080${expense.receiptUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="approval-receipt-link"
                    >
                      View Receipt ↗
                    </a>
                  ) : (
                    <div className="approval-receipt-missing">
                      ⚠ No receipt uploaded
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="approval-actions">
                  <button
                    className="approval-btn-approve"
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    {approving ? "Approving..." : "✓ Approve"}
                  </button>
                  <button
                    className="approval-btn-reject"
                    onClick={() => {
                      setRejectOpen(true);
                      setReason("");
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              {/* Right — Expense ID + quick info */}
              <div className="approval-side">
                <div className="approval-card">
                  <div className="approval-card-title">Reference</div>
                  <div className="approval-ref-id">
                    #{expense._id?.slice(-12).toUpperCase()}
                  </div>
                  <div className="approval-ref-row">
                    <span>Status</span>
                    <StatusBadge status={expense.status} />
                  </div>
                  <div className="approval-ref-row">
                    <span>Amount</span>
                    <strong>{formatCurrency(expense.amount)}</strong>
                  </div>
                  <div className="approval-ref-row">
                    <span>Category</span>
                    <span>{expense.category}</span>
                  </div>
                  <div className="approval-ref-row">
                    <span>Date</span>
                    <span>{formatDate(expense.submittedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {rejectOpen && (
            <div className="approval-modal-overlay">
              <div className="approval-modal">
                <div className="approval-modal-title">Reject Expense</div>
                <div className="approval-modal-desc">
                  Provide a reason — the employee will see this.
                </div>
                <textarea
                  className="approval-modal-textarea"
                  placeholder="Enter rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="approval-modal-actions">
                  <button
                    className="approval-modal-cancel"
                    onClick={() => {
                      setRejectOpen(false);
                      setReason("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="approval-modal-confirm"
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

export default ApprovalDetail;
