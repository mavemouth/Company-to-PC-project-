const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { setupRoutes } = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/requestLogger");
const SocketServer = require("./modules/websocket/socketServer");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
const socketServer = new SocketServer(httpServer);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Connect to MongoDB (same database as FormBackend)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hr_form")
  .then(() => {
    console.log("✅ MongoDB Connected");
    // Load all models
    require("./models");
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👋 WebSocket server initialized`);
});
