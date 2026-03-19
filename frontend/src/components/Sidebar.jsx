import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/layout.css";

const NAV = {
  EMPLOYEE: [
    { label: "Dashboard",      to: "/employee/dashboard", icon: "📊" },
    { label: "My Expenses",    to: "/employee/expenses",  icon: "📋" },
    { label: "Submit Expense", to: "/employee/submit",    icon: "➕" },
  ],
  MANAGER: [
    { label: "Dashboard", to: "/manager/dashboard", icon: "📊" },
    { label: "Pending",   to: "/manager/pending",   icon: "⏳" },
  ],
  FINANCE: [
    { label: "Dashboard", to: "/finance/dashboard", icon: "📊" },
    { label: "Pending",   to: "/finance/pending",   icon: "⏳" },
    { label: "Paid",      to: "/finance/paid",      icon: "✅" },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
    { label: "Users",     to: "/admin/users",     icon: "👥" },
  ],
};

const ROLE_LABELS = {
  EMPLOYEE: "Employee Portal",
  MANAGER:  "Manager Portal",
  FINANCE:  "Finance Portal",
  ADMIN:    "Admin Portal",
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [open, setOpen]         = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setOpen(true);
      else setOpen(false);
    };
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    setOpen(!mobile);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname, isMobile]);

  const links    = NAV[user?.role] || [];
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const isVisible = !isMobile || open;

  return (
    <>
      <aside
        className={`sidebar ${isVisible ? "sidebar-open" : "sidebar-closed"}`}
        aria-label="Main navigation"
      >
        {/* Diagonal stripe texture overlay */}
        <div className="sidebar-texture" aria-hidden="true" />

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">F</div>
          <div className="sidebar-brand-wrap">
            <span className="sidebar-brand-text">Finlytics</span>
            <span className="sidebar-brand-sub">Expense Platform</span>
          </div>
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role label */}
        <div className="sidebar-role-badge">
          {ROLE_LABELS[user?.role] || user?.role || ""}
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user?.name}</div>
              <div className="sidebar-email">{user?.email}</div>
            </div>
          </div>
          <button
            className="sidebar-logout"
            onClick={() => { logout(); navigate("/login"); }}
          >
            <span aria-hidden="true">↪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile hamburger */}
      {isMobile && !open && (
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <span className="toggle-bar" />
          <span className="toggle-bar" />
          <span className="toggle-bar" />
        </button>
      )}
    </>
  );
};

export default Sidebar;