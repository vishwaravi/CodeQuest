# 🚀 CodeQuest Backend

Real-time multiplayer coding battle platform backend built with Node.js, Express, Socket.io, and MongoDB.

## 📦 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   └── testController.js   # Test endpoints
│   ├── middlewares/
│   │   └── errorHandler.js     # Error handling
│   ├── routes/
│   │   └── testRoutes.js       # API routes
│   └── server.js               # Entry point
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- JWT secret
- Port and CORS settings

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Using MongoDB service (Ubuntu/Debian)
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### API Test
```bash
curl http://localhost:5000/api/test
```

## 📡 Socket.io Events

### Client → Server
- `connection` - Automatically fired when client connects

### Server → Client
- `welcome` - Sent immediately after connection with socket ID

## 🔧 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 📝 Next Steps

- [ ] Phase 2: Authentication System
- [ ] Phase 3: Question Management
- [ ] Phase 4: Real-Time Battle Setup
