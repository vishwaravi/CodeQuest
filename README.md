# ⚔️ CodeQuest - Real-Time Coding Battle Platform

A multiplayer coding battle platform where developers compete by solving coding challenges in real-time.

## 🎯 Project Overview

CodeQuest is a full-stack real-time web application that enables two users to:
- Battle each other by solving coding problems live
- See real-time code synchronization
- Execute code against test cases using Judge0 API
- Track wins, losses, and climb leaderboards
- Chat during battles

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Socket.io Client
- Monaco Editor (code editor)
- React Router v6
- Axios

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- MongoDB + Mongoose
- JWT + bcrypt (authentication)
- Judge0 API (code execution)

### Infrastructure
- Docker (optional isolation)
- Redis (optional scaling)

## 📁 Project Structure

```
CODEBATTLE/
├── backend/          # Node.js Express server
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
├── frontend/         # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🧪 Testing Phase 1

1. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   # OR using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```
   You should see:
   ```
   ✅ MongoDB Connected: localhost
   🚀 CodeQuest Backend Server
   🌐 Server: http://localhost:5000
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test Connections**
   - Visit `http://localhost:5173`
   - Click on "Test Connection" in navbar
   - Click "Test API Connection" → Should show success ✅
   - Click "Connect Socket" → Should show connected ⚡
   - Check browser console for logs

## 📊 Development Phases

- [x] **Phase 1** - Project Initialization ✅
- [ ] **Phase 2** - Authentication System
- [ ] **Phase 3** - Question Management
- [ ] **Phase 4** - Real-Time Battle Setup
- [ ] **Phase 5** - Real-Time Code Sync
- [ ] **Phase 6** - Code Execution Engine
- [ ] **Phase 7** - Leaderboard + Profile Stats
- [ ] **Phase 8** - Chat & Spectator Mode
- [ ] **Phase 9** - UI Polish & Deploy

## 🔥 Current Status: Phase 1 Complete

### ✅ What's Working
- Express server with Socket.io
- MongoDB connection
- React app with Tailwind CSS
- API health check endpoints
- Socket.io real-time connection
- Frontend-Backend communication
- Test connection page

### 🎯 Next: Phase 2 - Authentication System
- User registration/login
- JWT token generation
- Protected routes
- Auth context in React

## 📝 API Endpoints (Phase 1)

### REST API
- `GET /health` - Health check
- `GET /api/test` - Test endpoint

### Socket Events
- `connection` - Client connects
- `welcome` - Server sends welcome message
- `disconnect` - Client disconnects

## 🤝 Contributing

This is an iterative learning project. Each phase will be built, tested, and refined before moving forward.

## 📄 License

MIT

---

**Built with ❤️ by Vishwa | Mentored approach to production-grade development**
