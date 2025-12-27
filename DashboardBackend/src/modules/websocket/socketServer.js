const { Server } = require('socket.io');

class SocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle authentication
      socket.on('authenticate', (data) => {
        if (data.token) {
          // In a real app, you'd verify the JWT token here
          socket.user = data.user;
          socket.join(`user_${data.user.id}`);
          console.log(`User ${data.user.name} authenticated`);
        }
      });

      // Handle notifications
      socket.on('subscribe_notifications', (userId) => {
        socket.join(`notifications_${userId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  // Method to send notifications to specific users
  sendNotification(userId, notification) {
    this.io.to(`notifications_${userId}`).emit('notification', notification);
  }

  // Method to broadcast to all connected clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Method to send message to specific room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
}

module.exports = SocketServer;