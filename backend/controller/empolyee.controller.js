const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");

/* ============================= */
/* GET ALL MY EXPENSES */
/* ============================= */
exports.getMyExpenses = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ============================= */
/* GET SINGLE EXPENSE DETAILS */
/* ============================= */
exports.getExpenseDetails = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.status(200).json({
      success: true,
      expense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ============================= */
/* EDIT DRAFT EXPENSE */
/* ============================= */
exports.editDraftExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    if (expense.status !== EXPENSE_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: "Only draft expenses can be edited"
      });
    }

    const { amount, category, notes } = req.body;

    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (notes) expense.notes = notes;

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      expense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ============================= */
/* DELETE DRAFT EXPENSE */
/* ============================= */
exports.deleteDraftExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.expenseId,
      employeeId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    if (expense.status !== EXPENSE_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: "Only draft expenses can be deleted"
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};