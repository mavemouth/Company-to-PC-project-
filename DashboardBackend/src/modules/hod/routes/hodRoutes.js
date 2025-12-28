//For local run use http://localhost:5000 on ${process.env.FRONTEND_URL}.
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Form Schema (reusing the existing schema)
const formSchema = new mongoose.Schema(
  {
    companyName: String,
    hrContacts: Array,
    jobDescriptions: Array,
    hiringStages: Array,
    campusVisits: Array,
    uploadedFiles: Array,
    createdAt: { type: Date, default: Date.now },
    status: String,
  },
  { collection: "forms" }
); // Explicitly specify collection name

const Form = mongoose.model("Form", formSchema);

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
router.get("/companies", async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res
        .status(400)
        .json({ error: "Department parameter is required" });
    }

    console.log(`🔍 Fetching companies for department: ${department}`);

    // Fetch ALL forms from FormBackend (same as HR dashboard does)
    const fetch = (await import("node-fetch")).default;
    const formsResponse = await fetch(
      `${process.env.FRONTEND_URL}/api/submissions`
    );

    if (!formsResponse.ok) {
      throw new Error(`FormBackend returned ${formsResponse.status}`);
    }

    const allForms = await formsResponse.json();

    // Filter forms by department
    const departmentForms = allForms.filter((form) => {
      if (!form.jobDescriptions || form.jobDescriptions.length === 0)
        return false;

      return form.jobDescriptions.some((job) => {
        // Check eligibleDepartments
        const eligibleMatch =
          job.eligibleDepartments &&
          job.eligibleDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );

        // Check expandedDepartments
        const expandedMatch =
          job.expandedDepartments &&
          job.expandedDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );

        return eligibleMatch || expandedMatch;
      });
    });

    console.log(
      `✅ Found ${departmentForms.length} companies for ${department}`
    );
    res.json(departmentForms);
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// GET /api/hod/analytics - Get analytics for a specific department
router.get("/analytics", async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res
        .status(400)
        .json({ error: "Department parameter is required" });
    }

    // Fetch ALL forms from FormBackend
    const fetch = (await import("node-fetch")).default;
    const formsResponse = await fetch(
      `${process.env.FRONTEND_URL}/api/submissions`
    );

    if (!formsResponse.ok) {
      throw new Error(`FormBackend returned ${formsResponse.status}`);
    }

    const allForms = await formsResponse.json();

    // Filter forms by department
    const departmentForms = allForms.filter((form) => {
      if (!form.jobDescriptions || form.jobDescriptions.length === 0)
        return false;

      return form.jobDescriptions.some((job) => {
        const eligibleMatch =
          job.eligibleDepartments &&
          job.eligibleDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );
        const expandedMatch =
          job.expandedDepartments &&
          job.expandedDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );
        return eligibleMatch || expandedMatch;
      });
    });

    // Calculate top companies by openings
    const companyStats = {};

    departmentForms.forEach((company) => {
      const companyName = company.companyName || "Unknown Company";
      if (!companyStats[companyName]) {
        companyStats[companyName] = {
          name: companyName,
          openings: 0,
          packages: [],
        };
      }

      company.jobDescriptions?.forEach((job) => {
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
      totalCompanies: departmentForms.length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /api/hod/calendar - Get campus visits for a specific department
router.get("/calendar", async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res
        .status(400)
        .json({ error: "Department parameter is required" });
    }

    console.log(`📅 Fetching calendar events for department: ${department}`);

    // Fetch ALL forms from FormBackend (same as HR dashboard does)
    const fetch = (await import("node-fetch")).default;
    const formsResponse = await fetch(
      `${process.env.FRONTEND_URL}/api/submissions`
    );

    if (!formsResponse.ok) {
      throw new Error(`FormBackend returned ${formsResponse.status}`);
    }

    const allForms = await formsResponse.json();
    console.log(`📊 Total forms fetched: ${allForms.length}`);

    // Filter forms by department (check if ANY job description is eligible for this department)
    const departmentForms = allForms.filter((form) => {
      if (!form.jobDescriptions || form.jobDescriptions.length === 0)
        return false;

      return form.jobDescriptions.some((job) => {
        // Check eligibleDepartments
        const eligibleMatch =
          job.eligibleDepartments &&
          job.eligibleDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );

        // Check expandedDepartments
        const expandedMatch =
          job.expandedDepartments &&
          job.expandedDepartments.some(
            (dept) =>
              dept && dept.toLowerCase().includes(department.toLowerCase())
          );

        return eligibleMatch || expandedMatch;
      });
    });

    console.log(`🎯 Forms matching ${department}: ${departmentForms.length}`);

    // Extract campus visits from filtered forms
    const events = [];
    departmentForms.forEach((form) => {
      if (form.campusVisits && form.campusVisits.length > 0) {
        form.campusVisits.forEach((visit) => {
          // Use company name or fallback to HR contact name
          const companyName =
            form.companyName ||
            (form.hrContacts && form.hrContacts[0]
              ? form.hrContacts[0].name
              : null) ||
            "Company";

          events.push({
            company: companyName,
            date: visit.startDate,
            stage: visit.stageName || "Campus Visit",
            id: visit.id,
          });
        });
      }
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(
      `✅ Returning ${events.length} calendar events for ${department}`
    );
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching calendar:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

// GET /api/hod/comparison - Get comparison data for all departments
router.get("/comparison", async (req, res) => {
  try {
    const departments = [
      "Computer Science & Engineering Department (CSED)",
      "Mechanical Engineering Department (MED)",
      "Electrical & Instrumentation Department (EID)",
      "Electronics & Communication Department (ECD)",
      "Civil Engineering Department (CED)",
      "Bio-Technology Department (BTD)",
      "Chemical Engineering Department (CHED)",
      "Department of Energy and Environment (DEE)",
    ];

    const comparisonData = [];

    for (const dept of departments) {
      const companies = await Form.find({
        $or: [
          {
            "jobDescriptions.eligibleDepartments": {
              $regex: new RegExp(dept, "i"),
            },
          },
          {
            "jobDescriptions.expandedDepartments": {
              $regex: new RegExp(dept, "i"),
            },
          },
        ],
      });

      let totalOpenings = 0;
      let packages = [];

      companies.forEach((company) => {
        company.jobDescriptions?.forEach((job) => {
          totalOpenings += parseInt(job.openings || 0);
          if (job.ctc) {
            packages.push(parseFloat(job.ctc));
          }
        });
      });

      const avgPackage =
        packages.length > 0
          ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
          : 0;

      comparisonData.push({
        department: dept,
        shortName: getDepartmentShortName(dept),
        companies: companies.length,
        openings: totalOpenings,
        avgPackage: parseFloat(avgPackage),
      });
    }

    // Sort by number of companies
    comparisonData.sort((a, b) => b.companies - a.companies);

    res.json(comparisonData);
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    res.status(500).json({ error: "Failed to fetch comparison data" });
  }
});

// GET /api/hod/students - Get student data for a specific department
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res
        .status(400)
        .json({ error: "Department parameter is required" });
    }

    // For now, return empty array until student schema is implemented
    // This will be populated when student registration/tracking is added
    res.json([]);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

module.exports = router;
