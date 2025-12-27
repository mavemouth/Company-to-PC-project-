const RequestAssignment = require('../models/RequestAssignment');
const User = require('../models/User');
const Form = require('../models/Form');

/**
 * Get all followup team members
 */
async function getFollowupTeamMembers() {
  try {
    const members = await User.find({ role: 'FOLLOW_UP_TEAM' }).sort({ email: 1 });
    return members;
  } catch (error) {
    console.error('Error fetching followup team members:', error);
    return [];
  }
}

/**
 * Assign a request to a followup team member using load balancing
 * Always assigns to the member with the LEAST pending requests
 */
async function assignRequestToFollowup(formId, companyName, hrEmail, hrName) {
  try {
    const followupMembers = await getFollowupTeamMembers();
    
    if (followupMembers.length === 0) {
      throw new Error('No followup team members available');
    }

    // Calculate pending requests for each member
    const memberWorkloads = await Promise.all(
      followupMembers.map(async (member) => {
        const pendingCount = await RequestAssignment.countDocuments({
          assignedTo: member.email,
          status: 'pending'
        });
        
        return {
          member,
          pendingCount
        };
      })
    );

    // Sort by pending count (ascending) - member with least pending requests first
    memberWorkloads.sort((a, b) => a.pendingCount - b.pendingCount);

    // Assign to the member with the least pending requests
    const assignedMember = memberWorkloads[0].member;

    console.log(`📊 Workload distribution before assignment:`);
    memberWorkloads.forEach(({ member, pendingCount }) => {
      const indicator = member.email === assignedMember.email ? '👉' : '  ';
      console.log(`${indicator} ${member.name}: ${pendingCount} pending`);
    });

    // Create the assignment
    const assignment = new RequestAssignment({
      formId,
      companyName,
      hrEmail,
      hrName,
      assignedTo: assignedMember.email,
      status: 'pending'
    });

    await assignment.save();

    // IMPORTANT: Also update the form document with assignedFollowup field
    try {
      await Form.findByIdAndUpdate(formId, {
        assignedFollowup: {
          name: assignedMember.name,
          email: assignedMember.email
        },
        assignedAt: new Date(),
        followupStatus: 'pending'
      });
      console.log(`📝 Updated form ${formId} with assignedFollowup field`);
    } catch (updateError) {
      console.error('⚠️ Failed to update form with assignedFollowup:', updateError);
    }

    console.log(`✅ Assigned ${companyName} (${hrEmail}) to ${assignedMember.name} (${assignedMember.email}) [Now has ${memberWorkloads[0].pendingCount + 1} pending]`);

    return {
      success: true,
      assignment,
      assignedMember: {
        name: assignedMember.name,
        email: assignedMember.email
      }
    };
  } catch (error) {
    console.error('Error assigning request:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all requests assigned to a specific followup member
 */
async function getAssignedRequests(followupEmail) {
  try {
    const assignments = await RequestAssignment.find({
      assignedTo: followupEmail
    }).sort({ createdAt: -1 });

    // Fetch full form details for each assignment
    const requestsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const form = await Form.findById(assignment.formId);
        return {
          _id: assignment._id,
          companyName: assignment.companyName,
          hrEmail: assignment.hrEmail,
          hrName: assignment.hrName,
          status: assignment.status,
          assignedAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
          notes: assignment.notes,
          lastContactDate: assignment.lastContactDate,
          nextFollowupDate: assignment.nextFollowupDate,
          form: form ? {
            _id: form._id,
            companyName: form.companyName,
            hrContacts: form.hrContacts,
            jobDescriptions: form.jobDescriptions,
            hiringStages: form.hiringStages,
            campusVisits: form.campusVisits,
            uploadedFiles: form.uploadedFiles,
            createdAt: form.createdAt
          } : null
        };
      })
    );

    return requestsWithDetails;
  } catch (error) {
    console.error('Error fetching assigned requests:', error);
    throw error;
  }
}

/**
 * Update the status of a request assignment
 */
async function updateRequestStatus(assignmentId, status, notes = null) {
  try {
    const assignment = await RequestAssignment.findById(assignmentId);
    
    if (!assignment) {
      return { success: false, error: 'Assignment not found' };
    }

    assignment.status = status;
    if (notes) {
      assignment.notes = notes;
    }
    
    if (status === 'completed') {
      assignment.lastContactDate = new Date();
    }

    await assignment.save();

    return { success: true, assignment };
  } catch (error) {
    console.error('Error updating request status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get assignment statistics for a followup member
 */
async function getAssignmentStats(followupEmail) {
  try {
    const assignments = await RequestAssignment.find({
      assignedTo: followupEmail
    });

    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const onHold = assignments.filter(a => a.status === 'on_hold').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      completionRate,
      successRate: completionRate // Alias for analytics
    };
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    throw error;
  }
}

module.exports = {
  assignRequestToFollowup,
  getAssignedRequests,
  updateRequestStatus,
  getAssignmentStats,
  getFollowupTeamMembers,
  RequestAssignment
};
