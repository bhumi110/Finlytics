import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import { getAllUsers } from "../../api/api";
import { useAuth } from "../../AuthContext"; 
import "../../styles/dashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (role) => users.filter((u) => u.role === role).length;

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Admin Dashboard" />
        <div className="page-body">

          {/* User count cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-value">{loading ? "—" : users.length}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{loading ? "—" : count("EMPLOYEE")}</div>
              <div className="stat-card-label">Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{loading ? "—" : count("MANAGER")}</div>
              <div className="stat-card-label">Managers</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{loading ? "—" : count("FINANCE")}</div>
              <div className="stat-card-label">Finance</div>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="table-card" style={{ padding: 24 }}>
                <h6 style={{ fontWeight: 700, marginBottom: 8 }}>User Management</h6>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: 16 }}>
                  Assign roles and link employees to managers
                </p>
                <button className="table-btn" onClick={() => navigate("/admin/users")}>
                  Manage Users →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;