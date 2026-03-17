const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");

exports.getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      employeeId: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    next(error);
  }
};


exports.getExpenseDetails = async (req, res, next) => {
  try {
    // Query by Mongo _id scoped to the requesting employee
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, expense });

  } catch (error) {
    next(error);
  }
};


exports.editDraftExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.DRAFT) {
      return res.status(400).json({ success: false, message: "Only draft expenses can be edited" });
    }

    const { amount, category, notes } = req.body;

    if (amount   !== undefined) expense.amount   = amount;
    if (category !== undefined) expense.category = category;
    if (notes    !== undefined) expense.notes    = notes;

    await expense.save();

    res.status(200).json({ success: true, message: "Draft updated successfully", expense });

  } catch (error) {
    next(error);
  }
};

exports.deleteDraftExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.DRAFT) {
      return res.status(400).json({ success: false, message: "Only draft expenses can be deleted" });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, message: "Draft deleted successfully" });

  } catch (error) {
    next(error);
  }
};