const User = require("../models/User");
const { ROLES } = require("../config/constants");


exports.getAllUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(limit),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });

  } catch (error) {
    next(error);
  }
};


exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // role is already validated by validateUpdateRole middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    next(error);
  }
};


exports.assignManager = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { managerId } = req.body;

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== ROLES.MANAGER) {
      return res.status(400).json({ success: false, message: "Invalid managerId. Must be a MANAGER" });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== ROLES.EMPLOYEE) {
      return res.status(400).json({ success: false, message: "Target user must be an EMPLOYEE" });
    }

    if (employee.managerId?.toString() === managerId) {
      return res.status(400).json({ success: false, message: "This manager is already assigned to the employee" });
    }

    employee.managerId = managerId;
    await employee.save();

    res.json({
      success: true,
      message: "Manager assigned successfully",
      employee: { id: employee._id, name: employee.name, managerId: employee.managerId }
    });

  } catch (error) {
    next(error);
  }
};