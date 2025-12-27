const mongoose = require('mongoose');

// Schema for company assignments to team members
const companyAssignmentSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  teamMemberId: { type: String, required: true }, // email of team member
  assignedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  }
});

// Schema for calendar events
const calendarEventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventType: {
    type: String,
    enum: ['INTERVIEW', 'PPT', 'TEST'],
    required: true
  },
  location: { type: String, required: true },
  assignedTeamMember: { type: String, required: true }, // email of team member
  status: {
    type: String,
    enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'UPCOMING'
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Schema for chat messages
const chatMessageSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  teamMemberId: { type: String, required: true },
  messages: [{
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
});

// Schema for tasks
const taskSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  assignedTo: { type: String, required: true }, // team member email
  type: {
    type: String,
    enum: ['COORDINATION', 'FOLLOW_UP', 'VISIT'],
    required: true
  },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  }
});

// Schema for notifications
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ['NEW_MESSAGE', 'SCHEDULE_CHANGE', 'TASK_ASSIGNED'],
    required: true
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// Schema for analytics
const analyticsSchema = new mongoose.Schema({
  teamMemberId: { type: String, required: true },
  date: { type: Date, required: true },
  metrics: {
    companiesHandled: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    messagesExchanged: { type: Number, default: 0 }
  }
});

module.exports = {
  CompanyAssignment: mongoose.model('CompanyAssignment', companyAssignmentSchema),
  CalendarEvent: mongoose.model('CalendarEvent', calendarEventSchema),
  ChatMessage: mongoose.model('ChatMessage', chatMessageSchema),
  Task: mongoose.model('Task', taskSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};