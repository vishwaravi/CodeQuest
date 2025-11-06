# 🚀 CodeQuest Frontend

Real-time multiplayer coding battle platform frontend built with React, Vite, and Tailwind CSS.

## 📦 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx         # Navigation component
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   └── TestConnection.jsx  # Connection test page
│   ├── services/
│   │   ├── api.js              # Axios API service
│   │   └── socket.js           # Socket.io service
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles + Tailwind
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development).

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🧪 Testing the Connection

1. Make sure the backend is running on `http://localhost:5000`
2. Navigate to the **Test Connection** page
3. Click **"Test API Connection"** to verify REST endpoints
4. Click **"Connect Socket"** to test Socket.io real-time communication
5. Check browser console for detailed logs

## 🎨 Available Pages

- **/** - Home/Landing page with hero section
- **/test** - Connection testing page

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🎨 Tailwind Utility Classes

Custom utilities defined in `index.css`:

### Buttons
- `btn` - Base button styles
- `btn-primary` - Primary blue button
- `btn-secondary` - Secondary purple button
- `btn-outline` - Outlined button

### Components
- `card` - Card container with dark theme
- `input` - Styled input field

## 📡 Services

### API Service (`services/api.js`)
- Axios instance with interceptors
- Automatic token injection
- Error handling
- Available methods:
  - `healthCheck()`
  - `testApi()`

### Socket Service (`services/socket.js`)
- Singleton Socket.io client
- Auto-reconnection
- Event management
- Methods:
  - `connect()`
  - `disconnect()`
  - `emit(event, data)`
  - `on(event, callback)`

## 📝 Next Steps

- [ ] Phase 2: Authentication UI (Login/Signup forms)
- [ ] Phase 3: Question display components
- [ ] Phase 4: Battle room UI with matchmaking
