import axiosInstance from "./axios";

// AUTH
export const loginApi    = (email, password) =>
  axiosInstance.post("/auth/login", { email, password });

export const registerApi = (name, email, password) =>
  axiosInstance.post("/auth/register", { name, email, password });

// EMPLOYEE
export const getMyExpenses  = ()          => axiosInstance.get("/employee/expenses");
export const getExpenseById = (id)        => axiosInstance.get(`/employee/expenses/${id}`);
export const editExpense    = (id, data)  => axiosInstance.put(`/employee/expenses/${id}`, data);
export const deleteExpense  = (id)        => axiosInstance.delete(`/employee/expenses/${id}`);

// EXPENSE ACTIONS
export const createExpense = (data) => {
  const isFormData = data instanceof FormData;
  return axiosInstance.post("/expense/create", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

export const submitExpense = (id) => axiosInstance.put(`/expense/submit/${id}`);

// MANAGER
export const getManagerPending = ()       => axiosInstance.get("/manager/pending");
export const getManagerHistory = ()       => axiosInstance.get("/manager/history");
export const managerApprove    = (id)     => axiosInstance.put(`/manager/approve/${id}`);
export const managerReject     = (id, reason) =>
  axiosInstance.put(`/manager/reject/${id}`, { rejectionReason: reason });

// FINANCE
export const getFinancePending = ()       => axiosInstance.get("/finance/pending");
export const getFinancePaid    = ()       => axiosInstance.get("/finance/paid");
export const financeApprove    = (id)     => axiosInstance.put(`/finance/approve/${id}`);
export const financeReject     = (id, reason) =>
  axiosInstance.put(`/finance/reject/${id}`, { reason });
export const markAsPaid        = (id)     => axiosInstance.put(`/finance/pay/${id}`);

// ADMIN
export const getAllUsers    = ()           => axiosInstance.get("/admin/users");
export const updateRole    = (userId, role) =>
  axiosInstance.put(`/admin/users/${userId}/role`, { role });
export const assignManager = (employeeId, managerId) =>
  axiosInstance.put(`/admin/users/${employeeId}/assign-manager`, { managerId });