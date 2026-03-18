import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getManagerPending, getManagerHistory } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import { useAuth } from "../../AuthContext";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([getManagerPending(), getManagerHistory()])
      .then(([p, h]) => {
        setPending(p.data.expenses || []);
        setHistory(h.data.expenses || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = tab === "pending" ? pending : history;

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Manager Dashboard" />
        <div className="page-body">
          {/* Summary cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-value">{pending.length}</div>
              <div className="stat-card-label">Pending Approvals</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{history.length}</div>
              <div className="stat-card-label">Total Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">
                {formatCurrency(
                  history
                    .filter((e) => e.status === "PAID")
                    .reduce((s, e) => s + e.amount, 0),
                )}
              </div>
              <div className="stat-card-label">Total Team Expenses</div>
            </div>
          </div>

          {/* Tabs + table */}
          <div className="table-card">
            <div className="table-card-header">
              <div className="d-flex gap-3">
                <button
                  onClick={() => setTab("pending")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: tab === "pending" ? 700 : 500,
                    color:
                      tab === "pending"
                        ? "var(--role-color)"
                        : "var(--gray-500)",
                    borderBottom:
                      tab === "pending"
                        ? "2px solid var(--role-color)"
                        : "2px solid transparent",
                    paddingBottom: 4,
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                  }}
                >
                  Pending ({pending.length})
                </button>
                <button
                  onClick={() => setTab("history")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: tab === "history" ? 700 : 500,
                    color:
                      tab === "history"
                        ? "var(--role-color)"
                        : "var(--gray-500)",
                    borderBottom:
                      tab === "history"
                        ? "2px solid var(--role-color)"
                        : "2px solid transparent",
                    paddingBottom: 4,
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                  }}
                >
                  History ({history.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="table-empty">
                {tab === "pending"
                  ? "No pending approvals."
                  : "No history yet."}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    {tab === "pending" && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((exp) => (
                    <tr key={exp._id}>
                      <td>
                        <strong>{exp.employeeId?.name || "Employee"}</strong>
                      </td>
                      <td>{exp.category}</td>
                      <td>
                        <strong>{formatCurrency(exp.amount)}</strong>
                      </td>
                      <td>
                        <StatusBadge status={exp.status} />
                      </td>
                      <td>{formatDate(exp.submittedAt || exp.createdAt)}</td>
                      {tab === "pending" && (
                        <td>
                          <button
                            className="table-btn"
                            onClick={() =>
                              navigate(`/manager/pending?id=${exp._id}`)
                            }
                          >
                            Review
                          </button>
                        </td>
                      )}
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

export default ManagerDashboard;
