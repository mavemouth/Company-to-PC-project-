// Test script to verify HOD API endpoints
const testDepartment = "Computer Science & Engineering Department (CSED)";

async function testHODAPIs() {
  console.log('🧪 Testing HOD Dashboard APIs...\n');

  // Test 1: Companies endpoint
  console.log('1️⃣ Testing /api/hod/companies...');
  try {
    const response = await fetch(`http://localhost:5001/api/hod/companies?department=${encodeURIComponent(testDepartment)}`);
    const data = await response.json();
    console.log(`✅ Companies: ${data.length} found`);
    if (data.length > 0) {
      console.log(`   Example: ${data[0].companyName}`);
    }
  } catch (error) {
    console.log('❌ Companies API failed:', error.message);
  }

  // Test 2: Analytics endpoint
  console.log('\n2️⃣ Testing /api/hod/analytics...');
  try {
    const response = await fetch(`http://localhost:5001/api/hod/analytics?department=${encodeURIComponent(testDepartment)}`);
    const data = await response.json();
    console.log(`✅ Analytics: ${data.totalCompanies} companies`);
    if (data.topCompanies && data.topCompanies.length > 0) {
      console.log(`   Top Company: ${data.topCompanies[0].name} (${data.topCompanies[0].openings} openings)`);
    }
  } catch (error) {
    console.log('❌ Analytics API failed:', error.message);
  }

  // Test 3: Calendar endpoint
  console.log('\n3️⃣ Testing /api/hod/calendar...');
  try {
    const response = await fetch(`http://localhost:5001/api/hod/calendar?department=${encodeURIComponent(testDepartment)}`);
    const data = await response.json();
    console.log(`✅ Calendar: ${data.length} events found`);
    if (data.length > 0) {
      console.log(`   Next Event: ${data[0].company} on ${new Date(data[0].date).toLocaleDateString()}`);
    }
  } catch (error) {
    console.log('❌ Calendar API failed:', error.message);
  }

  // Test 4: Comparison endpoint
  console.log('\n4️⃣ Testing /api/hod/comparison...');
  try {
    const response = await fetch('http://localhost:5001/api/hod/comparison');
    const data = await response.json();
    console.log(`✅ Comparison: ${data.length} departments`);
    if (data.length > 0) {
      console.log(`   Top Department: ${data[0].shortName} (${data[0].companies} companies)`);
    }
  } catch (error) {
    console.log('❌ Comparison API failed:', error.message);
  }

  // Test 5: Students endpoint
  console.log('\n5️⃣ Testing /api/hod/students...');
  try {
    const response = await fetch(`http://localhost:5001/api/hod/students?department=${encodeURIComponent(testDepartment)}`);
    const data = await response.json();
    console.log(`✅ Students: ${data.length} students`);
  } catch (error) {
    console.log('❌ Students API failed:', error.message);
  }

  console.log('\n✅ All API tests completed!');
}

// Run tests
testHODAPIs();
