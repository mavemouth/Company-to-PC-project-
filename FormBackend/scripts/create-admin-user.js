const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@thapar.edu" });
    
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      process.exit(0);
    }

    // Create Admin
    const admin = await User.create({
      name: "CTPC Administrator",
      email: "admin@thapar.edu",
      password: "admin@ctpc2025",
      role: "ADMIN",
      company: "Thapar Institute",
      phone: "+91 98765 43210"
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@thapar.edu");
    console.log("🔑 Password: admin@ctpc2025");
    console.log("👤 Role: ADMIN");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
