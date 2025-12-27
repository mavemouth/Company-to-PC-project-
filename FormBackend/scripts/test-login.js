const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const testLogin = async () => {
  try {
    const testEmail = 'aditya.followup@thapar.edu';
    const testPassword = 'followup123';

    console.log(`\n🔐 Testing login for: ${testEmail}`);
    console.log(`📝 Password: ${testPassword}\n`);

    // Find user
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Stored password hash: ${user.password.substring(0, 30)}...`);

    // Test password comparison
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('\n✅ PASSWORD MATCH! Login should work!');
      console.log('\n📋 Use these credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('\n❌ PASSWORD MISMATCH! Login will fail!');
      console.log('\n⚠️  The password in database does not match "followup123"');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();
