import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
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

// CORS Configuration for Production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://code-quest-seven-ochre.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware - Enable CORS for all routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
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
