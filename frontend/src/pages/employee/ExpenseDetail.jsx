import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import {
  getExpenseById,
  editExpense,
  submitExpense,
  deleteExpense,
} from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/expensedetail.css";

const CATEGORIES = [
  "Travel", "Meals", "Hotel", "Office Supplies",
  "Software", "Training", "Other",
];

const STEPS = [
  { key: "DRAFT",            label: "Created as Draft" },
  { key: "SUBMITTED",        label: "Submitted for Approval" },
  { key: "MANAGER_APPROVED", label: "Manager Approved" },
  { key: "FINANCE_APPROVED", label: "Finance Approved" },
  { key: "PAID",             label: "Reimbursed / Paid" },
];

const STATUS_ORDER = [
  "DRAFT", "SUBMITTED", "MANAGER_APPROVED", "FINANCE_APPROVED", "PAID",
];

const ExpenseDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expense, setExpense]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [editForm, setEditForm]         = useState({ amount: "", category: "", notes: "" });
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState({ type: "", text: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const showMsg = (type, text) => setMsg({ type, text });

  const load = () => {
    setLoading(true);
    getExpenseById(id)
      .then((res) => {
        const exp = res.data.expense;
        setExpense(exp);
        setEditForm({ amount: exp.amount, category: exp.category, notes: exp.notes || "" });
      })
      .catch(() => showMsg("error", "Expense not found."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await editExpense(id, {
        amount:   Number(editForm.amount),
        category: editForm.category,
        notes:    editForm.notes,
      });
      setEditing(false);
      showMsg("success", "Draft updated.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitExpense(id);
      showMsg("success", "Expense submitted for approval.");
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Submit failed.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(id);
      navigate("/employee/expenses");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Delete failed.");
      setConfirmDelete(false);
    }
  };

  const getStepState = (stepKey) => {
    if (expense?.status === "REJECTED") {
      return STATUS_ORDER.indexOf(stepKey) < STATUS_ORDER.indexOf("SUBMITTED") ? "done" : "pending";
    }
    const stepIdx   = STATUS_ORDER.indexOf(stepKey);
    const statusIdx = STATUS_ORDER.indexOf(expense?.status);
    if (stepIdx < statusIdx)  return "done";
    if (stepIdx === statusIdx) return "active";
    return "pending";
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="page-content">
          <Topbar title="Expense Detail" />
          <div className="page-body">
            <div className="approval-msg" style={{ borderLeft: "3px solid var(--border)" }}>
              Loading…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Expense Detail" />
        <div className="page-body">

          {/* Header */}
          <div className="detail-header">
            <button className="detail-back" onClick={() => navigate("/employee/expenses")}>
              ← Back
            </button>
            <div className="detail-title">Expense Detail</div>
            {expense && <StatusBadge status={expense.status} />}
          </div>

          {/* Message */}
          {msg.text && (
            <div className={`approval-msg ${msg.type}`}>{msg.text}</div>
          )}

          <div className="detail-grid">

            {/* ── Main info card ── */}
            <div className="detail-card">
              <div className="detail-card-title">
                Expense Information
                {expense?.status === "DRAFT" && !editing && (
                  <button className="table-btn" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                /* Edit mode */
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="detail-item-label" style={{ marginBottom: 7, display: "block" }}>Amount</label>
                    <input
                      className="detail-edit-input"
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="detail-item-label" style={{ marginBottom: 7, display: "block" }}>Category</label>
                    <select
                      className="detail-edit-select"
                      value={editForm.category}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="detail-item-label" style={{ marginBottom: 7, display: "block" }}>Notes</label>
                    <textarea
                      className="detail-edit-textarea"
                      value={editForm.notes}
                      onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional notes…"
                    />
                  </div>

                  <div className="detail-actions">
                    <button className="btn-delete-expense" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button className="btn-submit-expense" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div>
                  <div className="detail-row">
                    <div>
                      <div className="detail-item-label">Amount</div>
                      <div className="detail-amount">{formatCurrency(expense?.amount)}</div>
                    </div>
                    <div>
                      <div className="detail-item-label">Category</div>
                      <div className="detail-item-value">{expense?.category}</div>
                    </div>
                    <div>
                      <div className="detail-item-label">Manager</div>
                      <div className="detail-item-value">{expense?.managerId?.name || "—"}</div>
                    </div>
                    <div>
                      <div className="detail-item-label">Submitted</div>
                      <div className="detail-item-value">{formatDate(expense?.submittedAt)}</div>
                    </div>
                  </div>

                  {expense?.notes && (
                    <div className="detail-notes">{expense.notes}</div>
                  )}

                  {expense?.rejectionReason && (
                    <div className="detail-rejection">
                      <div className="detail-rejection-icon">✕</div>
                      <div>
                        <div className="detail-rejection-label">Rejection Reason</div>
                        <div className="detail-rejection-text">{expense.rejectionReason}</div>
                      </div>
                    </div>
                  )}

                  {expense?.status === "DRAFT" && (
                    <div className="detail-actions">
                      <button className="btn-submit-expense" onClick={handleSubmit}>
                        Submit for Approval →
                      </button>
                      <button className="btn-delete-expense" onClick={() => setConfirmDelete(true)}>
                        Delete Draft
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Timeline sidebar ── */}
            <div className="timeline-card">
              <div className="timeline-card-title">Status Timeline</div>

              {STEPS.map((step, i) => {
                const state  = getStepState(step.key);
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={step.key} className="timeline-step">
                    <div className="timeline-dot-wrap">
                      <div className={`timeline-dot ${state}`}>
                        {state === "done" ? "✓" : i + 1}
                      </div>
                      {!isLast && (
                        <div className={`timeline-line ${state === "done" ? "done" : "pending"}`} />
                      )}
                    </div>
                    <div className={`timeline-step-label ${state}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}

              {expense?.status === "REJECTED" && (
                <div className="detail-rejection" style={{ marginTop: 12 }}>
                  <div className="detail-rejection-icon">✕</div>
                  <div>
                    <div className="detail-rejection-label">Rejected</div>
                    {expense.rejectionReason && (
                      <div className="detail-rejection-text">{expense.rejectionReason}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Delete confirm modal — uses myexpenses.css modal-box classes */}
          {confirmDelete && (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
            >
              <div className="modal-box">
                <div className="modal-icon">🗑</div>
                <div className="modal-title">Delete this draft?</div>
                <div className="modal-desc">
                  This expense will be permanently deleted and cannot be recovered.
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                  <button className="btn-confirm-delete" onClick={handleDelete}>
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