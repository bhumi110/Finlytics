const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
console.log("AuthController:", authController);
module.exports = router;
