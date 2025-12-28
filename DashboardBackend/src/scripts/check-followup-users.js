const mongoose = require("mongoose");
const User = require("../models/user");

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "ctpc_dashboard",
    });
    console.log("✅ Connected to MongoDB");

    const users = await User.find({ role: "FOLLOW_UP_TEAM" });
    console.log("\nFollowup team members:");
    users.forEach((u) => console.log(`- ${u.name} (${u.email})`));

    console.log(`\nTotal: ${users.length} members`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();
