const mongoose = require("mongoose");
const { EXPENSE_STATUS } = require("../config/constants");

const expenseSchema = new mongoose.Schema({
  expenseId: { type: String, unique: true },

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount: Number,
  category: String,
  notes: String,
receiptUrl: { type: String, default: null },
  status: {
    type: String,
    enum: Object.values(EXPENSE_STATUS),
    default: EXPENSE_STATUS.DRAFT
  },

  policyFlags: [String],
  riskScore: Number,
rejectedAt:      Date,
rejectedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
rejectionReason: String,
  submittedAt: Date,
  approvedAt: Date,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
