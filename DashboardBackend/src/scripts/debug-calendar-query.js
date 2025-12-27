const mongoose = require('mongoose');
const Form = require('../models/Form');

async function debugCalendarQuery() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr_form');
    console.log('✅ Connected to MongoDB\n');

    const department = 'Computer Science & Engineering Department (CSED)';
    
    // Test the exact query used in the API
    const companies = await Form.find({
      $or: [
        { 'jobDescriptions.eligibleDepartments': { $regex: new RegExp(department, 'i') } },
        { 'jobDescriptions.expandedDepartments': { $regex: new RegExp(department, 'i') } }
      ]
    });

    console.log(`📊 Query found ${companies.length} companies\n`);

    // Check which ones have campus visits
    const withVisits = companies.filter(c => c.campusVisits && c.campusVisits.length > 0);
    console.log(`📅 Companies with campus visits: ${withVisits.length}\n`);

    // Check the actual data structure
    if (companies.length > 0) {
      const sample = companies[0];
      console.log('🔍 Sample company structure:');
      console.log('- Has campusVisits field?', sample.campusVisits !== undefined);
      console.log('- campusVisits type:', typeof sample.campusVisits);
      console.log('- campusVisits is array?', Array.isArray(sample.campusVisits));
      if (sample.campusVisits) {
        console.log('- campusVisits length:', sample.campusVisits.length);
        if (sample.campusVisits.length > 0) {
          console.log('- First visit:', JSON.stringify(sample.campusVisits[0], null, 2));
        }
      }
    }

    // Try to find ANY form with campus visits
    const anyWithVisits = await Form.findOne({ 'campusVisits.0': { $exists: true } });
    console.log('\n📍 Sample form with visits:');
    if (anyWithVisits) {
      console.log('- Company:', anyWithVisits.companyName);
      console.log('- Departments:', anyWithVisits.jobDescriptions?.[0]?.expandedDepartments);
      console.log('- Campus visits:', anyWithVisits.campusVisits?.length);
      console.log('- Visit details:', JSON.stringify(anyWithVisits.campusVisits?.[0], null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugCalendarQuery();
