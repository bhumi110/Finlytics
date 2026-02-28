const express = require("express");
const router = express.Router();

const managerController = require("../controller/manager.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

/* Protect all manager routes */
router.use(protect);
router.use(authorize("MANAGER"));

/* Dashboard */
router.get("/pending", managerController.getPendingApprovals);
router.get("/history", managerController.getApprovalHistory);

/* Reject */
router.put("/reject/:expenseId", managerController.rejectExpense);

module.exports = router;