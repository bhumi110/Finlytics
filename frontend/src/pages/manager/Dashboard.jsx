import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getManagerPending, getManagerHistory } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format.js";
import "../../styles/dashboard.css";

const ManagerDashboard = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("pending");

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

  const totalPaid = history
    .filter((e) => e.status === "PAID")
    .reduce((s, e) => s + e.amount, 0);

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Manager Dashboard" />
        <div className="page-body">

          {/* Stat cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-card-label">Pending Approvals</span>
              <div className="stat-card-value">{loading ? "—" : pending.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Reviewed</span>
              <div className="stat-card-value">{loading ? "—" : history.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Team Expenses</span>
              <div className="stat-card-value">{loading ? "—" : formatCurrency(totalPaid)}</div>
            </div>
          </div>

          {/* Tabbed table */}
          <div className="table-card">
            {/* Tab bar */}
            <div className="tab-bar">
              <button
                className={`tab-btn${tab === "pending" ? " active" : ""}`}
                onClick={() => setTab("pending")}
              >
                Pending
                {!loading && (
                  <span className="count-badge amber" style={{ marginLeft: 7 }}>
                    {pending.length}
                  </span>
                )}
              </button>
              <button
                className={`tab-btn${tab === "history" ? " active" : ""}`}
                onClick={() => setTab("history")}
              >
                History
                {!loading && (
                  <span className="count-badge blue" style={{ marginLeft: 7 }}>
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>Loading…
                </div>
              ) : rows.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">{tab === "pending" ? "✅" : "📋"}</span>
                  {tab === "pending" ? "No pending approvals." : "No history yet."}
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
                          <div className="user-cell">
                            <div className="user-avatar-sm">
                              {getInitials(exp.employeeId?.name)}
                            </div>
                            <div>
                              <div className="user-name">
                                {exp.employeeId?.name || "Employee"}
                              </div>
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
                        <td><StatusBadge status={exp.status} /></td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {formatDate(exp.submittedAt || exp.createdAt)}
                        </td>
                        {tab === "pending" && (
                          <td>
                            <button
                              className="table-btn"
                              onClick={() => navigate(`/manager/pending/${exp._id}`)}
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
    </div>
  );
};

export default ManagerDashboard;