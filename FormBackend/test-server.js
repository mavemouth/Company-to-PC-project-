const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    port: 5000
  });
});

// Mock submissions endpoint
app.get('/api/submissions', (req, res) => {
  console.log('📥 Request received for /api/submissions');
  
  const mockData = [
    {
      _id: "test-backend-1",
      companyName: "Backend Test Corp",
      hrContacts: [
        {
          id: "hr-1",
          name: "Test HR Manager",
          email: "hr@testcorp.com",
          phone: "+91-1234567890"
        }
      ],
      jobDescriptions: [
        {
          id: "jd-1",
          title: "Backend Developer",
          type: "fulltime",
          internshipDuration: "",
          conditions: "Backend connected successfully",
          openings: "2",
          skills: "Node.js, Express, MongoDB",
          degreePreferences: ["btech"],
          ctc: "10",
          stipend: "",
          allowances: "Health insurance",
          cutoff: "7.0",
          eligibleDepartments: ["Computer Science Engineering (CSE)"],
          eligibleBatches: ["2026"]
        }
      ],
      hiringStages: [
        { stage: "Backend Test", mode: "online" },
        { stage: "API Integration", mode: "online" }
      ],
      campusVisits: [
        {
          id: "visit-1",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          stageName: "Backend Integration Test"
        }
      ],
      uploadedFiles: ["backend-test.pdf"],
      createdAt: new Date().toISOString()
    }
  ];
  
  console.log('📤 Sending mock data:', mockData.length, 'items');
  res.json(mockData);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/submissions - Mock submissions data`);
  console.log(`✅ Ready to receive requests!`);
});