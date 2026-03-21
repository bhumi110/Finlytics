import { useState } from "react";
import { useNotifications } from "../NotificationContext";
import "../styles/notifications.css";

const TYPE_ICON = {
  info:    "📋",
  success: "✅",
  warning: "⏳",
  error:   "✕",
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, read, markAllRead, markRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((p) => !p);
  const close  = () => setOpen(false);

  return (
    <>
      {open && <div className="notif-backdrop" onClick={close} />}

      <div className="notif-anchor">
        {/* Bell button */}
        <button
          className="topbar-icon-btn"
          aria-label="Notifications"
          onClick={toggle}
          aria-expanded={open}
        >
          <svg
            width="15" height="15"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unreadCount > 0 && <span className="topbar-notif-dot" />}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="notif-panel" role="dialog" aria-label="Notifications">

            {/* Header */}
            <div className="notif-header">
              <span className="notif-header-title">
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="count-badge amber"
                    style={{ marginLeft: 8, verticalAlign: "middle" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <span className="notif-empty-icon">🔔</span>
                  You're all caught up!
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = !read.has(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`notif-item${isUnread ? " unread" : ""}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className={`notif-icon ${n.type}`}>
                        {TYPE_ICON[n.type] || "📋"}
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-sub">{n.body}</div>
                        <div className="notif-time">{timeAgo(n.time)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notif-footer">
                <button
                  className="notif-footer-link"
                  onClick={close}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;