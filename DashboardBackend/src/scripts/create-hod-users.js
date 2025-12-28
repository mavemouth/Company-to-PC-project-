const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Connect to MongoDB (same database as FormBackend and DashboardBackend)
mongoose.connect(
  process.env.MONGODB_URI,
  {
    dbName: "ctpc_form",
  },
  {
    //'mongodb://127.0.0.1:27017/hr_form'
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// 8 Department HODs
const hodUsers = [
  {
    email: "hod.csed@thapar.edu",
    password: "hod123",
    name: "HOD CSED",
    role: "HOD",
    department: "Computer Science & Engineering Department (CSED)",
  },
  {
    email: "hod.med@thapar.edu",
    password: "hod123",
    name: "HOD MED",
    role: "HOD",
    department: "Mechanical Engineering Department (MED)",
  },
  {
    email: "hod.eid@thapar.edu",
    password: "hod123",
    name: "HOD EID",
    role: "HOD",
    department: "Electrical & Instrumentation Department (EID)",
  },
  {
    email: "hod.ecd@thapar.edu",
    password: "hod123",
    name: "HOD ECD",
    role: "HOD",
    department: "Electronics & Communication Department (ECD)",
  },
  {
    email: "hod.ced@thapar.edu",
    password: "hod123",
    name: "HOD CED",
    role: "HOD",
    department: "Civil Engineering Department (CED)",
  },
  {
    email: "hod.btd@thapar.edu",
    password: "hod123",
    name: "HOD BTD",
    role: "HOD",
    department: "Bio-Technology Department (BTD)",
  },
  {
    email: "hod.ched@thapar.edu",
    password: "hod123",
    name: "HOD CHED",
    role: "HOD",
    department: "Chemical Engineering Department (CHED)",
  },
  {
    email: "hod.dee@thapar.edu",
    password: "hod123",
    name: "HOD DEE",
    role: "HOD",
    department: "Department of Energy and Environment (DEE)",
  },
];

async function createHODUsers() {
  try {
    console.log("🔄 Starting HOD user creation...");

    // Delete existing HOD users
    const deleteResult = await User.deleteMany({ role: "HOD" });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing HOD users`);

    // Create new HOD users with hashed passwords
    for (const hodData of hodUsers) {
      const hashedPassword = await bcrypt.hash(hodData.password, 10);

      const user = new User({
        email: hodData.email,
        password: hashedPassword,
        name: hodData.name,
        role: hodData.role,
        department: hodData.department,
      });

      await user.save();
      console.log(`✅ Created HOD: ${hodData.email} (${hodData.department})`);
    }

    console.log("✅ All HOD users created successfully!");
    console.log("\n📋 HOD User Credentials:");
    hodUsers.forEach((hod) => {
      console.log(`   ${hod.email} / ${hod.password} - ${hod.department}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating HOD users:", error);
    process.exit(1);
  }
}

createHODUsers();
