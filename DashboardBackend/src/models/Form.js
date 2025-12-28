const mongoose = require("mongoose");

// Schema for HR form
const formSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  hrContacts: {
    type: [
      {
        id: String,
        name: String,
        email: String,
        phone: String,
      },
    ],
    required: true,
    _id: false, // Prevent MongoDB from adding _id to subdocuments
  },
  jobDescriptions: {
    type: [
      {
        _id: false, // Prevent MongoDB from adding _id to subdocuments
        id: String,
        title: { type: String, default: "" },
        type: { type: String, default: "internship" },
        internshipDuration: { type: String, default: "" },
        conditions: { type: String, default: "" },
        openings: { type: String, default: "" },
        skills: { type: String, default: "" },
        degreePreferences: { type: [String], default: [] },
        ctc: { type: String, default: "" },
        stipend: { type: String, default: "" },
        allowances: { type: String, default: "" },
        cutoff: { type: String, default: "" },
        eligibleDepartments: { type: [String], default: [] },
        expandedDepartments: { type: [String], default: [] },
        eligibleBatches: { type: [String], default: [] },
      },
    ],
    required: true,
  },
  hiringStages: {
    type: [
      {
        _id: false, // Prevent MongoDB from adding _id to subdocuments
        stage: String,
        mode: { type: String, default: "online" },
      },
    ],
    default: [],
  },
  campusVisits: {
    type: [
      {
        _id: false, // Prevent MongoDB from adding _id to subdocuments
        id: String,
        startDate: { type: Date, default: null },
        stageName: String,
      },
    ],
    default: [],
  },
  uploadedFiles: {
    type: [String],
    default: [],
  },
  assignedFollowup: {
    type: {
      _id: false, // Prevent MongoDB from adding _id
      name: String,
      email: String,
    },
    default: null,
  },
  assignedAt: {
    type: Date,
    default: null,
  },
  followupStatus: {
    type: String,
    enum: ["pending", "in-progress", "completed", "on-hold"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
