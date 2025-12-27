const mongoose = require('mongoose');

async function checkCollections() {
  await mongoose.connect('mongodb://localhost:27017/hr_form');
  const db = mongoose.connection.db;
  
  // Check forms collection
  const formsCount = await db.collection('forms').countDocuments();
  console.log(`\n📊 'forms' collection: ${formsCount} documents`);
  
  const formSample = await db.collection('forms').findOne({ 'campusVisits.0': { $exists: true } });
  if (formSample) {
    console.log('\nSample from forms collection:');
    console.log('Fields:', Object.keys(formSample));
  }
  
  // Check hrforms collection
  const hrformsCount = await db.collection('hrforms').countDocuments();
  console.log(`\n📊 'hrforms' collection: ${hrformsCount} documents`);
  
  const hrformSample = await db.collection('hrforms').findOne({});
  if (hrformSample) {
    console.log('\nSample from hrforms collection:');
    console.log('Fields:', Object.keys(hrformSample));
    console.log('Has jobDescriptions?', hrformSample.jobDescriptions !== undefined);
    if (hrformSample.jobDescriptions) {
      console.log('jobDescriptions[0] expandedDepartments:', hrformSample.jobDescriptions[0]?.expandedDepartments);
    }
  }
  
  await mongoose.connection.close();
}

checkCollections();
