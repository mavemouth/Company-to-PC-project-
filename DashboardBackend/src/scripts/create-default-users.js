const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const defaultUsers = [
  {
    email: "admin.ctpc@thapar.edu",
    password: "CTPC@admin2025",
    role: "ADMIN",
    name: "CTPC Admin",
  },
  {
    email: "hod.csed@thapar.edu",
    password: "CSED@hod2025",
    role: "HOD",
    department: "Computer Science & Engineering Department (CSED)",
    name: "CSED HOD",
  },
  {
    email: "hod.med@thapar.edu",
    password: "MED@hod2025",
    role: "HOD",
    department: "Mechanical Engineering Department (MED)",
    name: "MED HOD",
  },
  {
    email: "aditya.followup@thapar.edu",
    password: "followup123",
    role: "FOLLOW_UP_TEAM",
    name: "Aditya",
    assignedCompanies: [],
  },
  {
    email: "shivam.followup@thapar.edu",
    password: "followup123",
    role: "FOLLOW_UP_TEAM",
    name: "Shivam",
    assignedCompanies: [],
  },
  {
    email: "akshay.followup@thapar.edu",
    password: "followup123",
    role: "FOLLOW_UP_TEAM",
    name: "Akshay",
    assignedCompanies: [],
  },
];

async function createDefaultUsers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "ctpc_dashboard",
      } || "mongodb://127.0.0.1:27017/ctpc_dashboard"
    );
    console.log("✅ MongoDB Connected");

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log("Default users created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating default users:", error);
    process.exit(1);
  }
}

createDefaultUsers();
