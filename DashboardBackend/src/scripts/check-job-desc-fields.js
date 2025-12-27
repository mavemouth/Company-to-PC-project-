const mongoose = require('mongoose');

async function checkFieldNames() {
  await mongoose.connect('mongodb://localhost:27017/hr_form');
  const db = mongoose.connection.db;
  
  const sample = await db.collection('forms').findOne({ 'jobDescriptions.0': { $exists: true } });
  
  if (sample && sample.jobDescriptions && sample.jobDescriptions.length > 0) {
    console.log('\n📋 jobDescriptions[0] structure:');
    console.log(JSON.stringify(sample.jobDescriptions[0], null, 2));
  }
  
  await mongoose.connection.close();
}

checkFieldNames();
