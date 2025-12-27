const express = require('express');
const router = express.Router();
const { RequestAssignment } = require('../utils/requestDistributor');
const User = require('../models/User');

// Get team-wide progress (all followup members)
router.get('/team-progress', async (req, res) => {
  try {
    // Get all followup team members
    const followupMembers = await User.find({ role: 'FOLLOW_UP_TEAM' }).sort({ name: 1 });

    const teamProgress = await Promise.all(
      followupMembers.map(async (member) => {
        const totalAssigned = await RequestAssignment.countDocuments({
          assignedTo: member.email
        });

        const completed = await RequestAssignment.countDocuments({
          assignedTo: member.email,
          status: 'completed'
        });

        const inProgress = await RequestAssignment.countDocuments({
          assignedTo: member.email,
          status: 'in_progress'
        });

        const pending = await RequestAssignment.countDocuments({
          assignedTo: member.email,
          status: 'pending'
        });

        return {
          name: member.name || member.email.split('@')[0],
          email: member.email,
          totalAssigned,
          completed,
          inProgress,
          pending,
          completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0
        };
      })
    );

    res.json(teamProgress);
  } catch (error) {
    console.error('Error fetching team progress:', error);
    res.status(500).json({ error: 'Failed to fetch team progress' });
  }
});

module.exports = router;
