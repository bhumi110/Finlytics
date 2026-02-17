const mongoose = require("mongoose");
const { EXPENSE_STATUS } = require("../config/constants");

const expenseSchema = new mongoose.Schema({
  expenseId: { type: String, unique: true },

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount: Number,
  category: String,
  receiptUrl: String,
  notes: String,

  status: {
    type: String,
    enum: Object.values(EXPENSE_STATUS),
    default: EXPENSE_STATUS.DRAFT
  },

  policyFlags: [String],
  riskScore: Number,

  submittedAt: Date,
  approvedAt: Date,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
