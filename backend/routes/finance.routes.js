const express = require("express");
const router = express.Router();
const financeController = require("../controller/finance.controller");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role.middleware");


router.use(protect);
router.use(authorize("FINANCE"));

router.get("/pending", financeController.getPendingFinanceExpenses);

router.put("/approve/:id", financeController.financeApprove);

router.put("/reject/:id", financeController.financeReject);

router.put("/pay/:id", financeController.markAsPaid);

router.get("/paid", financeController.getPaidExpenses);

module.exports = router;