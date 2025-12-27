const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Task = require('../../models/task');

// Get all tasks
router.get('/api/followup/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('company', 'name')
      .sort({ dueDate: 1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create a new task
router.post('/api/followup/tasks', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, companyId } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user.id,
      company: companyId,
      history: [{
        action: 'Task created',
        user: req.user.id
      }]
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('company', 'name');
    
    res.json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update task status
router.put('/api/followup/tasks/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.status = status;
    task.history.push({
      action: `Status updated to ${status}`,
      user: req.user.id
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('company', 'name');
    
    res.json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update task
router.put('/api/followup/tasks/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.priority = priority;
    task.assignedTo = assignedTo;
    task.history.push({
      action: 'Task updated',
      user: req.user.id
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('company', 'name');
    
    res.json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete task
router.delete('/api/followup/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await task.deleteOne();
    
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;