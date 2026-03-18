import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import { getAllUsers, updateRole, assignManager } from "../../api/api";
import { formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/usermanagement.css";

const ROLES = ["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"];

const UserManagement = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState({ type: "", text: "" });

  // Role modal
  const [roleModal, setRoleModal] = useState(null); // { user }
  const [newRole, setNewRole]     = useState("");
  const [roleSaving, setRoleSaving] = useState(false);

  // Manager modal
  const [mgrModal, setMgrModal] = useState(null); // { user }
  const [newMgr, setNewMgr]     = useState("");
  const [mgrSaving, setMgrSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const managers = users.filter((u) => u.role === "MANAGER");

  const handleRoleSave = async () => {
    if (!newRole || newRole === roleModal.user.role) return;
    setRoleSaving(true);
    try {
      await updateRole(roleModal.user._id, newRole);
      setMsg({ type: "success", text: "Role updated." });
      setRoleModal(null);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setRoleSaving(false);
    }
  };

  const handleMgrSave = async () => {
    if (!newMgr) return;
    setMgrSaving(true);
    try {
      await assignManager(mgrModal.user._id, newMgr);
      setMsg({ type: "success", text: "Manager assigned." });
      setMgrModal(null);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Assignment failed." });
    } finally {
      setMgrSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-content">
        <Topbar title="User Management" />
        <div className="page-body">

          <div className="users-header">
            <div className="users-title">User Management</div>
            <div className="users-subtitle">Update roles and assign managers to employees</div>
          </div>

          {msg.text && (
            <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
              {msg.text}
            </div>
          )}

          <div className="table-card">
            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Manager</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const mgr = users.find((u) => u._id === user.managerId);
                    return (
                      <tr key={user._id}>
                        <td><strong>{user.name}</strong></td>
                        <td style={{ color: "var(--gray-500)" }}>{user.email}</td>
                        <td>
                          <span className={`role-chip ${user.role}`}>{user.role}</span>
                        </td>
                        <td style={{ color: "var(--gray-500)" }}>
                          {mgr?.name || (user.role === "EMPLOYEE" ? "—" : "N/A")}
                        </td>
                        <td style={{ color: "var(--gray-500)" }}>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="table-btn"
                              onClick={() => { setRoleModal({ user }); setNewRole(user.role); }}>
                              Change Role
                            </button>
                            {user.role === "EMPLOYEE" && (
                              <button className="table-btn"
                                onClick={() => { setMgrModal({ user }); setNewMgr(""); }}>
                                Assign Manager
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Change Role Modal */}
          {roleModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-title">Change Role — {roleModal.user.name}</div>
                <label className="modal-label">New Role</label>
                <select className="modal-select" value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setRoleModal(null)}>Cancel</button>
                  <button className="btn-save"
                    onClick={handleRoleSave}
                    disabled={roleSaving || newRole === roleModal.user.role}>
                    {roleSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Manager Modal */}
          {mgrModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-title">Assign Manager — {mgrModal.user.name}</div>
                {managers.length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--warning)", marginBottom: 16 }}>
                    No managers found. Promote a user to MANAGER first.
                  </p>
                ) : (
                  <>
                    <label className="modal-label">Select Manager</label>
                    <select className="modal-select" value={newMgr}
                      onChange={(e) => setNewMgr(e.target.value)}>
                      <option value="">— Select —</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  </>
                )}
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setMgrModal(null)}>Cancel</button>
                  <button className="btn-save"
                    onClick={handleMgrSave}
                    disabled={mgrSaving || !newMgr || managers.length === 0}>
                    {mgrSaving ? "Saving..." : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserManagement;