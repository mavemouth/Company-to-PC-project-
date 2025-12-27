const mongoose = require('mongoose');
const Form = require('../models/Form');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/hr_form');
  
  const form = await Form.findOne({ 'campusVisits.0': { $exists: true } });
  
  console.log('Has jobDescriptions?', form.jobDescriptions !== undefined);
  console.log('jobDescriptions length:', form.jobDescriptions?.length);
  
  if (form.jobDescriptions && form.jobDescriptions.length > 0) {
    console.log('\nFirst jobDescription:');
    console.log(JSON.stringify(form.jobDescriptions[0], null, 2));
  }
  
  // Check all field names at root level
  console.log('\nAll root fields:', Object.keys(form.toObject()));
  
  await mongoose.connection.close();
}

check();
