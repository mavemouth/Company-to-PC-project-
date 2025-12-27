const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  companyName: String,
  hrContacts: Array,
  jobDescriptions: Array,
  hiringStages: Array,
  campusVisits: Array,
  uploadedFiles: Array,
  createdAt: { type: Date, default: Date.now },
  status: String
}, { collection: 'forms' });

const Form = mongoose.model('TestForm', formSchema);

async function testQuery() {
  await mongoose.connect('mongodb://localhost:27017/hr_form');
  
  const department = 'Computer Science & Engineering Department (CSED)';
  
  const companies = await Form.find({
    $or: [
      { 'jobDescriptions.eligibleDepartments': { $regex: new RegExp(department, 'i') } },
      { 'jobDescriptions.expandedDepartments': { $regex: new RegExp(department, 'i') } }
    ]
  });

  console.log(`\n✅ Query found ${companies.length} companies`);
  
  const withVisits = companies.filter(c => c.campusVisits && c.campusVisits.length > 0);
  console.log(`📅 Companies with campus visits: ${withVisits.length}`);
  
  if (withVisits.length > 0) {
    const events = [];
    withVisits.forEach(company => {
      company.campusVisits.forEach(visit => {
        const companyName = company.companyName || 
                           (company.hrContacts && company.hrContacts[0] ? company.hrContacts[0].name : null) ||
                           'Company';
        events.push({
          company: companyName,
          date: visit.startDate,
          stage: visit.stageName
        });
      });
    });
    
    console.log(`\n📡 Total calendar events: ${events.length}`);
    console.log('\nSample events:');
    events.slice(0, 3).forEach(e => {
      console.log(`- ${e.company}: ${e.stage} on ${new Date(e.date).toLocaleDateString()}`);
    });
  }
  
  await mongoose.connection.close();
}

testQuery();
