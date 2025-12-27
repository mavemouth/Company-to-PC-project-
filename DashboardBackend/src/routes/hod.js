const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Form Schema (reusing the existing schema)
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

// Department mapping helper
const getDepartmentShortName = (department) => {
  if (department.includes("CSED")) return "CSED";
  if (department.includes("MED")) return "MED";
  if (department.includes("EID")) return "EID";
  if (department.includes("ECD")) return "ECD";
  if (department.includes("CED")) return "CED";
  if (department.includes("BTD")) return "BTD";
  if (department.includes("CHED")) return "CHED";
  if (department.includes("DEE")) return "DEE";
  return "DEPT";
};

// GET /api/hod/companies - Get companies for a specific department
router.get('/companies', async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: 'Department parameter is required' });
    }

    // Find all forms where jobDescriptions contain the department
    const companies = await Form.find({
      'jobDescriptions.eligibleDepartments': { 
        $regex: new RegExp(department, 'i') 
      }
    }).sort({ createdAt: -1 });

    // Also check expandedDepartments
    const companiesExpanded = await Form.find({
      'jobDescriptions.expandedDepartments': { 
        $regex: new RegExp(department, 'i') 
      }
    }).sort({ createdAt: -1 });

    // Merge and remove duplicates
    const allCompanies = [...companies, ...companiesExpanded];
    const uniqueCompanies = Array.from(
      new Map(allCompanies.map(item => [item._id.toString(), item])).values()
    );

    res.json(uniqueCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/hod/analytics - Get analytics for a specific department
router.get('/analytics', async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: 'Department parameter is required' });
    }

    const companies = await Form.find({
      $or: [
        { 'jobDescriptions.eligibleDepartments': { $regex: new RegExp(department, 'i') } },
        { 'jobDescriptions.expandedDepartments': { $regex: new RegExp(department, 'i') } }
      ]
    });

    // Calculate top companies by openings
    const companyStats = {};
    
    companies.forEach(company => {
      const companyName = company.companyName;
      if (!companyStats[companyName]) {
        companyStats[companyName] = {
          name: companyName,
          openings: 0,
          packages: []
        };
      }
      
      company.jobDescriptions?.forEach(job => {
        companyStats[companyName].openings += parseInt(job.openings || 0);
        if (job.ctc) {
          companyStats[companyName].packages.push(parseFloat(job.ctc));
        }
      });
    });

    // Convert to array and sort by openings
    const topCompanies = Object.values(companyStats)
      .sort((a, b) => b.openings - a.openings)
      .slice(0, 10);

    res.json({
      topCompanies,
      totalCompanies: companies.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/hod/calendar - Get campus visits for a specific department
router.get('/calendar', async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: 'Department parameter is required' });
    }

    const companies = await Form.find({
      $or: [
        { 'jobDescriptions.eligibleDepartments': { $regex: new RegExp(department, 'i') } },
        { 'jobDescriptions.expandedDepartments': { $regex: new RegExp(department, 'i') } }
      ]
    });

    // Extract campus visits
    const events = [];
    companies.forEach(company => {
      if (company.campusVisits && company.campusVisits.length > 0) {
        company.campusVisits.forEach(visit => {
          events.push({
            company: company.companyName,
            date: visit.startDate,
            stage: visit.stageName,
            id: visit.id
          });
        });
      }
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET /api/hod/comparison - Get comparison data for all departments
router.get('/comparison', async (req, res) => {
  try {
    const departments = [
      'Computer Science & Engineering Department (CSED)',
      'Mechanical Engineering Department (MED)',
      'Electrical & Instrumentation Department (EID)',
      'Electronics & Communication Department (ECD)',
      'Civil Engineering Department (CED)',
      'Bio-Technology Department (BTD)',
      'Chemical Engineering Department (CHED)',
      'Department of Energy and Environment (DEE)'
    ];

    const comparisonData = [];

    for (const dept of departments) {
      const companies = await Form.find({
        $or: [
          { 'jobDescriptions.eligibleDepartments': { $regex: new RegExp(dept, 'i') } },
          { 'jobDescriptions.expandedDepartments': { $regex: new RegExp(dept, 'i') } }
        ]
      });

      let totalOpenings = 0;
      let packages = [];

      companies.forEach(company => {
        company.jobDescriptions?.forEach(job => {
          totalOpenings += parseInt(job.openings || 0);
          if (job.ctc) {
            packages.push(parseFloat(job.ctc));
          }
        });
      });

      const avgPackage = packages.length > 0 
        ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
        : 0;

      comparisonData.push({
        department: dept,
        shortName: getDepartmentShortName(dept),
        companies: companies.length,
        openings: totalOpenings,
        avgPackage: parseFloat(avgPackage)
      });
    }

    // Sort by number of companies
    comparisonData.sort((a, b) => b.companies - a.companies);

    res.json(comparisonData);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// GET /api/hod/students - Get student data for a specific department
router.get('/students', async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: 'Department parameter is required' });
    }

    // Mock student data for now (replace with actual student schema when available)
    const mockStudents = [
      { name: 'Student 1', batch: '2026', eligible: true, placed: true },
      { name: 'Student 2', batch: '2026', eligible: true, placed: false },
      { name: 'Student 3', batch: '2025', eligible: true, placed: true },
      { name: 'Student 4', batch: '2025', eligible: false, placed: false },
      { name: 'Student 5', batch: '2026', eligible: true, placed: true }
    ];

    res.json(mockStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

module.exports = router;
