import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getMyExpenses, deleteExpense } from "../../api/api";
import { formatCurrency, formatDate }   from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/myexpenses.css";
import { useAuth } from "../../AuthContext";


const MyExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("ALL");
  const [deleteId, setDeleteId]   = useState(null);
  const {user}=useAuth()
  const load = () => {
    setLoading(true);
    getMyExpenses()
      .then((res) => {
        const data = res.data.expenses || [];
        setExpenses(data);
        setFiltered(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setFiltered(
      filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter)
    );
  }, [filter, expenses]);

  const handleDelete = async () => {
    try {
      await deleteExpense(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="My Expenses" />
        <div className="page-body">

          {/* Header */}
          <div className="myexpenses-header">
            <div>
              <div className="myexpenses-title">My Expenses</div>
              <div className="myexpenses-subtitle">All your draft and submitted expenses</div>
            </div>
            <button className="btn-primary" onClick={() => navigate("/employee/submit")}>
              + New Expense
            </button>
          </div>

          {/* Status filter */}
          <div className="myexpenses-filter mb-3">
            <select className="myexpenses-select"
              value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="MANAGER_APPROVED">Manager Approved</option>
              <option value="FINANCE_APPROVED">Finance Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-card">
            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="table-empty">No expenses found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp) => (
                    <tr key={exp._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--gray-500)" }}>
                        {exp._id?.slice(-8).toUpperCase()}
                      </td>
                      <td>{exp.category}</td>
                      <td><strong>{formatCurrency(exp.amount)}</strong></td>
                      <td><StatusBadge status={exp.status} /></td>
                      <td>{formatDate(exp.submittedAt || exp.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="table-btn"
                            onClick={() => navigate(`/employee/expenses/${exp._id}`)}>
                            View
                          </button>
                          {exp.status === "DRAFT" && (
                            <button className="btn-danger"
                              onClick={() => setDeleteId(exp._id)}>
                              Delete
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

          {/* Delete confirm modal */}
          {deleteId && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-title">Delete Draft?</div>
                <div className="modal-desc">This cannot be undone.</div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                  <button className="btn-confirm-delete" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyExpenses;