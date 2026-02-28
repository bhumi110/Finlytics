const User = require("./models/User");
const bcrypt = require("bcryptjs");
const { ROLES } = require("./config/constants");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // const hashedPassword = await bcrypt.hash(
    //   process.env.ADMIN_PASSWORD,
    //   10
    // );

    await User.create({
      name: "System Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: ROLES.ADMIN,
      managerId: null,
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Admin seed error:", error);
  }
};

module.exports = seedAdmin;
