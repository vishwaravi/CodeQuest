import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import { initializeBattleSocket } from './sockets/battleSocket.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io (CORS disabled)
const io = new Server(httpServer);

// Connect to MongoDB
connectDB();

// Middleware (CORS removed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/', testRoutes);
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/battles', battleRoutes);

// Initialize Battle Socket handlers
initializeBattleSocket(io);

// Error Handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Make io accessible to routes (we'll use this later)
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 CodeQuest Backend Server`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`⚡ Socket.io: Ready`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export { io };
