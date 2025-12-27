const mongoose = require('mongoose');
const Form = require('../models/Form');

async function checkStructure() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr_form');
    
    const form = await Form.findOne({ 'campusVisits.0': { $exists: true } });
    
    console.log('\n📋 Full form structure:');
    console.log(JSON.stringify(form, null, 2).substring(0, 2000));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStructure();
