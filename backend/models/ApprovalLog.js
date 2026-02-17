const mongoose = require("mongoose");

const approvalLogSchema = new mongoose.Schema({
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" },
  action: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: String,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApprovalLog", approvalLogSchema);
