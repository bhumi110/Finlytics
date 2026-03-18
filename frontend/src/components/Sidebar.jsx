import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/layout.css";

const NAV = {
  EMPLOYEE: [
    { label: "Dashboard",      to: "/employee/dashboard" },
    { label: "My Expenses",    to: "/employee/expenses"  },
    { label: "Submit Expense", to: "/employee/submit"    },
  ],
  MANAGER: [
    { label: "Dashboard", to: "/manager/dashboard" },
    { label: "Pending",   to: "/manager/pending"   },
  ],
  FINANCE: [
    { label: "Dashboard", to: "/finance/dashboard" },
    { label: "Pending",   to: "/finance/pending"   },
    { label: "Paid",      to: "/finance/paid"      },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users",     to: "/admin/users"     },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(true);
  const links            = NAV[user?.role] || [];

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "?";

  return (
    <>
      <button
        className={`sidebar-toggle ${open ? "toggle-open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="toggle-bar" />
        <span className="toggle-bar" />
        <span className="toggle-bar" />
      </button>

      <aside className={`sidebar ${open ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)" }}>F</div>
          <span className="sidebar-brand-text">Finlytics</span>
        </div>

        <div className="sidebar-role-badge">{user?.role}</div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user?.name}</div>
              <div className="sidebar-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }}>
            Sign Out
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Sidebar;