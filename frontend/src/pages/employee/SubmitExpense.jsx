import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import {createExpense, submitExpense } from "../../api/api";
import "../../styles/submitexpense.css";

const CATEGORIES = ["Travel", "Meals", "Hotel", "Office Supplies", "Software", "Training", "Other"];

const SubmitExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ amount: "", category: "", notes: "" });
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
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Amount must be greater than 0.";
    if (Number(form.amount) > 100000)             errs.amount = "Amount cannot exceed ₹1,00,000.";
    if (!form.category)                           errs.category = "Category is required.";
    if (requireReceipt && !receipt)               errs.receipt = "Receipt is required to submit.";
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

    const res = await createExpense(formData);   // ← use createExpense
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

    await createExpense(formData);   // ← use createExpense
    navigate("/employee/expenses");
  } catch (err) {
    setApiError(err.response?.data?.message || "Failed to save draft.");
  } finally {
    setLoading(false);
  }
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

            {/* Amount */}
            <div className="submit-field">
              <label className="submit-label">Amount <span>*</span></label>
              <input className="submit-input" name="amount" type="number"
                placeholder="0" value={form.amount} onChange={handleChange} />
              {errors.amount && <div className="submit-field-error">{errors.amount}</div>}
            </div>

            {/* Category */}
            <div className="submit-field">
              <label className="submit-label">Category <span>*</span></label>
              <select className="submit-select" name="category"
                value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className="submit-field-error">{errors.category}</div>}
            </div>

            {/* Notes */}
            <div className="submit-field">
              <label className="submit-label">Notes <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
              <textarea className="submit-textarea" name="notes"
                placeholder="Purpose, trip details, etc."
                value={form.notes} onChange={handleChange} />
            </div>

            {/* Receipt */}
            <div className="submit-field">
              <label className="submit-label">Receipt <span>*</span> <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(required to submit)</span></label>
              <div
                className={`submit-receipt ${receipt ? "uploaded" : ""}`}
                onClick={() => document.getElementById("receipt-file").click()}
              >
                {receipt ? (
                  <div className="submit-receipt-ok">✓ {receipt.name}</div>
                ) : (
                  <>
                    <div className="submit-receipt-text">Click to upload receipt</div>
                    <div className="submit-receipt-hint">PDF, JPG, PNG</div>
                  </>
                )}
              </div>
              <input id="receipt-file" type="file" accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }} onChange={(e) => setReceipt(e.target.files[0])} />
              {errors.receipt && <div className="submit-field-error">{errors.receipt}</div>}
            </div>

            {/* Action buttons */}
            <div className="submit-actions">
              <button className="submit-btn-draft" onClick={handleDraft} disabled={loading}>
                Save as Draft
              </button>
              <button className="submit-btn-submit " onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitExpense;