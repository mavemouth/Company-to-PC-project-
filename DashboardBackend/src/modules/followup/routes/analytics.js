const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../../../middleware/auth');
const Company = require('../../../models/company');

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get daily metrics for the past month
    const dailyMetrics = await Company.aggregate([
      {
        $match: {
          updatedAt: { $gte: oneMonthAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          companiesHandled: { $sum: 1 },
          responseTime: { $avg: { 
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              60000 // Convert to minutes
            ]
          }},
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Transform the data for frontend consumption
    const analytics = dailyMetrics.map(metric => ({
      date: metric._id,
      metrics: {
        companiesHandled: metric.companiesHandled,
        responseTime: Math.round(metric.responseTime || 0),
        status: {
          COMPLETED: metric.completed,
          IN_PROGRESS: metric.inProgress,
          PENDING: metric.pending
        }
      }
    }));

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;