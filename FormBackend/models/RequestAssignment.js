const mongoose = require('mongoose');

const requestAssignmentSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  hrEmail: {
    type: String,
    required: true
  },
  hrName: {
    type: String
  },
  assignedTo: {
    type: String, // Email of followup team member
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'on_hold'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  lastContactDate: {
    type: Date
  },
  nextFollowupDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
requestAssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RequestAssignment = mongoose.model('RequestAssignment', requestAssignmentSchema);

module.exports = RequestAssignment;
