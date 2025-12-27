const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fetch = require('cross-fetch');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Form = require('./models/Form');
const { generatePassword } = require('./utils/passwordGenerator');
const { assignRequestToFollowup } = require('./utils/requestDistributor');
const authRoutes = require('./routes/auth');
const { auth, authorize } = require('./middleware/auth');
const followupRoutes = require('./routes/followup');
const messageRoutes = require('./routes/messages');
const teamProgressRoutes = require('./routes/teamProgress');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/hr_form")
.then(() => {
  console.log("✅ MongoDB Connected to hr_form database");
  // Create indexes for email uniqueness
  return User.createIndexes();
})
.catch((err) => console.error("❌ MongoDB Error:", err));

// Storage for file uploads (job brochures, resumes, etc.)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----------- ROUTES -------------

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: 5000
  });
});

// POST: Submit form
app.post("/api/submit", upload.array("files", 5), async (req, res) => {
  try {
    console.log("📥 Request Headers:", req.headers);
    console.log("📥 Incoming Form Data:", req.body);
    console.log("📎 Incoming Files:", req.files);

    if (!req.body.formData) {
      return res.status(400).json({ error: "No form data received" });
    }

    let formData;
    try {
      formData = JSON.parse(req.body.formData);
      console.log("📄 Parsed Form Data:", JSON.stringify(formData, null, 2));
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return res.status(400).json({ error: "Invalid form data format" });
    }

    // Validate required fields
    if (!Array.isArray(formData.hrContacts) || formData.hrContacts.length === 0) {
      return res.status(400).json({ error: "At least one HR contact is required" });
    }

    if (!Array.isArray(formData.jobDescriptions) || formData.jobDescriptions.length === 0) {
      return res.status(400).json({ error: "At least one job description is required" });
    }

    // Process and validate the data
    formData.jobDescriptions = formData.jobDescriptions.map(job => ({
      ...job,
      degreePreferences: Array.isArray(job.degreePreferences) ? job.degreePreferences : [],
      eligibleDepartments: Array.isArray(job.eligibleDepartments) ? job.eligibleDepartments : [],
      expandedDepartments: Array.isArray(job.expandedDepartments) ? job.expandedDepartments : [],
      eligibleBatches: Array.isArray(job.eligibleBatches) ? job.eligibleBatches : []
    }));

    // Get file paths if any files were uploaded
    const uploadedFiles = req.files ? req.files.map(file => file.path) : [];

    console.log("💾 Creating form object with data:");
    console.log("📝 Form data keys:", Object.keys(formData));
    console.log("📎 Uploaded files:", uploadedFiles.length);

    const newForm = new Form({
      ...formData,
      uploadedFiles,
      campusVisits: formData.campusVisits.map(visit => ({
        ...visit,
        startDate: visit.startDate ? new Date(visit.startDate) : null
      }))
    });

    console.log("📋 Form object created, attempting save...");
    
    // Test database connection before saving
    try {
      const dbState = mongoose.connection.readyState;
      console.log("🔌 Database connection state:", dbState === 1 ? "Connected" : "Disconnected");
      
      if (dbState !== 1) {
        throw new Error("Database not connected");
      }
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError);
      return res.status(500).json({ error: "Database connection failed" });
    }

    try {
      const savedForm = await newForm.save();
      console.log("✅ Form saved successfully!");
      console.log("🆔 Saved form ID:", savedForm._id);
      console.log("🏢 Saved company:", savedForm.companyName);
      
      // Verify the save by trying to find it immediately
      const verifyForm = await Form.findById(savedForm._id);
      if (verifyForm) {
        console.log("✅ Verification: Form found in database");
      } else {
        console.log("⚠️ Warning: Form not found in verification check");
      }

      // Assign to followup team member
      const hrContact = formData.hrContacts[0];
      const assignmentResult = await assignRequestToFollowup(
        savedForm._id,
        savedForm.companyName,
        hrContact.email,
        hrContact.name
      );

      if (assignmentResult.success) {
        console.log(`✅ Assigned to followup member: ${assignmentResult.assignedMember.name}`);
      } else {
        console.error(`⚠️ Failed to assign to followup team: ${assignmentResult.error}`);
      }
      
    } catch (saveError) {
      console.error("❌ Form save error:", saveError);
      return res.status(500).json({ error: "Failed to save form: " + saveError.message });
    }

    // Handle HR user creation and credentials
    try {
      // Check if HR user already exists
      const hrEmail = formData.hrContacts[0].email;
      console.log("🔍 Checking for existing user with email:", hrEmail);
      let user = await User.findOne({ email: hrEmail });
      console.log("🔍 Existing user found:", user);
      let credentials;

      if (!user) {
        // Create new HR user
        console.log("🔑 Generating temporary password...");
        const tempPassword = generatePassword();
        console.log("👤 Creating new HR user with email:", hrEmail);
        
        user = new User({
          email: hrEmail,
          password: tempPassword,
          role: 'HR',
          company: formData.hrContacts[0].name,
          name: formData.hrContacts[0].name
        });

        console.log("💾 Saving user to database...");
        await user.save();
        console.log("✅ User saved successfully");
        console.log("✅ HR User created:", { email: hrEmail });

        // Sync with Dashboard Backend
        try {
          // Hash password for syncing to maintain consistency
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          
          const syncResponse = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: hrEmail,
              password: hashedPassword,
              isHashedPassword: true,  // Flag to indicate password is already hashed
              company: formData.hrContacts[0].name,
              name: formData.hrContacts[0].name,
              role: 'hr'
            })
          });

          if (!syncResponse.ok) {
            console.error("❌ Failed to sync with dashboard");
          } else {
            console.log("✅ User synced with dashboard");
          }
        } catch (syncError) {
          console.error("❌ Dashboard sync error:", syncError);
        }

        credentials = {
          email: hrEmail,
          password: tempPassword
        };
      }

      // Send response based on whether it's a new or existing user
      res.status(201).json({
        success: true,
        message: credentials 
          ? "Form submitted successfully! Please use these credentials to access your dashboard."
          : "Form submitted successfully! Please use your existing credentials to access the dashboard.",
        credentials,
        dashboardUrl: "http://localhost:3002/login"
      });
    } catch (error) {
      console.error("❌ Error handling HR user:", error);
      res.status(500).json({ error: "Error processing form submission" });
    }
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    res.status(500).json({ error: "Error submitting form", details: error.message });
  }
});

// GET: View all submissions (for dashboard)
app.get("/api/submissions", async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ error: "Error fetching submissions" });
  }
});

// GET: View all submissions
app.get("/api/forms", async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    console.error("❌ Error fetching forms:", err);
    res.status(500).json({ error: "Error fetching forms" });
  }
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount user management routes
app.use('/api/users', userRoutes);

// Mount followup team routes
app.use('/api/followup', followupRoutes);

// Mount messaging routes
app.use('/api/messages', messageRoutes);

// Mount team progress routes
app.use('/api/team', teamProgressRoutes);

// Start server
const PORT = 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Server accessible on all interfaces`);
  
  // Test the connection immediately
  setTimeout(() => {
    console.log("🔍 Testing server connectivity...");
  }, 1000);
});
