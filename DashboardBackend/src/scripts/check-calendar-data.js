const mongoose = require("mongoose");
const Form = require("../models/Form");

async function checkCalendarData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "ctpc_form",
    });
    console.log("✅ Connected to MongoDB");

    // Find all forms with campus visits
    const formsWithVisits = await Form.find({
      "campusVisits.0": { $exists: true },
    });

    console.log(
      `\n📊 Total forms with campus visits: ${formsWithVisits.length}`
    );

    // Check CSED department specifically
    const csedForms = await Form.find({
      $or: [
        {
          "jobDescriptions.eligibleDepartments": {
            $regex: /Computer Science & Engineering Department \(CSED\)/i,
          },
        },
        {
          "jobDescriptions.expandedDepartments": {
            $regex: /Computer Science & Engineering Department \(CSED\)/i,
          },
        },
      ],
    });

    console.log(`\n📋 Total CSED forms: ${csedForms.length}`);

    const csedFormsWithVisits = csedForms.filter(
      (form) => form.campusVisits && form.campusVisits.length > 0
    );

    console.log(
      `📅 CSED forms with campus visits: ${csedFormsWithVisits.length}`
    );

    if (csedFormsWithVisits.length > 0) {
      console.log("\n🔍 Sample CSED campus visits:");
      csedFormsWithVisits.slice(0, 5).forEach((form, index) => {
        console.log(
          `\n${index + 1}. Company: ${form.companyName || "Unknown"}`
        );
        form.campusVisits.forEach((visit) => {
          console.log(`   - Date: ${visit.startDate}`);
          console.log(`   - Stage: ${visit.stageName}`);
        });
      });
    }

    // Check what the API would return
    const events = [];
    csedForms.forEach((company) => {
      if (company.campusVisits && company.campusVisits.length > 0) {
        company.campusVisits.forEach((visit) => {
          events.push({
            company: company.companyName,
            date: visit.startDate,
            stage: visit.stageName,
            id: visit.id,
          });
        });
      }
    });

    console.log(`\n📡 Total events API would return: ${events.length}`);
    console.log("Sample events:", events.slice(0, 3));

    await mongoose.connection.close();
    console.log("\n✅ Check complete");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCalendarData();
