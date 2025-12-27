const express = require('express');
const router = express.Router();

// ============================================
// 1. OVERVIEW DASHBOARD - System-wide Statistics
// ============================================
router.get('/overview', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Fetch all users from FormBackend
    const usersResponse = await fetch('http://localhost:5000/api/users/all');
    const users = await usersResponse.json();
    
    // Fetch all hiring requests
    const formsResponse = await fetch('http://localhost:5000/api/submissions');
    const forms = await formsResponse.json();
    
    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      usersByRole: {
        HR: users.filter(u => u.role === 'HR').length,
        HOD: users.filter(u => u.role === 'HOD').length,
        FOLLOW_UP_TEAM: users.filter(u => u.role === 'FOLLOW_UP_TEAM').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length
      },
      totalHiringRequests: forms.length,
      activeCompanies: new Set(forms.map(f => f.companyName)).size,
      recentSubmissions: forms.filter(f => {
        const submissionDate = new Date(f.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return submissionDate >= weekAgo;
      }).length,
      totalOpenings: forms.reduce((sum, form) => {
        return sum + form.jobDescriptions.reduce((jobSum, job) => 
          jobSum + (parseInt(job.openings) || 0), 0);
      }, 0),
      upcomingVisits: forms.flatMap(f => 
        (f.campusVisits || []).filter(v => new Date(v.startDate) > new Date())
      ).length
    };
    
    // Recent activity (last 10 submissions)
    const recentActivity = forms
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(f => ({
        id: f._id,
        company: f.companyName,
        type: 'Hiring Request',
        timestamp: f.createdAt,
        status: f.status || 'submitted'
      }));
    
    res.json({
      stats,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// ============================================
// 2. USER MANAGEMENT
// ============================================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/users/all');
    const users = await response.json();
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:userId', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/users/${req.params.userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/users/${req.params.userId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Reset user password
router.post('/users/:userId/reset-password', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/users/${req.params.userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ============================================
// 3. ALL HIRING REQUESTS (No Department Filter)
// ============================================
router.get('/hiring-requests', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/submissions');
    const forms = await response.json();
    
    res.json(forms);
  } catch (error) {
    console.error('Error fetching hiring requests:', error);
    res.status(500).json({ error: 'Failed to fetch hiring requests' });
  }
});

// Update hiring request (approve/reject/edit)
router.put('/hiring-requests/:requestId', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/submissions/${req.params.requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error updating hiring request:', error);
    res.status(500).json({ error: 'Failed to update hiring request' });
  }
});

// Delete hiring request
router.delete('/hiring-requests/:requestId', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/submissions/${req.params.requestId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error deleting hiring request:', error);
    res.status(500).json({ error: 'Failed to delete hiring request' });
  }
});

// ============================================
// 4. FOLLOW-UP TEAM MANAGEMENT
// ============================================

// Get all follow-up assignments
router.get('/followup-assignments', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/followup/all-assignments');
    const assignments = await response.json();
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Reassign follow-up member
router.post('/followup-assignments/reassign', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/followup/reassign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error reassigning:', error);
    res.status(500).json({ error: 'Failed to reassign' });
  }
});

// Get workload distribution
router.get('/followup-workload', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Define the three default follow-up team members (using .followup@ emails)
    const defaultMembers = [
      { name: 'Aditya', email: 'aditya.followup@thapar.edu' },
      { name: 'Shivam', email: 'shivam.followup@thapar.edu' },
      { name: 'Akshay', email: 'akshay.followup@thapar.edu' }
    ];
    
    // Get all follow-up users from database - accept both .followup@ and @thapar.edu emails
    const usersResponse = await fetch('http://localhost:5000/api/users/all');
    const users = await usersResponse.json();
    const followupUsers = users.filter(u => 
      u.role === 'FOLLOW_UP_TEAM'
    );
    
    // Merge default members with actual users (avoid duplicates)
    const emailSet = new Set();
    const allMembers = [];
    
    // Add default members first
    defaultMembers.forEach(member => {
      if (!emailSet.has(member.email)) {
        emailSet.add(member.email);
        allMembers.push(member);
      }
    });
    
    // Then add any additional database users
    followupUsers.forEach(user => {
      if (!emailSet.has(user.email)) {
        emailSet.add(user.email);
        allMembers.push({ name: user.name, email: user.email });
      }
    });
    
    // Get all hiring requests to check assignments
    let assignments = [];
    try {
      const formsResponse = await fetch('http://localhost:5000/api/submissions');
      const forms = await formsResponse.json();
      
      console.log(`📋 Found ${forms.length} total forms from FormBackend`);
      
      // Each form that has an assignedFollowup is an assignment
      assignments = forms
        .filter(f => f.assignedFollowup && f.assignedFollowup.email)
        .map(f => ({
          formId: f._id,
          companyName: f.companyName,
          assignedTo: f.assignedFollowup,
          status: f.followupStatus || 'pending',
          createdAt: f.createdAt,
          assignedAt: f.assignedAt || f.createdAt
        }));
      
      console.log(`✅ Found ${assignments.length} forms with assignedFollowup`);
      if (assignments.length > 0) {
        console.log('📧 Sample assignment emails:', assignments.map(a => a.assignedTo?.email || a.assignedTo));
      }
    } catch (err) {
      console.log('❌ Could not fetch assignments:', err.message);
    }
    
    // Calculate workload per member
    const workload = allMembers.map(member => {
      // Helper function to check if emails match (handle both aditya@thapar.edu and aditya.followup@thapar.edu)
      const emailsMatch = (email1, email2) => {
        if (!email1 || !email2) return false;
        if (email1 === email2) return true;
        
        // Extract base name (e.g., "aditya" from both "aditya@thapar.edu" and "aditya.followup@thapar.edu")
        const baseName1 = email1.split('@')[0].replace('.followup', '');
        const baseName2 = email2.split('@')[0].replace('.followup', '');
        
        return baseName1 === baseName2 && 
               email1.includes('@thapar.edu') && 
               email2.includes('@thapar.edu');
      };
      
      const memberAssignments = assignments.filter(a => 
        emailsMatch(a.assignedTo?.email, member.email) || 
        emailsMatch(a.assignedTo, member.email)
      );
      
      const completedCount = memberAssignments.filter(a => a.status === 'completed').length;
      const pendingCount = memberAssignments.filter(a => a.status === 'pending' || !a.status).length;
      
      return {
        name: member.name,
        email: member.email,
        totalAssignments: memberAssignments.length,
        completed: completedCount,
        pending: pendingCount,
        overdue: memberAssignments.filter(a => {
          // Consider as overdue if pending for more than 7 days
          if (a.status === 'completed') return false;
          const assignedDate = new Date(a.assignedAt || a.createdAt);
          const daysSince = (Date.now() - assignedDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince > 7;
        }).length
      };
    });
    
    console.log('📊 Follow-up workload calculated:', JSON.stringify(workload, null, 2));
    res.json(workload);
  } catch (error) {
    console.error('Error fetching workload:', error);
    // Return default members with 0 assignments on error
    res.json([
      { name: 'Aditya', email: 'aditya.followup@thapar.edu', totalAssignments: 0, completed: 0, pending: 0, overdue: 0 },
      { name: 'Shivam', email: 'shivam.followup@thapar.edu', totalAssignments: 0, completed: 0, pending: 0, overdue: 0 },
      { name: 'Akshay', email: 'akshay.followup@thapar.edu', totalAssignments: 0, completed: 0, pending: 0, overdue: 0 }
    ]);
  }
});

// ============================================
// 5. ANALYTICS & REPORTS
// ============================================
router.get('/analytics', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/submissions');
    const forms = await response.json();
    
    // Company-wise statistics
    const companyStats = {};
    forms.forEach(form => {
      if (!companyStats[form.companyName]) {
        companyStats[form.companyName] = {
          totalOpenings: 0,
          internships: 0,
          fulltime: 0,
          departments: new Set()
        };
      }
      
      form.jobDescriptions.forEach(job => {
        companyStats[form.companyName].totalOpenings += parseInt(job.openings) || 0;
        if (job.type === 'internship') companyStats[form.companyName].internships++;
        if (job.type === 'fulltime') companyStats[form.companyName].fulltime++;
        job.eligibleDepartments?.forEach(dept => 
          companyStats[form.companyName].departments.add(dept)
        );
      });
    });
    
    // Department-wise statistics
    const departmentStats = {};
    forms.forEach(form => {
      form.jobDescriptions.forEach(job => {
        (job.eligibleDepartments || []).forEach(dept => {
          if (!departmentStats[dept]) {
            departmentStats[dept] = { companies: new Set(), openings: 0 };
          }
          departmentStats[dept].companies.add(form.companyName);
          departmentStats[dept].openings += parseInt(job.openings) || 0;
        });
      });
    });
    
    // Convert Sets to arrays for JSON
    Object.keys(companyStats).forEach(company => {
      companyStats[company].departments = Array.from(companyStats[company].departments);
    });
    Object.keys(departmentStats).forEach(dept => {
      departmentStats[dept].companies = Array.from(departmentStats[dept].companies);
      departmentStats[dept].companyCount = departmentStats[dept].companies.length;
    });
    
    // Package distribution
    const packageRanges = {
      '0-5 LPA': 0,
      '5-10 LPA': 0,
      '10-15 LPA': 0,
      '15-20 LPA': 0,
      '20+ LPA': 0,
      'Internship': 0
    };
    
    forms.forEach(form => {
      form.jobDescriptions.forEach(job => {
        if (job.type === 'internship') {
          packageRanges['Internship']++;
        } else {
          const ctc = parseFloat(job.ctc) || 0;
          if (ctc < 5) packageRanges['0-5 LPA']++;
          else if (ctc < 10) packageRanges['5-10 LPA']++;
          else if (ctc < 15) packageRanges['10-15 LPA']++;
          else if (ctc < 20) packageRanges['15-20 LPA']++;
          else packageRanges['20+ LPA']++;
        }
      });
    });
    
    // Placement trends (by month)
    const trends = {};
    forms.forEach(form => {
      const month = new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      trends[month] = (trends[month] || 0) + 1;
    });
    
    res.json({
      companyStats,
      departmentStats,
      packageRanges,
      trends,
      summary: {
        totalCompanies: Object.keys(companyStats).length,
        totalDepartments: Object.keys(departmentStats).length,
        totalOpenings: forms.reduce((sum, form) => 
          sum + form.jobDescriptions.reduce((jobSum, job) => 
            jobSum + (parseInt(job.openings) || 0), 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================
// 6. CALENDAR - All Campus Visits
// ============================================
router.get('/calendar', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/submissions');
    const forms = await response.json();
    
    // Get all campus visits across all departments
    const allVisits = forms.flatMap(form => 
      (form.campusVisits || []).map(visit => ({
        id: visit.id,
        company: form.companyName,
        date: visit.startDate,
        stage: visit.stageName,
        departments: form.jobDescriptions.flatMap(job => 
          [...(job.eligibleDepartments || []), ...(job.expandedDepartments || [])]
        )
      }))
    );
    
    res.json(allVisits);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// ============================================
// 7. DEPARTMENTS
// ============================================
router.get('/departments', async (req, res) => {
  try {
    // Predefined list of departments
    const departments = [
      { name: "Computer Science & Engineering Department (CSED)", code: "CSED" },
      { name: "Computer Engineering (COE)", code: "COE" },
      { name: "Electronics and Communication Engineering", code: "ECE" },
      { name: "Electrical Engineering", code: "EE" },
      { name: "Mechanical Engineering", code: "ME" },
      { name: "Civil Engineering", code: "CE" },
      { name: "Chemical Engineering", code: "CHE" },
      { name: "Biotechnology", code: "BT" },
      { name: "Mathematics", code: "MATH" },
      { name: "Physics", code: "PHY" }
    ];
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

module.exports = router;