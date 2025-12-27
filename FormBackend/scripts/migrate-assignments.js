const mongoose = require('mongoose');
const Form = require('../models/Form');
const RequestAssignment = require('../models/RequestAssignment');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr_form';

async function migrateAssignments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all assignments
    const assignments = await RequestAssignment.find({});
    console.log(`📋 Found ${assignments.length} assignments to migrate`);

    let updatedCount = 0;
    let notFoundCount = 0;

    // Update each form with its assignment data
    for (const assignment of assignments) {
      try {
        const form = await Form.findById(assignment.formId);
        
        if (!form) {
          console.log(`⚠️  Form ${assignment.formId} not found for assignment`);
          notFoundCount++;
          continue;
        }

        // Check if already has assignedFollowup
        if (form.assignedFollowup && form.assignedFollowup.email) {
          console.log(`ℹ️  Form ${assignment.formId} already has assignedFollowup, skipping`);
          continue;
        }

        // Get the followup member details
        const User = require('../models/User');
        const followupMember = await User.findOne({ email: assignment.assignedTo });
        
        if (!followupMember) {
          console.log(`⚠️  Followup member ${assignment.assignedTo} not found`);
          continue;
        }

        // Update the form
        await Form.findByIdAndUpdate(assignment.formId, {
          assignedFollowup: {
            name: followupMember.name,
            email: followupMember.email
          },
          assignedAt: assignment.createdAt,
          followupStatus: assignment.status || 'pending'
        });

        console.log(`✅ Updated form "${form.companyName}" with followup member: ${followupMember.name}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating form ${assignment.formId}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⚠️  Not found: ${notFoundCount}`);
    console.log(`   📋 Total assignments: ${assignments.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAssignments();
