const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");
const { createAuditLog } = require("../services/audit.service");


exports.getPendingFinanceExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      status: { $in: [EXPENSE_STATUS.MANAGER_APPROVED, EXPENSE_STATUS.FINANCE_APPROVED] }  // ← changed
    }).populate("employeeId", "name email");

    res.json({ success: true, count: expenses.length, expenses });

  } catch (error) {
    next(error);
  }
};


exports.financeApprove = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.MANAGER_APPROVED) {
      return res.status(400).json({ success: false, message: "Expense must be manager-approved before finance approval" });
    }

    expense.status = EXPENSE_STATUS.FINANCE_APPROVED;
    expense.financeApprovedAt = new Date();
    expense.financeApprovedBy = req.user.id;
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "FINANCE_APPROVED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Finance approved successfully" });

  } catch (error) {
    next(error);
  }
};


exports.financeReject = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }


    const rejectableStatuses = [EXPENSE_STATUS.MANAGER_APPROVED];
    if (!rejectableStatuses.includes(expense.status)) {
      return res.status(400).json({ success: false, message: "Only manager-approved expenses can be rejected by finance" });
    }

    expense.status = EXPENSE_STATUS.REJECTED;
    expense.rejectionReason = reason || "No reason provided";
    expense.rejectedAt = new Date();
    expense.rejectedBy = req.user.id;
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "FINANCE_REJECTED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Expense rejected by finance" });

  } catch (error) {
    next(error);
  }
};


exports.markAsPaid = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.FINANCE_APPROVED) {
      return res.status(400).json({ success: false, message: "Expense must be finance-approved before marking as paid" });
    }

    expense.status = EXPENSE_STATUS.PAID;
    expense.paidAt = new Date();
    expense.paidBy = req.user.id;
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "PAID",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Expense marked as paid" });

  } catch (error) {
    next(error);
  }
};


exports.getPaidExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      status: EXPENSE_STATUS.PAID
    }).populate("employeeId", "name email").sort({ paidAt: -1 });

    res.json({ success: true, count: expenses.length, expenses });

  } catch (error) {
    next(error);
  }
};