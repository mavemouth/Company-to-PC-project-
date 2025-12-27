const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  getAssignedRequests, 
  updateRequestStatus, 
  getAssignmentStats,
  RequestAssignment 
} = require('../utils/requestDistributor');
const Form = require('../models/Form');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to optionally verify user from token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

// Middleware to get user email from token or query
const getUserEmail = (req) => {
  // Try to get from authenticated user
  if (req.user && req.user.email) {
    return req.user.email;
  }
  
  // Try to get from query parameter (fallback)
  if (req.query.email) {
    return req.query.email;
  }
  
  return null;
};

// Get assigned followup member for a specific HR
router.get('/hr-assignment', async (req, res) => {
  try {
    const { hrEmail } = req.query;
    
    if (!hrEmail) {
      return res.status(400).json({ error: 'HR email is required' });
    }
    
    // Find the assignment for this HR
    const assignment = await RequestAssignment.findOne({ hrEmail });
    
    if (!assignment) {
      return res.json({ assignedTo: null });
    }
    
    // Get the followup team member details
    const followupMember = await User.findOne({ email: assignment.assignedTo });
    
    res.json({
      assignedTo: {
        name: followupMember?.name || 'Follow-up Team',
        email: assignment.assignedTo
      }
    });
  } catch (error) {
    console.error('Error fetching HR assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Get requests assigned to logged-in team member
router.get('/assigned-requests', optionalAuth, async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Verify user is followup team
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== 'FOLLOW_UP_TEAM') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const requests = await getAssignedRequests(userEmail);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching assigned requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get today's tasks for the logged-in team member
router.get('/tasks/today', optionalAuth, async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Verify user is followup team
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== 'FOLLOW_UP_TEAM') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all assignments for this team member
    const assignments = await RequestAssignment.find({
      assignedTo: userEmail,
      status: { $in: ['pending', 'in_progress'] }
    }).sort({ createdAt: -1 });

    const tasks = await Promise.all(
      assignments.map(async (assignment) => {
        const form = await Form.findById(assignment.formId);
        return {
          id: assignment._id,
          companyName: assignment.companyName,
          hrEmail: assignment.hrEmail,
          hrName: assignment.hrName,
          status: assignment.status || 'pending',
          createdAt: assignment.createdAt,
          title: `Follow up with ${assignment.companyName}`,
          description: `Contact ${assignment.hrName || assignment.hrEmail} regarding hiring process`,
          form: form
        };
      })
    );

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get analytics for logged-in team member
router.get('/analytics', optionalAuth, async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Verify user is followup team
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== 'FOLLOW_UP_TEAM') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await getAssignmentStats(userEmail);
    
    const assignments = await RequestAssignment.find({
      assignedTo: userEmail
    }).sort({ createdAt: -1 });

    res.json({
      totalAssigned: stats.total,
      completedTasks: stats.completed,
      inProgress: stats.inProgress,
      pending: stats.pending,
      completionRate: stats.completionRate,
      successRate: stats.successRate,
      responseTime: 2, // Mock data for now
      satisfaction: 85, // Mock data for now
      recentActivity: assignments.slice(0, 10).map(a => ({
        companyName: a.companyName,
        status: a.status,
        assignedAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get calendar events for logged-in team member
router.get('/calendar', optionalAuth, async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Verify user is followup team
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== 'FOLLOW_UP_TEAM') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const assignments = await RequestAssignment.find({
      assignedTo: userEmail
    });

    const events = [];
    
    for (const assignment of assignments) {
      const form = await Form.findById(assignment.formId);
      if (form && form.campusVisits && form.campusVisits.length > 0) {
        form.campusVisits.forEach(visit => {
          if (visit.startDate) {
            events.push({
              id: visit.id || visit._id,
              companyName: assignment.companyName,
              stageName: visit.stageName || 'Campus Visit',
              visitDate: visit.startDate,
              startDate: visit.startDate,
              hrEmail: assignment.hrEmail,
              status: assignment.status
            });
          }
        });
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Update request status
router.put('/request/:id/status', optionalAuth, async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Verify user is followup team
    const user = await User.findOne({ email: userEmail });
    if (!user || user.role !== 'FOLLOW_UP_TEAM') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    const result = await updateRequestStatus(req.params.id, status);
    
    if (result.success) {
      res.json({ success: true, message: 'Status updated' });
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
