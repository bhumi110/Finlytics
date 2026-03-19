import { useAuth } from "../AuthContext";
import NotificationBell from "./NotificationBell";
import "../styles/layout.css";

const PAGE_META = {
  "Dashboard":         { eyebrow: "Overview",   subtitle: "Your activity at a glance" },
  "Admin Dashboard":   { eyebrow: "Admin",       subtitle: "Platform overview" },
  "Manager Dashboard": { eyebrow: "Manager",     subtitle: "Team activity" },
  "Finance Dashboard": { eyebrow: "Finance",     subtitle: "Payments overview" },
  "My Expenses":       { eyebrow: "Expenses",    subtitle: "Track and manage your claims" },
  "Submit Expense":    { eyebrow: "New Claim",   subtitle: "Add a new expense" },
  "Pending Approvals": { eyebrow: "Queue",        subtitle: "Items awaiting your action" },
  "Finance Pending":   { eyebrow: "Finance",     subtitle: "Approve and pay expenses" },
  "Paid Expenses":     { eyebrow: "Finance",     subtitle: "Completed reimbursements" },
  "Review Expense":    { eyebrow: "Review",      subtitle: "Manager approval" },
  "Expense Detail":    { eyebrow: "Detail",      subtitle: "Expense record" },
  "User Management":   { eyebrow: "Admin",        subtitle: "Manage team members & roles" },
};

const Topbar = ({ title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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
        {/* Notification bell — dropdown included */}
        <NotificationBell />

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