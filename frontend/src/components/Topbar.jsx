import { useAuth } from "../AuthContext";
import "../styles/layout.css";

const PAGE_META = {
  "Dashboard":        { eyebrow: "Overview",    subtitle: "Your activity at a glance" },
  "My Expenses":      { eyebrow: "Expenses",    subtitle: "Track and manage your claims" },
  "Submit Expense":   { eyebrow: "New Claim",   subtitle: "Add a new expense" },
  "Pending":          { eyebrow: "Queue",        subtitle: "Items awaiting your action" },
  "Paid":             { eyebrow: "Finance",      subtitle: "Completed reimbursements" },
  "User Management":  { eyebrow: "Admin",        subtitle: "Manage team members & roles" },
};

const Topbar = ({ title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const roleLabel = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : "";
  const meta = PAGE_META[title] || {};

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title-block">
          {meta.eyebrow && <span className="topbar-eyebrow">{meta.eyebrow}</span>}
          <div className="topbar-title">{title}</div>
          {meta.subtitle && <div className="topbar-subtitle">{meta.subtitle}</div>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification bell */}
        <button className="topbar-icon-btn" aria-label="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="topbar-notif-dot" />
        </button>

        {/* User chip */}
        <div className="topbar-user-chip" role="button" tabIndex={0}>
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user?.name}</div>
            <div className="topbar-user-role">{roleLabel}</div>
          </div>
          <span className="topbar-caret" aria-hidden="true">▾</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;