import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getMyExpenses } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format.js";
import "../../styles/dashboard.css";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyExpenses()
      .then((res) => setExpenses(res.data.expenses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total    = expenses.length;
  const pending  = expenses.filter((e) =>
    ["SUBMITTED", "MANAGER_APPROVED", "FINANCE_APPROVED"].includes(e.status)
  ).length;
  const approved = expenses
    .filter((e) => e.status === "FINANCE_APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);
  const paid = expenses
    .filter((e) => e.status === "PAID")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Dashboard" />
        <div className="page-body">

          {/* Stat cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-card-label">Total Expenses</span>
              <div className="stat-card-value">{loading ? "—" : total}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pending Approval</span>
              <div className="stat-card-value">{loading ? "—" : pending}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Finance Approved</span>
              <div className="stat-card-value">{loading ? "—" : formatCurrency(approved)}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Paid</span>
              <div className="stat-card-value">{loading ? "—" : formatCurrency(paid)}</div>
            </div>
          </div>

          {/* Recent expenses table */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">Recent Expenses</h2>
              <button className="table-btn" onClick={() => navigate("/employee/expenses")}>
                View All →
              </button>
            </div>

            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>
                  Loading…
                </div>
              ) : expenses.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">📋</span>
                  No expenses yet.{" "}
                  <button
                    className="table-btn"
                    style={{ marginTop: 12 }}
                    onClick={() => navigate("/employee/submit")}
                  >
                    Submit your first one →
                  </button>
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 8).map((exp) => (
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
                          <button
                            className="table-btn"
                            onClick={() => navigate(`/employee/expenses/${exp._id}`)}
                          >
                            View
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

export default EmployeeDashboard;