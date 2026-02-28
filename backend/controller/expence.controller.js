const Expense = require("../models/Expense");
const User = require("../models/User");
const { EXPENSE_STATUS } = require("../config/constants");
const { validateTransition } = require("../utils/statusTransition");
const { createAuditLog } = require("../services/audit.service");
const { v4: uuidv4 } = require("uuid");


exports.createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.managerId) {
      return res.status(400).json({
        message: "Manager not assigned yet"
      });
    }

    const { amount, category, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const expense = await Expense.create({
      expenseId: uuidv4(),
      employeeId: user._id,
      managerId: user.managerId,
      amount,
      category,
      notes,
      status: EXPENSE_STATUS.DRAFT
    });

    res.status(201).json({
      success: true,
      message: "Expense created as draft",
      expense
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.submitExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ expenseId: req.params.id });

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (expense.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!validateTransition(expense.status, EXPENSE_STATUS.SUBMITTED)) {
      return res.status(400).json({ message: "Invalid status transition" });
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

    res.json({ success: true, message: "Expense submitted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.managerApprove = async (req, res) => {
  try {
    const expense = await Expense.findOne({ expenseId: req.params.id });

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    // 🔒 Ensure this expense belongs to this manager
    if (expense.managerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to approve this expense"
      });
    }

    if (!validateTransition(expense.status, EXPENSE_STATUS.MANAGER_APPROVED)) {
      return res.status(400).json({ message: "Invalid transition" });
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

    res.json({ success: true, message: "Manager approved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.financeApprove = async (req, res) => {
  try {
    const expense = await Expense.findOne({ expenseId: req.params.id });

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (!validateTransition(expense.status, EXPENSE_STATUS.FINANCE_APPROVED)) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    expense.status = EXPENSE_STATUS.FINANCE_APPROVED;
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "FINANCE_APPROVED",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Finance approved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.markAsPaid = async (req, res) => {
  try {
    const expense = await Expense.findOne({ expenseId: req.params.id });

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (!validateTransition(expense.status, EXPENSE_STATUS.PAID)) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    expense.status = EXPENSE_STATUS.PAID;
    expense.paidAt = new Date();
    await expense.save();

    await createAuditLog({
      expenseId: expense._id,
      action: "PAID",
      performedBy: req.user.id,
      role: req.user.role
    });

    res.json({ success: true, message: "Marked as paid" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

