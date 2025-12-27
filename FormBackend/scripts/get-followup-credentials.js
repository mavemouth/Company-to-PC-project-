const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const getFollowupCredentials = async () => {
  try {
    // Find all follow-up team members
    const followupUsers = await User.find({ role: 'FOLLOW_UP_TEAM' }).select('name email password');

    if (followupUsers.length === 0) {
      console.log("\n⚠️  No follow-up team members found in database.");
      console.log("\n📝 Default Follow-up Team Credentials (if they exist):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n1. Aditya");
      console.log("   Email: aditya.followup@thapar.edu");
      console.log("   Password: followup123");
      console.log("\n2. Shivam");
      console.log("   Email: shivam.followup@thapar.edu");
      console.log("   Password: followup123");
      console.log("\n3. Akshay");
      console.log("   Email: akshay.followup@thapar.edu");
      console.log("   Password: followup123");
    } else {
      console.log("\n✅ Follow-up Team Member Credentials:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      followupUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
      });
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login URL: http://localhost:3002/login");
    console.log("\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fetching credentials:", error);
    process.exit(1);
  }
};

getFollowupCredentials();
