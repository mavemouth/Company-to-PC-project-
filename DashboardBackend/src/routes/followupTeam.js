const express = require('express');
const router = express.Router();
const {
  CompanyAssignment,
  CalendarEvent,
  ChatMessage,
  Task,
  Notification,
  Analytics
} = require('../models/followupTeam');

// Middleware to check if user is a follow-up team member
const isFollowUpTeam = (req, res, next) => {
  if (req.user && req.user.role === 'FOLLOW_UP_TEAM') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Follow-up team members only.' });
  }
};

// Get assigned companies for a team member
router.get('/my-companies', isFollowUpTeam, async (req, res) => {
  try {
    const assignments = await CompanyAssignment.find({ teamMemberId: req.user.email });
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Get today's calendar events
router.get('/calendar/today', isFollowUpTeam, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await CalendarEvent.find({
      eventDate: { $gte: today, $lt: tomorrow }
    });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar events' });
  }
});

// Get chat messages for a company
router.get('/chat/:companyId', isFollowUpTeam, async (req, res) => {
  try {
    const chat = await ChatMessage.findOne({
      companyId: req.params.companyId,
      teamMemberId: req.user.email
    });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// Send a chat message
router.post('/chat/:companyId', isFollowUpTeam, async (req, res) => {
  try {
    const { content } = req.body;
    await ChatMessage.findOneAndUpdate(
      { companyId: req.params.companyId, teamMemberId: req.user.email },
      {
        $push: {
          messages: {
            sender: req.user.email,
            content,
            timestamp: new Date(),
            read: false
          }
        }
      },
      { upsert: true }
    );
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get today's tasks
router.get('/tasks/today', isFollowUpTeam, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      assignedTo: req.user.email,
      dueDate: { $gte: today, $lt: tomorrow }
    });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get analytics data
router.get('/analytics', isFollowUpTeam, async (req, res) => {
  try {
    const analytics = await Analytics.find({
      teamMemberId: req.user.email,
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
      }
    });
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Get unread notifications
router.get('/notifications', isFollowUpTeam, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.email,
      read: false
    }).sort({ timestamp: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', isFollowUpTeam, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;