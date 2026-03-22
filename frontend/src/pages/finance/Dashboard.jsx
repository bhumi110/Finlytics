import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getFinancePending, getFinancePaid } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format.js";
import "../../styles/dashboard.css";

const FinanceDashboard = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [pending, setPending] = useState([]);
  const [paid, setPaid]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFinancePending(), getFinancePaid()])
      .then(([p, pd]) => {
        setPending(p.data.expenses || []);
        setPaid(pd.data.expenses || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPending = pending.reduce((s, e) => s + e.amount, 0);
  const totalPaid    = paid.reduce((s, e) => s + e.amount, 0);

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Finance Dashboard" />
        <div className="page-body">

          {/* Stat cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-card-label">Pending Approval</span>
              <div className="stat-card-value">{loading ? "—" : pending.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pending Amount</span>
              <div className="stat-card-value">{loading ? "—" : formatCurrency(totalPending)}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Reimbursed</span>
              <div className="stat-card-value">{loading ? "—" : formatCurrency(totalPaid)}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Paid Expenses</span>
              <div className="stat-card-value">{loading ? "—" : paid.length}</div>
            </div>
          </div>

          {/* Pending table preview */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">Pending Finance Approval</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!loading && <span className="count-badge amber">{pending.length}</span>}
                <button className="table-btn" onClick={() => navigate("/finance/pending")}>
                  View All →
                </button>
              </div>
            </div>

            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>Loading…
                </div>
              ) : pending.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">✅</span>
                  No pending expenses.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.slice(0, 6).map((exp) => (
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
                        <td style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", letterSpacing: "-0.2px", fontWeight: 400, color: "var(--text-1)" }}>
                          {formatCurrency(exp.amount)}
                        </td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {formatDate(exp.submittedAt)}
                        </td>
                        <td>
                          <button className="table-btn" onClick={() => navigate("/finance/pending")}>
                            Review
                          </button>
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

export default FinanceDashboard;