import { useAuth } from "../AuthContext";
import "../styles/layout.css";

const PAGE_SUBTITLES = {
  "Dashboard":      "Overview of your activity",
  "My Expenses":    "Track and manage your expenses",
  "Submit Expense": "Add a new expense claim",
  "Pending":        "Items awaiting your action",
  "Paid":           "Completed reimbursements",
  "Users":          "Manage team members",
};

const Topbar = ({ title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const roleLabel = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : "";
  const subtitle = PAGE_SUBTITLES[title] || "";

  return (
    <div className="topbar">
      {/* Left: title block (hamburger is now handled by Sidebar itself) */}
      <div className="topbar-left">
        {/* Spacer so title doesn't hide behind the floating hamburger on mobile */}
        <div className="topbar-mobile-spacer" aria-hidden="true" />
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>

      {/* Right: bell + user chip */}
      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="topbar-notif-dot" />
        </button>

        <div className="topbar-user-chip">
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