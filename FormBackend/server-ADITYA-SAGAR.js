// server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// ---------- MongoDB Connection ----------
mongoose.connect("mongodb://127.0.0.1:27017/hr_form", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Schema for form submissions
const formSchema = new mongoose.Schema({
  companyName: String,
  website: String,
  location: String,

  hrContacts: [
    {
      name: String,
      email: String,
      phone: String
    }
  ],

  jobDetails: [
    {
      title: String,
      openings: Number,
      internshipDuration: String,
      cutoff: String,
      allowances: String
    }
  ],

  jobBrochure: String, // PDF file
  resumeTemplate: String,
  createdAt: { type: Date, default: Date.now }
});

// ---------- API Routes ----------
// Submit Form
app.post("/api/submit", upload.fields([
  { name: "resumeTemplate", maxCount: 1 },
  { name: "jobBrochure", maxCount: 1 }
]), async (req, res) => {
  try {
    const { companyName, website, location, contacts, jobDescriptions } = req.body;

    const newForm = new Form({
      companyName,
      website,
      location,
      contacts: contacts ? JSON.parse(contacts) : [],
      jobDescriptions: jobDescriptions ? JSON.parse(jobDescriptions) : [],
      jobBrochure: req.files["jobBrochure"] ? req.files["jobBrochure"][0].path : null,
      resumeTemplate: req.files["resumeTemplate"] ? req.files["resumeTemplate"][0].path : null,
    });

    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting form", details: error });
  }
});

// Fetch All Submissions (for dashboard later)
app.get("/api/forms", async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    console.error("❌ Error fetching forms:", err);
    res.status(500).json({ error: "Error fetching forms", details: err.message });
  }
});

// ---------- Start Server ----------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));