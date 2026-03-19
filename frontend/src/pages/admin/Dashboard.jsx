import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import { getAllUsers } from "../../api/api";
import "../../styles/dashboard.css";

const AdminDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (role) => users.filter((u) => u.role === role).length;

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className={`app-layout${user?.role ? ` role-${user.role}` : ""}`}>
      <Sidebar />
      <div className="page-content">
        <Topbar title="Admin Dashboard" />
        <div className="page-body">

          {/* Stat cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-card-label">Total Users</span>
              <div className="stat-card-value">{loading ? "—" : users.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Employees</span>
              <div className="stat-card-value">{loading ? "—" : count("EMPLOYEE")}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Managers</span>
              <div className="stat-card-value">{loading ? "—" : count("MANAGER")}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Finance</span>
              <div className="stat-card-value">{loading ? "—" : count("FINANCE")}</div>
            </div>
          </div>

          {/* Quick action + user preview side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>

            {/* User Management quick action */}
            <div className="table-card" style={{ marginBottom: 0 }}>
              <div className="table-card-header">
                <h2 className="table-card-title">User Management</h2>
              </div>
              <div style={{ padding: "22px 22px 24px" }}>
                <p style={{ fontSize: "0.845rem", color: "var(--text-3)", marginBottom: 20, lineHeight: 1.7, fontFamily: "'Syne', sans-serif" }}>
                  Assign roles and link employees to their managers across your organisation.
                </p>
                <button className="btn-primary" onClick={() => navigate("/admin/users")}>
                  Manage Users →
                </button>
              </div>
            </div>

            {/* Role breakdown */}
            <div className="table-card" style={{ marginBottom: 0 }}>
              <div className="table-card-header">
                <h2 className="table-card-title">Role Breakdown</h2>
              </div>
              <div style={{ padding: "14px 0 6px" }}>
                {[
                  { role: "EMPLOYEE", label: "Employees",   cls: "EMPLOYEE" },
                  { role: "MANAGER",  label: "Managers",    cls: "MANAGER"  },
                  { role: "FINANCE",  label: "Finance",     cls: "FINANCE"  },
                  { role: "ADMIN",    label: "Admins",      cls: "ADMIN"    },
                ].map(({ role, label, cls }) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 22px", borderBottom: "1px solid var(--border-soft)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`role-chip ${cls}`}>{label}</span>
                    </div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "var(--text-1)", letterSpacing: "-0.2px" }}>
                      {loading ? "—" : count(role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent users table */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">Recent Users</h2>
              <button className="table-btn" onClick={() => navigate("/admin/users")}>
                View All →
              </button>
            </div>
            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>Loading…
                </div>
              ) : users.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">👥</span>No users found.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 6).map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">{getInitials(u.name)}</div>
                            <div>
                              <div className="user-name">{u.name}</div>
                              <div className="user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`role-chip ${u.role}`}>{u.role}</span></td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

export default AdminDashboard;