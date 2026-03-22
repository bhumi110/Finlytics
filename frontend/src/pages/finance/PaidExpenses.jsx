import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getFinancePaid } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format.js";
import "../../styles/dashboard.css";
import "../../styles/paidexpenses.css";

const PaidExpenses = () => {
  const { user }   = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    getFinancePaid()
      .then((res) => setExpenses(res.data?.expenses || []))
      .catch(() => setError("Failed to load paid expenses."))
      .finally(() => setLoading(false));
  }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Paid Expenses" />
        <div className="page-body">

          {/* Header */}
          <div className="paid-header">
            <div>
              <div className="paid-title">Paid Expenses</div>
              <div className="paid-subtitle">All reimbursed expenses</div>
            </div>
            {expenses.length > 0 && (
              <div className="paid-total">
                Total Reimbursed: <strong>{formatCurrency(total)}</strong>
              </div>
            )}
          </div>

          {error && <div className="paid-error">{error}</div>}

          {/* Table */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">Reimbursement History</h2>
              {!loading && <span className="count-badge green">{expenses.length}</span>}
            </div>
            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>
                  Loading…
                </div>
              ) : expenses.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">💳</span>
                  No paid expenses yet.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Paid Date</th>
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
                            <div className="user-avatar-sm">
                              {(exp.employeeId?.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <div className="paid-emp-name">{exp.employeeId?.name || "Unknown"}</div>
                              {exp.employeeId?.email && (
                                <div className="paid-emp-email">{exp.employeeId.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{exp.category}</td>
                        <td style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", letterSpacing: "-0.2px", fontWeight: 400, color: "var(--text-1)" }}>
                          {formatCurrency(exp.amount)}
                        </td>
                        <td><StatusBadge status={exp.status} /></td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {formatDate(exp.paidAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaidExpenses;