const express = require("express");
const router = express.Router();
const managerController = require("../controller/manager.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateRejection } = require("../middleware/validate.middleware");
 
router.use(protect);
router.use(authorize("MANAGER"));
 
router.get("/pending", managerController.getPendingApprovals);
router.get("/history",  managerController.getApprovalHistory);
router.put("/approve/:expenseId", managerController.approveExpense); 
router.put("/reject/:expenseId",  validateRejection, managerController.rejectExpense);
 
module.exports = router;