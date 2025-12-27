const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/hr_form', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const formSchema = new mongoose.Schema({
  companyName: String,
  hrContacts: Array,
  jobDescriptions: Array,
  hiringStages: Array,
  campusVisits: Array,
  uploadedFiles: Array,
  createdAt: { type: Date, default: Date.now },
  status: String
});

const Form = mongoose.model('Form', formSchema);

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database for hiring requests...\n');
    
    const allForms = await Form.find({});
    console.log(`📊 Total forms in database: ${allForms.length}\n`);
    
    if (allForms.length > 0) {
      console.log('Sample form data:');
      const sample = allForms[0];
      console.log(`Company: ${sample.companyName}`);
      console.log(`Job Descriptions: ${sample.jobDescriptions?.length || 0}`);
      
      if (sample.jobDescriptions && sample.jobDescriptions.length > 0) {
        console.log('\nEligible Departments in first job:');
        console.log(sample.jobDescriptions[0].eligibleDepartments);
        console.log('\nExpanded Departments in first job:');
        console.log(sample.jobDescriptions[0].expandedDepartments);
      }
      
      console.log('\n📋 All companies in database:');
      allForms.forEach((form, index) => {
        console.log(`${index + 1}. ${form.companyName}`);
        form.jobDescriptions?.forEach(job => {
          console.log(`   - Eligible: ${job.eligibleDepartments?.join(', ') || 'None'}`);
          console.log(`   - Expanded: ${job.expandedDepartments?.join(', ') || 'None'}`);
        });
      });
    } else {
      console.log('❌ No forms found in database!');
      console.log('You need to submit some hiring requests first.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabaseData();
