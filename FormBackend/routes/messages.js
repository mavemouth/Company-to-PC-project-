const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Get conversation between two users
router.get('/conversation', async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Both user emails are required' });
    }

    // Fetch all messages between these two users (bidirectional)
    const messages = await Message.find({
      $or: [
        { senderEmail: user1, recipientEmail: user2 },
        { senderEmail: user2, recipientEmail: user1 }
      ]
    }).sort({ createdAt: 1 }); // Oldest first

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Get all unique conversation partners
    const sentMessages = await Message.find({ senderEmail: email }).distinct('recipientEmail');
    const receivedMessages = await Message.find({ recipientEmail: email }).distinct('senderEmail');
    
    // Combine and deduplicate
    const conversationPartners = [...new Set([...sentMessages, ...receivedMessages])];

    // Get last message for each conversation
    const conversations = await Promise.all(
      conversationPartners.map(async (partnerEmail) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderEmail: email, recipientEmail: partnerEmail },
            { senderEmail: partnerEmail, recipientEmail: email }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderEmail: partnerEmail,
          recipientEmail: email,
          read: false
        });

        // Get partner details
        const partner = await User.findOne({ email: partnerEmail });

        return {
          partnerEmail,
          partnerName: partner?.name || partnerEmail.split('@')[0],
          partnerRole: partner?.role || 'HR',
          lastMessage: lastMessage?.message || '',
          lastMessageTime: lastMessage?.createdAt || null,
          unreadCount
        };
      })
    );

    // Sort by most recent message
    conversations.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { senderEmail, senderName, senderRole, recipientEmail, recipientName, recipientRole, message } = req.body;

    if (!senderEmail || !recipientEmail || !message) {
      return res.status(400).json({ error: 'Sender, recipient, and message are required' });
    }

    const newMessage = new Message({
      senderEmail,
      senderName: senderName || senderEmail.split('@')[0],
      senderRole: senderRole || 'HR',
      recipientEmail,
      recipientName: recipientName || recipientEmail.split('@')[0],
      recipientRole: recipientRole || 'FOLLOW_UP_TEAM',
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/mark-read', async (req, res) => {
  try {
    const { senderEmail, recipientEmail } = req.body;

    if (!senderEmail || !recipientEmail) {
      return res.status(400).json({ error: 'Sender and recipient emails are required' });
    }

    await Message.updateMany(
      { senderEmail, recipientEmail, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const count = await Message.countDocuments({
      recipientEmail: email,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
