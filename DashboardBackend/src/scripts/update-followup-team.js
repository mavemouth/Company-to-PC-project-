const mongoose = require("mongoose");
const User = require("../models/user");
require("dotenv").config();

async function updateFollowupTeam() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "ctpc_dashboard",
      } || "mongodb://127.0.0.1:27017/ctpc_dashboard"
    );
    console.log("✅ Connected to MongoDB");

    // Delete old followup team members
    const deleteResult = await User.deleteMany({ role: "FOLLOW_UP_TEAM" });
    console.log(
      `\n🗑️  Deleted ${deleteResult.deletedCount} old followup team members`
    );

    // Create new followup team members
    const newMembers = [
      {
        email: "aditya.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        name: "Aditya",
        status: "active",
      },
      {
        email: "shivam.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        name: "Shivam",
        status: "active",
      },
      {
        email: "akshay.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        name: "Akshay",
        status: "active",
      },
    ];

    for (const memberData of newMembers) {
      const member = new User(memberData);
      await member.save();
      console.log(`✅ Created: ${memberData.name} (${memberData.email})`);
    }

    // Verify the new team
    const followupTeam = await User.find({ role: "FOLLOW_UP_TEAM" });
    console.log(`\n✅ New followup team (${followupTeam.length} members):`);
    followupTeam.forEach((u) => console.log(`   - ${u.name} (${u.email})`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateFollowupTeam();
