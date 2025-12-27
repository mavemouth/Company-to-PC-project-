const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../../../middleware/auth');
const Company = require('../../../models/company');

// Get all companies
router.get('/', auth, async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get a single company
router.get('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('history.user', 'name email');

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    
    res.json({ success: true, company });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update company status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    company.status = status;
    company.lastContact = new Date();
    company.history.push({
      action: `Status updated to ${status}`,
      user: req.user.id,
      notes
    });

    await company.save();
    
    const populatedCompany = await Company.findById(company._id)
      .populate('assignedTo', 'name email')
      .populate('history.user', 'name email');
    
    res.json({ success: true, company: populatedCompany });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add note to company
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    company.notes = notes;
    company.history.push({
      action: 'Note added',
      user: req.user.id,
      notes
    });

    await company.save();
    
    const populatedCompany = await Company.findById(company._id)
      .populate('assignedTo', 'name email')
      .populate('history.user', 'name email');
    
    res.json({ success: true, company: populatedCompany });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Assign company to team member
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    company.assignedTo = userId;
    company.history.push({
      action: 'Assigned to team member',
      user: req.user.id,
      notes: `Assigned to user ${userId}`
    });

    await company.save();
    
    const populatedCompany = await Company.findById(company._id)
      .populate('assignedTo', 'name email')
      .populate('history.user', 'name email');
    
    res.json({ success: true, company: populatedCompany });
  } catch (error) {
    console.error('Error assigning company:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;