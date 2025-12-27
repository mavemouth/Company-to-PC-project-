// Quick API test
fetch('http://localhost:5001/api/hod/companies?department=Computer%20Science%20%26%20Engineering%20Department%20(CSED)')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Companies API Response:');
    console.log(`Found ${data.length} companies`);
    if (data.length > 0) {
      console.log('First 3 companies:');
      data.slice(0, 3).forEach((c, i) => {
        console.log(`${i + 1}. ${c.companyName || c.hrContacts?.[0]?.name || 'No name'}`);
      });
    }
  })
  .catch(err => console.error('❌ Error:', err));
