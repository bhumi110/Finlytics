const express = require("express");
const router = express.Router();
const expenseController = require("../controller/expence.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateCreateExpense } = require("../middleware/validate.middleware");
 
router.post(
  "/create",
  protect,
  authorize("EMPLOYEE"),
  validateCreateExpense,
  expenseController.createExpense
);
 
router.put(
  "/submit/:id",
  protect,
  authorize("EMPLOYEE"),
  expenseController.submitExpense
);
 
router.put(
  "/manager-approve/:id",
  protect,
  authorize("MANAGER"),
  expenseController.managerApprove
);
 
module.exports = router;