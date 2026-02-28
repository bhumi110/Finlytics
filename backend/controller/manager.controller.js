const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");
const { createAuditLog } = require("../services/audit.service");


exports.getPendingApprovals = async (req, res) => {
  try {
    const expenses = await Expense.find({
      managerId: req.user.id,
      status: EXPENSE_STATUS.SUBMITTED
    }).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getApprovalHistory = async (req, res) => {
  try {
    const expenses = await Expense.find({
      managerId: req.user.id,
      status: { $in: [EXPENSE_STATUS.MANAGER_APPROVED, EXPENSE_STATUS.FINANCE_APPROVED, EXPENSE_STATUS.PAID] }
    }).sort({ approvedAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.rejectExpense = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const expense = await Expense.findOne({
      expenseId: req.params.expenseId,
      managerId: req.user.id
    });

    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });

    if (expense.status !== EXPENSE_STATUS.SUBMITTED)
      return res.status(400).json({ success: false, message: "Invalid status transition" });

    expense.status = EXPENSE_STATUS.REJECTED;
    expense.rejectedAt = new Date();
    expense.rejectionReason = rejectionReason || "No reason provided";

    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "MANAGER_REJECTED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.status(200).json({
      success: true,
      message: "Expense rejected"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};