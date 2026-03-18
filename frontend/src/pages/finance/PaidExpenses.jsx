import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getFinancePaid } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/paidexpenses.css";

const PaidExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="table-empty">No paid expenses yet.</div>
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
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        {exp._id?.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <strong>{exp.employeeId?.name || "Unknown"}</strong>
                        {exp.employeeId?.email && (
                          <div
                            style={{ fontSize: "0.75rem", color: "#64748b" }}
                          >
                            {exp.employeeId.email}
                          </div>
                        )}
                      </td>
                      <td>{exp.category}</td>
                      <td>
                        <strong>{formatCurrency(exp.amount)}</strong>
                      </td>
                      <td>
                        <StatusBadge status={exp.status} />
                      </td>
                      <td>{formatDate(exp.paidAt)}</td>
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

export default PaidExpenses;
