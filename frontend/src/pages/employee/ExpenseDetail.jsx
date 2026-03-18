import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getExpenseById,
  editExpense,
  submitExpense,
  deleteExpense,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/expensedetail.css";
import { useAuth } from "../../AuthContext";


const CATEGORIES = [
  "Travel",
  "Meals",
  "Hotel",
  "Office Supplies",
  "Software",
  "Training",
  "Other",
];

const STEPS = [
  { key: "DRAFT", label: "Created as Draft" },
  { key: "SUBMITTED", label: "Submitted for Approval" },
  { key: "MANAGER_APPROVED", label: "Manager Approved" },
  { key: "FINANCE_APPROVED", label: "Finance Approved" },
  { key: "PAID", label: "Reimbursed / Paid" },
];

const STATUS_ORDER = [
  "DRAFT",
  "SUBMITTED",
  "MANAGER_APPROVED",
  "FINANCE_APPROVED",
  "PAID",
];

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {user}=useAuth()
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => {
    setLoading(true);
    getExpenseById(id)
      .then((res) => {
        const exp = res.data.expense;
        setExpense(exp);
        setEditForm({
          amount: exp.amount,
          category: exp.category,
          notes: exp.notes || "",
        });
      })
      .catch(() => setMsg({ type: "error", text: "Expense not found." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await editExpense(id, {
        amount: Number(editForm.amount),
        category: editForm.category,
        notes: editForm.notes,
      });
      setEditing(false);
      setMsg({ type: "success", text: "Draft updated." });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitExpense(id);
      setMsg({ type: "success", text: "Expense submitted for approval." });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Submit failed.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(id);
      navigate("/employee/expenses");
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Delete failed.",
      });
    }
  };

  const getStepState = (stepKey) => {
    if (expense?.status === "REJECTED") {
      const stepIdx = STATUS_ORDER.indexOf(stepKey);
      const statusIdx = STATUS_ORDER.indexOf(expense.status);
      return stepIdx < statusIdx ? "done" : "pending";
    }
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    const statusIdx = STATUS_ORDER.indexOf(expense?.status);
    if (stepIdx < statusIdx) return "done";
    if (stepIdx === statusIdx) return "active";
    return "pending";
  };

  if (loading)
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="page-content">
          <Topbar title="Expense Detail" />
          <div className="page-body">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Expense Detail" />
        <div className="page-body">
          {/* Header */}
          <div className="detail-header">
            <button
              className="detail-back"
              onClick={() => navigate("/employee/expenses")}
            >
              ← Back
            </button>
            <div className="detail-title">Expense Detail</div>
            {expense && <StatusBadge status={expense.status} />}
          </div>

          {/* Message */}
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

          <div className="detail-grid">
            {/* Main info card */}
            <div className="detail-card">
              <div className="detail-card-title">
                Expense Information
                {expense?.status === "DRAFT" && !editing && (
                  <button
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "1px solid var(--gray-300)",
                      borderRadius: 5,
                      padding: "3px 10px",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                // Edit mode
                <div>
                  <label
                    style={{
                      fontSize: "0.825rem",
                      fontWeight: 600,
                      color: "var(--gray-700)",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Amount
                  </label>
                  <input
                    className="detail-edit-input"
                    type="number"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, amount: e.target.value }))
                    }
                  />

                  <label
                    style={{
                      fontSize: "0.825rem",
                      fontWeight: 600,
                      color: "var(--gray-700)",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Category
                  </label>
                  <select
                    className="detail-edit-select"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      fontSize: "0.825rem",
                      fontWeight: 600,
                      color: "var(--gray-700)",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    className="detail-edit-textarea"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, notes: e.target.value }))
                    }
                  />

                  <div className="d-flex gap-2">
                    <button
                      style={{
                        background: "none",
                        border: "1px solid var(--gray-300)",
                        borderRadius: 6,
                        padding: "7px 14px",
                        fontSize: "0.855rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-submit-expense"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="detail-row">
                    <div>
                      <div className="detail-item-label">Amount</div>
                      <div className="detail-item-value">
                        {formatCurrency(expense?.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="detail-item-label">Category</div>
                      <div className="detail-item-value">
                        {expense?.category}
                      </div>
                    </div>
                    <div>
                      <div className="detail-item-label">Manager</div>{" "}
                      <div className="detail-item-value">
                        {expense?.managerId?.name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="detail-item-label">Submitted</div>
                      <div className="detail-item-value">
                        {formatDate(expense?.submittedAt)}
                      </div>
                    </div>
                  </div>

                  {expense?.notes && (
                    <div className="detail-notes">
                      <strong>Notes:</strong> {expense.notes}
                    </div>
                  )}

                  {expense?.rejectionReason && (
                    <div className="detail-rejection">
                      <div className="detail-rejection-label">
                        Rejection Reason
                      </div>
                      <div className="detail-rejection-text">
                        {expense.rejectionReason}
                      </div>
                    </div>
                  )}
                  {/* Rejection reason — show when rejected */}
                  {expense?.status === "REJECTED" &&
                    expense?.rejectionReason && (
                      <div
                        style={{
                          background: "#fdecea",
                          border: "1px solid rgba(190,29,44,0.15)",
                          borderRadius: 6,
                          padding: "12px 14px",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "#be1d2c",
                            marginBottom: 4,
                          }}
                        >
                          Rejection Reason
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#be1d2c" }}>
                          {expense.rejectionReason}
                        </div>
                      </div>
                    )}

                  {/* Notes */}
                  {expense?.notes && (
                    <div className="detail-notes">
                      <strong>Notes:</strong> {expense.notes}
                    </div>
                  )}

                  {/* Draft actions */}
                  {expense?.status === "DRAFT" && (
                    <div className="detail-actions">
                      <button
                        className="btn-submit-expense"
                        onClick={handleSubmit}
                      >
                        Submit for Approval
                      </button>
                      <button
                        className="btn-delete-expense"
                        onClick={() => setConfirmDelete(true)}
                      >
                        Delete Draft
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline card */}
            <div className="timeline-card">
              <div className="timeline-card-title">Status Timeline</div>

              {STEPS.map((step, i) => {
                const state = getStepState(step.key);
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={step.key} className="timeline-step">
                    <div className="timeline-dot-wrap">
                      <div className={`timeline-dot ${state}`}>
                        {state === "done" ? "✓" : i + 1}
                      </div>
                      {!isLast && (
                        <div
                          className={`timeline-line ${state === "done" ? "done" : "pending"}`}
                        />
                      )}
                    </div>
                    <div className={`timeline-step-label ${state}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}

              {expense?.status === "REJECTED" && (
                <div
                  style={{
                    background: "#fdecea",
                    borderRadius: 6,
                    padding: "8px 12px",
                    marginTop: 8,
                    fontSize: "0.8rem",
                    color: "var(--danger)",
                    fontWeight: 600,
                  }}
                >
                  ✕ Rejected
                </div>
              )}
            </div>
          </div>

          {/* Delete confirm */}
          {confirmDelete && (
            <div
              className="modal-overlay"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 28,
                  maxWidth: 360,
                  width: "100%",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Delete this draft?
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--gray-500)",
                    marginBottom: 20,
                  }}
                >
                  This cannot be undone.
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    style={{
                      background: "none",
                      border: "1px solid var(--gray-300)",
                      borderRadius: 6,
                      padding: "7px 16px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={{
                      background: "var(--danger)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "7px 16px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                    onClick={handleDelete}
                  >
                    Delete
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

export default ExpenseDetail;
