const ApprovalLog = require("../models/ApprovalLog");

exports.createAuditLog = async ({
  expenseId,
  action,
  performedBy,
  role,
  comment = ""
}) => {
  await ApprovalLog.create({
    expenseId,
    action,
    performedBy,
    role,
    comment
  });
};
