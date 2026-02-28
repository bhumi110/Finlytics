const User = require("../models/User");
const { ROLES } = require("../config/constants");

/* Promote User Role */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User promoted to ${role}`,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* Assign Manager to Employee */
exports.assignManager = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { managerId } = req.body;

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== ROLES.MANAGER) {
      return res.status(400).json({
        message: "Invalid managerId. Must be a MANAGER"
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
      return res.status(400).json({
        message: "User must be an EMPLOYEE"
      });
    }

    employee.managerId = managerId;
    await employee.save();

    res.json({
      success: true,
      message: "Manager assigned successfully",
      employee
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* Get All Users */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};