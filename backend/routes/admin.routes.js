const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateUpdateRole, validateAssignManager } = require("../middleware/validate.middleware");
 
router.use(protect);
router.use(authorize("ADMIN"));
 
router.get("/users", adminController.getAllUsers);
router.put("/users/:userId/role",validateUpdateRole,adminController.updateUserRole);
router.put("/users/:employeeId/assign-manager", validateAssignManager, adminController.assignManager);
 
module.exports = router;