const express = require("express");
const router = express.Router();
const Form = require("../../../models/Form");

// GET: View all submissions (for dashboard)
router.get("/", async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ error: "Error fetching submissions" });
  }
});

// GET: View a specific submission by ID
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Submission not found" });
    }
    res.json(form);
  } catch (err) {
    console.error("❌ Error fetching submission:", err);
    res.status(500).json({ error: "Error fetching submission" });
  }
});

module.exports = router;
