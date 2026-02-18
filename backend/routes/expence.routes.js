const express = require("express");
const router = express.Router();
const expenseController = require("../controller/expence.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");


router.post(
  "/create",
  protect,
  authorize("EMPLOYEE"),
  expenseController.createExpense
);



/* Employee */
router.put(
  "/submit/:id",
  protect,
  authorize("EMPLOYEE"),
  expenseController.submitExpense
);

/* Manager */
router.put(
  "/manager-approve/:id",
  protect,
  authorize("MANAGER"),
  expenseController.managerApprove
);

/* Finance */
router.put(
  "/finance-approve/:id",
  protect,
  authorize("FINANCE"),
  expenseController.financeApprove
);

router.put(
  "/mark-paid/:id",
  protect,
  authorize("FINANCE"),
  expenseController.markAsPaid
);

module.exports = router;
