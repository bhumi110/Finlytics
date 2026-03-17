const Expense = require("../models/Expense");
const User = require("../models/User");
const { EXPENSE_STATUS } = require("../config/constants");
const { validateTransition } = require("../utils/statusTransition");
const { createAuditLog } = require("../services/audit.service");
const { v4: uuidv4 } = require("uuid");

exports.createExpense = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.managerId) {
      return res.status(400).json({ success: false, message: "You have no manager assigned yet. Contact an admin." });
    }

    const { amount, category, notes } = req.body;

    const expense = await Expense.create({
      expenseId: uuidv4(),
      employeeId: user._id,
      managerId: user.managerId,
      amount,
      category,
      notes,
      status: EXPENSE_STATUS.DRAFT
    });

    res.status(201).json({ success: true, message: "Expense created as draft", expense });

  } catch (error) {
    next(error);
  }
};


exports.submitExpense = async (req, res, next) => {
  try {
    // Use consistent _id lookup
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!validateTransition(expense.status, EXPENSE_STATUS.SUBMITTED)) {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    expense.status = EXPENSE_STATUS.SUBMITTED;
    expense.submittedAt = new Date();
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "SUBMITTED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Expense submitted for manager approval" });

  } catch (error) {
    next(error);
  }
};


exports.managerApprove = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.managerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to approve this expense" });
    }

    if (!validateTransition(expense.status, EXPENSE_STATUS.MANAGER_APPROVED)) {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
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

    res.json({ success: true, message: "Expense approved by manager" });

  } catch (error) {
    next(error);
  }
};