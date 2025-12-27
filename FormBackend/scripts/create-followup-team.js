const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const createFollowupTeam = async () => {
  try {
    // Delete existing follow-up team members
    await User.deleteMany({ role: 'FOLLOW_UP_TEAM' });
    console.log("🗑️  Cleared existing follow-up team members");

    // Create Follow-up Team Members with simple passwords
    const followupMembers = [
      {
        name: "Aditya",
        email: "aditya.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        phone: "+91 98765 43211"
      },
      {
        name: "Shivam",
        email: "shivam.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        phone: "+91 98765 43212"
      },
      {
        name: "Akshay",
        email: "akshay.followup@thapar.edu",
        password: "followup123",
        role: "FOLLOW_UP_TEAM",
        phone: "+91 98765 43213"
      }
    ];

    for (const member of followupMembers) {
      await User.create(member);
      console.log(`✅ Created: ${member.name} (${member.email})`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Follow-up Team Created Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Follow-up Team Credentials:\n");
    
    followupMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Password: ${member.password}\n`);
    });
    
    console.log("🌐 Login URL: http://localhost:3002/login");
    console.log("\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating follow-up team:", error);
    process.exit(1);
  }
};

createFollowupTeam();
