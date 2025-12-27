const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../../../middleware/auth');
const Event = require('../../../models/event');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create a new event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const event = new Event({
      title,
      description,
      date,
      type,
      createdBy: req.user.id
    });

    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');
    
    res.json({ success: true, event: populatedEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if the user is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    event.title = title;
    event.description = description;
    event.date = date;
    event.type = type;

    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');
    
    res.json({ success: true, event: populatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if the user is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await event.deleteOne();
    
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;