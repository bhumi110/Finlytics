import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyExpenses,
  getManagerPending,
  getFinancePending,
  getAllUsers,
} from "./api/api";

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

const buildNotifications = (role, data) => {
  const now = Date.now();

  if (role === "EMPLOYEE") {
    return (data || [])
      .filter((e) => ["MANAGER_APPROVED", "FINANCE_APPROVED", "PAID", "REJECTED"].includes(e.status))
      .slice(0, 10)
      .map((e) => ({
        id: e._id,
        type: e.status === "REJECTED" ? "error"
            : e.status === "PAID"     ? "success"
            : "info",
        title: e.status === "MANAGER_APPROVED" ? "Manager approved your expense"
             : e.status === "FINANCE_APPROVED" ? "Finance approved your expense"
             : e.status === "PAID"             ? "Expense reimbursed"
             : "Expense rejected",
        body: `${e.category} — ₹${e.amount?.toLocaleString("en-IN")}`,
        time: e.updatedAt || e.submittedAt,
      }));
  }

  if (role === "MANAGER") {
    return (data || [])
      .slice(0, 10)
      .map((e) => ({
        id: e._id,
        type: "warning",
        title: "New expense awaiting approval",
        body: `${e.employeeId?.name || "Employee"} — ${e.category} (₹${e.amount?.toLocaleString("en-IN")})`,
        time: e.submittedAt,
      }));
  }

  if (role === "FINANCE") {
    return (data || [])
      .filter((e) => e.status === "MANAGER_APPROVED")
      .slice(0, 10)
      .map((e) => ({
        id: e._id,
        type: "info",
        title: "Expense awaiting finance approval",
        body: `${e.employeeId?.name || "Employee"} — ${e.category} (₹${e.amount?.toLocaleString("en-IN")})`,
        time: e.submittedAt,
      }));
  }

  if (role === "ADMIN") {
    return (data || [])
      .slice(-5)
      .reverse()
      .map((u) => ({
        id: u._id,
        type: "info",
        title: "New user registered",
        body: `${u.name} joined as ${u.role}`,
        time: u.createdAt,
      }));
  }

  return [];
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [read, setRead] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user?.role) return;
    setLoading(true);
    try {
      let data;
      if (user.role === "EMPLOYEE")  data = (await getMyExpenses()).data.expenses;
      if (user.role === "MANAGER")   data = (await getManagerPending()).data.expenses;
      if (user.role === "FINANCE")   data = (await getFinancePending()).data.expenses;
      if (user.role === "ADMIN")     data = (await getAllUsers()).data.users;
      setNotifications(buildNotifications(user.role, data));
    } catch (_) {}
    finally { setLoading(false); }
  }, [user?.role]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [fetch]);

  const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

  const markAllRead = () =>
    setRead(new Set(notifications.map((n) => n.id)));

  const markRead = (id) =>
    setRead((prev) => new Set([...prev, id]));

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, read, markAllRead, markRead, loading, refresh: fetch }}
    >
      {children}
    </NotificationContext.Provider>
  );
};