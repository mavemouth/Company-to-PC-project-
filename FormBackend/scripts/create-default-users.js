const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const createDefaultUsers = async () => {
  try {
    // Create Admin
    await User.create({
      name: "Shivam Sagar",
      email: "shivam.admin@hirehub.com",
      password: "admin123",
      role: "Admin",
      company: "HireHub",
      phone: "+91 98765 43210"
    });

    // Create HOD
    await User.create({
      name: "Dr. PS Rana",
      email: "ps.rana@hirehub.com",
      password: "hod123",
      role: "HOD",
      company: "HireHub",
      phone: "+91 87654 32109"
    });

    console.log("✅ Default users created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating default users:", error);
    process.exit(1);
  }
};

createDefaultUsers();
