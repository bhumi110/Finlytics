const { EXPENSE_STATUS } = require("../config/constants");

const allowedTransitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["MANAGER_APPROVED", "REJECTED"],
  MANAGER_APPROVED: ["FINANCE_APPROVED", "REJECTED"],
  FINANCE_APPROVED: ["PAID"],
};

exports.validateTransition = (currentStatus, nextStatus) => {
  const allowed = allowedTransitions[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
};
