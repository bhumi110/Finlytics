import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Employee
import EmployeeDashboard from "./pages/employee/Dashboard";
import MyExpenses        from "./pages/employee/MyExpenses";
import SubmitExpense     from "./pages/employee/SubmitExpense";
import ExpenseDetail     from "./pages/employee/ExpenseDetail";

// Manager
import ManagerDashboard from "./pages/manager/Dashboard";
import PendingApprovals from "./pages/manager/PendingApprovals";
import ApprovalDetail from "./pages/manager/ApprovalDetail";

// Finance
import FinanceDashboard from "./pages/finance/Dashboard";
import FinancePending   from "./pages/finance/FinancePending";
import PaidExpenses from "./pages/finance/PaidExpenses";

// Admin
import AdminDashboard  from "./pages/admin/Dashboard";
import UserManagement  from "./pages/admin/UserManagement";

const RoleHome = () => {
  const { user } = useAuth();
  const map = {
    EMPLOYEE: "/employee/dashboard",
    MANAGER:  "/manager/dashboard",
    FINANCE:  "/finance/dashboard",
    ADMIN:    "/admin/dashboard",
  };
  return <Navigate to={map[user?.role] || "/login"} replace />;
};

const Router = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"    element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

    {/* Employee */}
    <Route path="/employee/dashboard"    element={<ProtectedRoute role="EMPLOYEE"><EmployeeDashboard /></ProtectedRoute>} />
    <Route path="/employee/expenses"     element={<ProtectedRoute role="EMPLOYEE"><MyExpenses /></ProtectedRoute>} />
    <Route path="/employee/submit"       element={<ProtectedRoute role="EMPLOYEE"><SubmitExpense /></ProtectedRoute>} />
    <Route path="/employee/expenses/:id" element={<ProtectedRoute role="EMPLOYEE"><ExpenseDetail /></ProtectedRoute>} />

    {/* Manager */}
    <Route path="/manager/dashboard" element={<ProtectedRoute role="MANAGER"><ManagerDashboard /></ProtectedRoute>} />
    <Route path="/manager/pending"   element={<ProtectedRoute role="MANAGER"><PendingApprovals /></ProtectedRoute>} />
<Route path="/manager/pending/:id" element={
  <ProtectedRoute role="MANAGER"><ApprovalDetail /></ProtectedRoute>
} />
    {/* Finance */}
    <Route path="/finance/dashboard" element={<ProtectedRoute role="FINANCE"><FinanceDashboard /></ProtectedRoute>} />
    <Route path="/finance/pending"   element={<ProtectedRoute role="FINANCE"><FinancePending /></ProtectedRoute>} />
<Route path="/finance/paid" element={
  <ProtectedRoute role="FINANCE"><PaidExpenses /></ProtectedRoute>
} />
    {/* Admin */}
    <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users"     element={<ProtectedRoute role="ADMIN"><UserManagement /></ProtectedRoute>} />

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default Router;