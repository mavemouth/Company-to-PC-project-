const express = require('express');
const mongoose = require('mongoose');
const { authenticateToken } = require('../../../middleware/auth');
const router = express.Router();

// Connect to FormBackend database to fetch form submissions
const FormSubmission = mongoose.model('HRForm', new mongoose.Schema({
  companyName: String,
  website: String,
  location: String,
  hrContacts: [{
    id: String,
    name: String,
    email: String,
    phone: String,
  }],
  jobDescriptions: [{
    id: String,
    title: String,
    type: String,
    internshipDuration: String,
    conditions: String,
    openings: String,
    skills: String,
    degreePreferences: [String],
    ctc: String,
    stipend: String,
    allowances: String,
    cutoff: String,
    eligibleDepartments: [String],
    eligibleBatches: [String]
  }],
  hiringStages: [{
    stage: String,
    mode: String
  }],
  campusVisits: [{
    id: String,
    startDate: Date,
    stageName: String
  }],
  uploadedFiles: [String],
  submittedAt: { type: Date, default: Date.now }
}, { collection: 'hrforms' }));

// Debug endpoint to check all form submissions (temporary - remove in production)
router.get('/debug/all-submissions', async (req, res) => {
  try {
    const allSubmissions = await FormSubmission.find({});
    console.log('🔍 Total submissions in database:', allSubmissions.length);
    res.json({ 
      success: true, 
      count: allSubmissions.length,
      submissions: allSubmissions.map(s => ({
        id: s._id,
        companyName: s.companyName,
        hrEmails: s.hrContacts.map(hr => hr.email),
        submittedAt: s.submittedAt
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's form submissions (with debugging)
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Submissions request received');
    console.log('👤 User:', req.user);
    
    const userEmail = req.user?.email;
    if (!userEmail) {
      console.log('❌ No user email found');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('📧 Searching for submissions with email:', userEmail);

    // Find all form submissions for this user's email
    const submissions = await FormSubmission.find({
      'hrContacts.email': userEmail
    }).sort({ submittedAt: -1 });

    console.log('📝 Found submissions:', submissions.length);
    
    if (submissions.length > 0) {
      console.log('✅ First submission:', JSON.stringify(submissions[0], null, 2));
    }

    // Transform data for dashboard display
    const hiringRequests = submissions.map(submission => {
      const primaryHR = submission.hrContacts.find(hr => hr.email === userEmail) || submission.hrContacts[0];
      const primaryJob = submission.jobDescriptions[0] || {};
      
      return {
        id: submission._id.toString(),
        companyName: submission.companyName || 'Unknown Company',
        jobTitle: primaryJob.title || 'No Title',
        jobType: primaryJob.type || 'Not specified',
        status: 'pending', // Default status for new submissions
        createdAt: submission.submittedAt,
        hrContact: {
          name: primaryHR.name || 'Unknown',
          email: primaryHR.email || '',
          phone: primaryHR.phone || ''
        },
        jobDescription: {
          openings: parseInt(primaryJob.openings) || 0,
          ctc: primaryJob.ctc || primaryJob.stipend || 'Not specified',
          location: submission.location || 'Not specified',
          skills: primaryJob.skills ? primaryJob.skills.split(',').map(s => s.trim()) : []
        },
        website: submission.website,
        conditions: primaryJob.conditions,
        eligibleDepartments: primaryJob.eligibleDepartments || [],
        eligibleBatches: primaryJob.eligibleBatches || [],
        hiringStages: submission.hiringStages || [],
        campusVisits: submission.campusVisits || []
      };
    });

    res.json({ 
      success: true, 
      data: hiringRequests 
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// HR Dashboard routes  
router.get('/dashboard', (req, res) => {
  res.json({ message: 'HR Dashboard data', data: {} });
});

router.get('/applications', (req, res) => {
  res.json({ message: 'HR Applications', data: [] });
});

router.get('/companies', (req, res) => {
  res.json({ message: 'HR Companies', data: [] });
});

module.exports = router;