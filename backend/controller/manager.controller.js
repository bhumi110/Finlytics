const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");
const { createAuditLog } = require("../services/audit.service");


exports.getPendingApprovals = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      managerId: req.user.id,
      status: EXPENSE_STATUS.SUBMITTED
    })
    .populate("employeeId", "name email")
    .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, expenses });

  } catch (error) {
    next(error);
  }
};


exports.getApprovalHistory = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      managerId: req.user.id,
      status: {
        $in: [
          EXPENSE_STATUS.MANAGER_APPROVED,
          EXPENSE_STATUS.FINANCE_APPROVED,
          EXPENSE_STATUS.PAID,
          EXPENSE_STATUS.REJECTED
        ]
      }
    })
    .populate("employeeId", "name email")
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, expenses });

  } catch (error) {
    next(error);
  }
};


exports.approveExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      managerId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.SUBMITTED) {
      return res.status(400).json({ success: false, message: "Only submitted expenses can be approved" });
    }

    expense.status = EXPENSE_STATUS.MANAGER_APPROVED;
    expense.approvedAt = new Date();
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "MANAGER_APPROVED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.status(200).json({ success: true, message: "Expense approved" });

  } catch (error) {
    next(error);
  }
};


exports.rejectExpense = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      managerId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.SUBMITTED) {
      return res.status(400).json({ success: false, message: "Only submitted expenses can be rejected" });
    }

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

    res.status(200).json({ success: true, message: "Expense rejected" });

  } catch (error) {
    next(error);
  }
};