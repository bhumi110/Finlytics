import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../AuthContext";

import StatusBadge from "../../components/StatusBadge";
import { getMyExpenses } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getMyExpenses()
      .then((res) => setExpenses(res.data.expenses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = expenses.length;

  const pending = expenses.filter((e) =>
    ["SUBMITTED", "MANAGER_APPROVED", "FINANCE_APPROVED"].includes(e.status),
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
          {/* Summary cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-value">{total}</div>
              <div className="stat-card-label">Total Expenses</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{pending}</div>
              <div className="stat-card-label">Pending Approval</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{formatCurrency(approved)}</div>
              <div className="stat-card-label">Finance Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{formatCurrency(paid)}</div>
              <div className="stat-card-label">Total Paid</div>
            </div>
          </div>

          {/* Recent expenses table */}
          <div className="table-card">
            <div className="table-card-header">
              <h6 className="table-card-title">Recent Expenses</h6>
              <button
                className="table-btn"
                onClick={() => navigate("/employee/expenses")}
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="table-empty">
                No expenses yet.{" "}
                <span
                  style={{ color: "var(--primary)", cursor: "pointer" }}
                  onClick={() => navigate("/employee/submit")}
                >
                  Submit your first one →
                </span>
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
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          color: "var(--gray-500)",
                        }}
                      >
                        {exp._id?.slice(-8).toUpperCase()}
                      </td>
                      <td>{exp.category}</td>
                      <td>
                        <strong>{formatCurrency(exp.amount)}</strong>
                      </td>
                      <td>
                        <StatusBadge status={exp.status} />
                      </td>
                      <td>{formatDate(exp.submittedAt || exp.createdAt)}</td>
                      <td>
                        <button
                          className="table-btn"
                          onClick={() =>
                            navigate(`/employee/expenses/${exp._id}`)
                          }
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
  );
};

export default EmployeeDashboard;
