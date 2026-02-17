const dayjs = require("dayjs");
const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");

exports.calculateForecast = async (userId) => {
  const today = dayjs().date();

  const expenses = await Expense.find({
    employeeId: userId,
    status: { $in: [
      EXPENSE_STATUS.SUBMITTED,
      EXPENSE_STATUS.MANAGER_APPROVED,
      EXPENSE_STATUS.FINANCE_APPROVED,
      EXPENSE_STATUS.PAID
    ]}
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = total / today;
  const projected = dailyAvg * 30;

  return {
    totalSpend: total,
    projectedMonthEnd: projected
  };
};
