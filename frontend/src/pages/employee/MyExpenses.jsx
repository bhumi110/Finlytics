import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getMyExpenses, deleteExpense } from "../../api/api";
import { formatCurrency, formatDate }   from "../../utils/format.js";
import "../../styles/dashboard.css";
import "../../styles/myexpenses.css";

const MyExpenses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);

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
            <button className="btn-new-expense" onClick={() => navigate("/employee/submit")}>
              + New Expense
            </button>
          </div>

          {/* Filter */}
          <div className="myexpenses-filter">
            <select
              className="myexpenses-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
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
            <div className="table-card-header">
              <h2 className="table-card-title">Expense History</h2>
              {!loading && <span className="count-badge blue">{filtered.length}</span>}
            </div>
            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">📋</span>
                  No expenses found.
                </div>
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
                        <td>
                          <span className="mono-id">{exp._id?.slice(-8).toUpperCase()}</span>
                        </td>
                        <td>{exp.category}</td>
                        <td style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", letterSpacing: "-0.2px", fontWeight: 400, color: "var(--text-1)" }}>
                          {formatCurrency(exp.amount)}
                        </td>
                        <td><StatusBadge status={exp.status} /></td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {formatDate(exp.submittedAt || exp.createdAt)}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="table-btn"
                              onClick={() => navigate(`/employee/expenses/${exp._id}`)}
                            >
                              View
                            </button>
                            {exp.status === "DRAFT" && (
                              <button
                                className="btn-danger"
                                onClick={() => setDeleteId(exp._id)}
                              >
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
          </div>

          {/* Delete modal */}
          {deleteId && (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
            >
              <div className="modal-box">
                <div className="modal-icon">🗑</div>
                <div className="modal-title">Delete Draft?</div>
                <div className="modal-desc">
                  This expense will be permanently deleted and cannot be undone.
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setDeleteId(null)}>
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

export default MyExpenses;