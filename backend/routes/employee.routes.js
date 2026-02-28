const express = require("express");
const router = express.Router();

const employeeController = require("../controller/empolyee.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

/* All employee routes are protected */
router.use(protect);
router.use(authorize("EMPLOYEE"));

/* View all my expenses */
router.get("/expenses", employeeController.getMyExpenses);

/* View single expense */
router.get("/expenses/:expenseId", employeeController.getExpenseDetails);

/* Edit draft */
router.put("/edit/:expenseId", employeeController.editDraftExpense);

/* Delete draft */
router.delete("/delete/:expenseId", employeeController.deleteDraftExpense);

module.exports = router;