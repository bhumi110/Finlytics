import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import { createExpense, submitExpense } from "../../api/api";
import "../../styles/submitexpense.css";

const CATEGORIES = [
  "Travel", "Meals", "Hotel", "Office Supplies",
  "Software", "Training", "Other",
];

const SubmitExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm]         = useState({ amount: "", category: "", notes: "" });
  const [receipt, setReceipt]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = (requireReceipt) => {
    const errs = {};
    if (!form.amount || Number(form.amount) <= 0)
      errs.amount = "Amount must be greater than 0.";
    if (Number(form.amount) > 100000)
      errs.amount = "Amount cannot exceed ₹1,00,000.";
    if (!form.category)
      errs.category = "Category is required.";
    if (requireReceipt && !receipt)
      errs.receipt = "Receipt is required to submit.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate(true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount",   form.amount);
      formData.append("category", form.category);
      formData.append("notes",    form.notes);
      if (receipt) formData.append("receipt", receipt);
      const res = await createExpense(formData);
      await submitExpense(res.data.expense._id);
      navigate("/employee/expenses");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    const errs = validate(false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount",   form.amount);
      formData.append("category", form.category);
      formData.append("notes",    form.notes);
      if (receipt) formData.append("receipt", receipt);
      await createExpense(formData);
      navigate("/employee/expenses");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) { setReceipt(file); setErrors((p) => ({ ...p, receipt: "" })); }
  };

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Submit Expense" />
        <div className="page-body">

          <div className="submit-header">
            <div className="submit-title">Submit Expense</div>
            <div className="submit-subtitle">Fill in details and save as draft or submit for approval</div>
          </div>

          {apiError && <div className="submit-error">{apiError}</div>}

          <div className="submit-card">
            <div className="submit-card-title">
              📄 Expense Details
            </div>

            {/* Amount */}
            <div className="submit-field">
              <label className="submit-label">
                Amount <span className="req">*</span>
              </label>
              <input
                className="submit-input"
                name="amount"
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
              {errors.amount && (
                <span className="submit-field-error">{errors.amount}</span>
              )}
            </div>

            {/* Category */}
            <div className="submit-field">
              <label className="submit-label">
                Category <span className="req">*</span>
              </label>
              <select
                className="submit-select"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <span className="submit-field-error">{errors.category}</span>
              )}
            </div>

            {/* Notes */}
            <div className="submit-field">
              <label className="submit-label">
                Notes <span className="opt">(optional)</span>
              </label>
              <textarea
                className="submit-textarea"
                name="notes"
                placeholder="Purpose, trip details, etc."
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {/* Receipt upload */}
            <div className="submit-field">
              <label className="submit-label">
                Receipt <span className="req">*</span>
                <span className="opt">(required to submit)</span>
              </label>
              <div
                className={`submit-receipt ${receipt ? "uploaded" : ""}`}
                onClick={() => document.getElementById("receipt-file").click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
                onDrop={(e) => { e.currentTarget.classList.remove("drag-over"); handleFileDrop(e); }}
              >
                {receipt ? (
                  <>
                    <div className="submit-receipt-ok">{receipt.name}</div>
                    <div className="submit-receipt-size">
                      {(receipt.size / 1024).toFixed(1)} KB · Click to replace
                    </div>
                  </>
                ) : (
                  <>
                    <span className="submit-receipt-icon">📎</span>
                    <div className="submit-receipt-text">Click or drag to upload receipt</div>
                    <div className="submit-receipt-hint">PDF, JPG, PNG — max 5MB</div>
                  </>
                )}
              </div>
              <input
                id="receipt-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                  setReceipt(e.target.files[0]);
                  setErrors((p) => ({ ...p, receipt: "" }));
                }}
              />
              {errors.receipt && (
                <span className="submit-field-error">{errors.receipt}</span>
              )}
            </div>

            {/* Actions */}
            <div className="submit-actions">
              <button
                className="submit-btn-draft"
                onClick={handleDraft}
                disabled={loading}
              >
                Save as Draft
              </button>
              <button
                className="submit-btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit for Approval →"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitExpense;