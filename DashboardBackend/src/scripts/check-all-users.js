const mongoose = require('mongoose');
const User = require('../models/user');

async function checkAllUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ctpc_dashboard');
    console.log('✅ Connected to MongoDB');

    const allUsers = await User.find({});
    console.log('\nAll users in database:');
    allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));
    
    const followupUsers = await User.find({ role: 'FOLLOW_UP_TEAM' });
    console.log(`\n\nFollowup team members: ${followupUsers.length}`);
    followupUsers.forEach(u => console.log(`- ${u.name} (${u.email})`));
    
    console.log(`\nTotal users: ${allUsers.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllUsers();
