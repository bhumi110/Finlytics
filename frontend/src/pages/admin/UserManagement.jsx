import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar  from "../../components/Topbar";
import { getAllUsers, updateRole, assignManager } from "../../api/api";
import { formatDate } from "../../utils/format";
import "../../styles/dashboard.css";
import "../../styles/usermanagement.css";

const ROLES = ["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"];

const UserManagement = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ type: "", text: "" });

  const [roleModal, setRoleModal]   = useState(null);
  const [newRole, setNewRole]       = useState("");
  const [roleSaving, setRoleSaving] = useState(false);

  const [mgrModal, setMgrModal]   = useState(null);
  const [newMgr, setNewMgr]       = useState("");
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

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const handleRoleSave = async () => {
    if (!newRole || newRole === roleModal.user.role) return;
    setRoleSaving(true);
    try {
      await updateRole(roleModal.user._id, newRole);
      showMsg("success", `Role updated to ${newRole} for ${roleModal.user.name}.`);
      setRoleModal(null);
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed.");
    } finally {
      setRoleSaving(false);
    }
  };

  const handleMgrSave = async () => {
    if (!newMgr) return;
    setMgrSaving(true);
    try {
      await assignManager(mgrModal.user._id, newMgr);
      showMsg("success", `Manager assigned to ${mgrModal.user.name}.`);
      setMgrModal(null);
      load();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Assignment failed.");
    } finally {
      setMgrSaving(false);
    }
  };

  const getInitials = (name = "") =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-content">
        <Topbar title="User Management" />
        <div className="page-body">

          {/* Header */}
          <div className="usermgmt-header">
            <div>
              <div className="usermgmt-title">User Management</div>
              <div className="usermgmt-subtitle">Update roles and assign managers to team members</div>
            </div>
          </div>

          {/* Alert */}
          {msg.text && (
            <div className={msg.type === "success" ? "usermgmt-alert-success" : "usermgmt-alert-error"}>
              {msg.text}
            </div>
          )}

          {/* Table */}
          <div className="table-card">
            <div className="table-card-header">
              <h2 className="table-card-title">All Users</h2>
              <span className="count-badge blue">{users.length}</span>
            </div>

            <div className="table-scroll-wrap">
              {loading ? (
                <div className="table-empty">
                  <span className="table-empty-icon">⏳</span>
                  Loading users…
                </div>
              ) : users.length === 0 ? (
                <div className="table-empty">
                  <span className="table-empty-icon">👥</span>
                  No users found.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
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
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-sm">{getInitials(user.name)}</div>
                              <div style={{ minWidth: 0 }}>
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-chip ${user.role}`}>{user.role}</span>
                          </td>
                          <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                            {mgr?.name || (user.role === "EMPLOYEE" ? "—" : "N/A")}
                          </td>
                          <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="table-btn"
                                onClick={() => { setRoleModal({ user }); setNewRole(user.role); }}
                              >
                                Change Role
                              </button>
                              {user.role === "EMPLOYEE" && (
                                <button
                                  className="table-btn"
                                  onClick={() => { setMgrModal({ user }); setNewMgr(""); }}
                                >
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
          </div>

          {/* ── Change Role Modal ── */}
          {roleModal && (
            <div className="usermgmt-modal-overlay" onClick={(e) => e.target === e.currentTarget && setRoleModal(null)}>
              <div className="usermgmt-modal">
                <div className="usermgmt-modal-icon">🛡️</div>
                <div className="usermgmt-modal-title">Change Role</div>
                <div className="usermgmt-modal-desc">
                  Updating role for <strong>{roleModal.user.name}</strong>. This will change their access level immediately.
                </div>

                <div className="usermgmt-field">
                  <label className="usermgmt-label">New Role</label>
                  <select
                    className="usermgmt-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="usermgmt-modal-actions">
                  <button className="btn-cancel" onClick={() => setRoleModal(null)}>Cancel</button>
                  <button
                    className="btn-save"
                    onClick={handleRoleSave}
                    disabled={roleSaving || newRole === roleModal.user.role}
                  >
                    {roleSaving ? "Saving…" : "Save Role"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Assign Manager Modal ── */}
          {mgrModal && (
            <div className="usermgmt-modal-overlay" onClick={(e) => e.target === e.currentTarget && setMgrModal(null)}>
              <div className="usermgmt-modal">
                <div className="usermgmt-modal-icon">👤</div>
                <div className="usermgmt-modal-title">Assign Manager</div>
                <div className="usermgmt-modal-desc">
                  Select a manager for <strong>{mgrModal.user.name}</strong>.
                </div>

                {managers.length === 0 ? (
                  <div className="usermgmt-alert-error" style={{ marginBottom: 0 }}>
                    No managers found. Promote a user to MANAGER first.
                  </div>
                ) : (
                  <div className="usermgmt-field">
                    <label className="usermgmt-label">Select Manager</label>
                    <select
                      className="usermgmt-select"
                      value={newMgr}
                      onChange={(e) => setNewMgr(e.target.value)}
                    >
                      <option value="">— Choose a manager —</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} · {m.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="usermgmt-modal-actions">
                  <button className="btn-cancel" onClick={() => setMgrModal(null)}>Cancel</button>
                  <button
                    className="btn-save"
                    onClick={handleMgrSave}
                    disabled={mgrSaving || !newMgr || managers.length === 0}
                  >
                    {mgrSaving ? "Assigning…" : "Assign"}
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