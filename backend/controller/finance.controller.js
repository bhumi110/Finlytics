const Expense = require("../models/Expense");
const { EXPENSE_STATUS } = require("../config/constants");

/* Get Expenses Awaiting Finance Approval */
exports.getPendingFinanceExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      status: EXPENSE_STATUS.MANAGER_APPROVED
    }).populate("employeeId", "name email");

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.financeApprove = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.MANAGER_APPROVED) {
      return res.status(400).json({
        message: "Expense must be manager approved first"
      });
    }

    expense.status = EXPENSE_STATUS.FINANCE_APPROVED;
    expense.financeApprovedAt = new Date();
    expense.financeApprovedBy = req.user.id;

    await expense.save();

    res.json({
      success: true,
      message: "Finance approved successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.financeReject = async (req, res) => {
  try {
    const { reason } = req.body;

    const expense = await Expense.findOne({
      expenseId: req.params.id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.status = EXPENSE_STATUS.REJECTED;
    expense.rejectionReason = reason;
    expense.rejectedAt = new Date();
    expense.rejectedBy = req.user.id;

    await expense.save();

    res.json({
      success: true,
      message: "Expense rejected"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.markAsPaid = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.status !== EXPENSE_STATUS.FINANCE_APPROVED) {
      return res.status(400).json({
        message: "Expense must be finance approved first"
      });
    }

    expense.status = EXPENSE_STATUS.PAID;
    expense.paidAt = new Date();
    expense.paidBy = req.user.id;

    await expense.save();

    res.json({
      success: true,
      message: "Expense marked as paid"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

