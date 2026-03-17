const express = require("express");
const router = express.Router();
const financeController = require("../controller/finance.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateRejection } = require("../middleware/validate.middleware");
 
router.use(protect);
router.use(authorize("FINANCE"));
 
router.get("/pending",  financeController.getPendingFinanceExpenses);
router.get("/paid", financeController.getPaidExpenses);
router.put("/approve/:id",financeController.financeApprove);
router.put("/reject/:id", validateRejection, financeController.financeReject);
router.put("/pay/:id",  financeController.markAsPaid);
 
module.exports = router;