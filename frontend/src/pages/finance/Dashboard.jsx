import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar     from "../../components/Sidebar";
import Topbar      from "../../components/Topbar";
import StatusBadge from "../../components/StatusBadge";
import { getFinancePending, getFinancePaid } from "../../api/api";
import { formatCurrency, formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import { useAuth } from "../../AuthContext"; 


const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [paid, setPaid]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();


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

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Finance Dashboard" />
        <div className="page-body">

          {/* Summary cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-value">{pending.length}</div>
              <div className="stat-card-label">Pending Approval</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{formatCurrency(totalPending)}</div>
              <div className="stat-card-label">Pending Amount</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{formatCurrency(totalPaid)}</div>
              <div className="stat-card-label">Total Reimbursed</div>
            </div>
          </div>

          {/* Pending table preview */}
          <div className="table-card">
            <div className="table-card-header">
              <h6 className="table-card-title">Pending Finance Approval ({pending.length})</h6>
              <button className="table-btn" onClick={() => navigate("/finance/pending")}>
                View All
              </button>
            </div>

            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="table-empty">No pending expenses.</div>
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
                      <td><strong>{exp.employeeId?.name || "Employee"}</strong></td>
                      <td>{exp.category}</td>
                      <td><strong>{formatCurrency(exp.amount)}</strong></td>
                      <td>{formatDate(exp.submittedAt)}</td>
                      <td>
                        <button className="table-btn"
                          onClick={() => navigate("/finance/pending")}>
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
  );
};

export default FinanceDashboard;