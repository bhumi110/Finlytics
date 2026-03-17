const express = require("express");
const router = express.Router();
const employeeController = require("../controller/empolyee.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
 
router.use(protect);
router.use(authorize("EMPLOYEE"));
 
router.get("/expenses", employeeController.getMyExpenses);
router.get("/expenses/:expenseId",   employeeController.getExpenseDetails);
router.put("/expenses/:expenseId",   employeeController.editDraftExpense);
router.delete("/expenses/:expenseId", employeeController.deleteDraftExpense); 
 
module.exports = router;